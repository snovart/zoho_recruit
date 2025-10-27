// backend/src/services/zohoRecruitService.js
// Zoho Recruit API client (EU-ready)
// - refreshes access_token using refresh_token
// - calls Recruit v2 endpoints with required headers (Authorization + orgId)
// - verbose error messages for easier debugging

import fs from 'node:fs'
import path from 'node:path'

const REGION = process.env.ZOHO_REGION || 'eu'
const CLIENT_ID = process.env.ZOHO_CLIENT_ID
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN
const ORG_ID = process.env.ZOHO_ORG_ID // e.g. 2010XXXXXXXX

const TOKEN_URL = `https://accounts.zoho.${REGION}/oauth/v2/token`
const API_BASE  = `https://recruit.zoho.${REGION}/recruit/v2`

let cached = { token: null, exp: 0 }

async function getAccessToken () {
  const now = Date.now()
  if (cached.token && now < cached.exp - 60_000) return cached.token

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`[Zoho] token refresh failed ${res.status}: ${text}`)
  }

  let json
  try { json = JSON.parse(text) }
  catch { throw new Error(`[Zoho] token refresh returned non-JSON: ${text.slice(0,400)}`) }

  if (!json.access_token) {
    throw new Error(`[Zoho] token refresh missing access_token: ${text}`)
  }

  cached.token = json.access_token
  cached.exp   = now + (Number(json.expires_in || 3600) * 1000)
  return cached.token
}

async function zohoRequest (method, pathUrl, { headers = {}, json, body } = {}) {
  const token = await getAccessToken()
  const url   = `${API_BASE}${pathUrl}`

  const finalHeaders = {
    Authorization: `Zoho-oauthtoken ${token}`,
    orgId: ORG_ID,
    ...headers,
  }

  const opts = { method, headers: finalHeaders }

  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(json)
  } else if (body !== undefined) {
    // When body is Web FormData, do not set Content-Type manually (fetch will set boundary)
    opts.body = body
  }

  const res = await fetch(url, opts)
  const resText = await res.text()

  if (!res.ok) {
    throw new Error(
      `[Zoho] ${method} ${pathUrl} failed ${res.status} : ${resText.slice(0, 800)}`
    )
  }

  try { return JSON.parse(resText) }
  catch { return resText }
}

/* ----------------------------- helpers ----------------------------------- */
// safe numeric casting (string -> number or undefined)
function toNumber (v) {
  if (v === null || v === undefined) return undefined
  const n = Number(String(v).toString().replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

// join array skills -> textarea
function joinSkills (arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined
  return arr.join(', ')
}

// merge several textual bits into Additional Info
function mergeAdditionalInfo (...parts) {
  const clean = parts
    .map(p => (p ?? '').toString().trim())
    .filter(Boolean)
  return clean.length ? clean.join(' | ') : undefined
}
/* ------------------------------------------------------------------------- */

/**
 * Create a Candidate in Zoho Recruit.
 * Returns created record id (string).
 *
 * Maps as many form fields as possible to Zoho Candidate fields:
 *  - first_name, last_name -> First_Name, Last_Name (mandatory)
 *  - email -> Email
 *  - phone -> Mobile
 *  - preferred_location -> City
 *  - source_of_application -> Source
 *  - years_of_experience -> Experience_in_Years (double)
 *  - previous_employer -> Current_Employer
 *  - current_job_title -> Current_Job_Title
 *  - expected_salary -> Expected_Salary (currency)
 *  - skills (array) -> Skill_Set (textarea, comma-separated)
 *  - linkedin_profile -> LinkedIn__s
 *
 * Things without direct standard fields (date_of_birth, position_applied_for,
 * education_level, notice_period, availability_for_interview, current_address)
 * are concatenated into Additional_Info so the data is not lost.
 */
export async function createCandidate (candidate) {
  // Build Zoho record with graceful fallbacks and types
  const record = {
    // mandatory in Zoho
    Last_Name: candidate.last_name || candidate.first_name || 'Unknown',

    // straightforward mappings
    First_Name: candidate.first_name || undefined,
    Email: candidate.email || undefined,
    Mobile: candidate.phone || undefined,
    City: candidate.preferred_location || undefined,
    Source: candidate.source_of_application || undefined,
    LinkedIn__s: candidate.linkedin_profile || undefined,

    // numeric fields
    Experience_in_Years: toNumber(candidate.years_of_experience),
    Expected_Salary: toNumber(candidate.expected_salary),

    // employment-related
    Current_Employer: candidate.previous_employer || undefined,
    Current_Job_Title: candidate.current_job_title || undefined,

    // skills textarea
    Skill_Set: joinSkills(candidate.skills),

    // keep extra info so nothing is lost
    Additional_Info: mergeAdditionalInfo(
      candidate.position_applied_for ? `Position: ${candidate.position_applied_for}` : '',
      candidate.education_level ? `Education: ${candidate.education_level}` : '',
      candidate.notice_period ? `Notice period: ${candidate.notice_period}` : '',
      candidate.availability_for_interview ? `Availability: ${candidate.availability_for_interview}` : '',
      candidate.date_of_birth ? `DOB: ${candidate.date_of_birth}` : '',
      candidate.current_address ? `Address: ${candidate.current_address}` : '',
      candidate.cover_letter ? `Cover letter:\n${candidate.cover_letter}` : ','
    ),
  }

  const payload = {
    data: [record],
    trigger: ['workflow'],
  }

  const resp = await zohoRequest('POST', '/Candidates', { json: payload })
  const id = resp?.data?.[0]?.details?.id
  if (!id) {
    throw new Error(
      `[Zoho] createCandidate: unexpected response: ${JSON.stringify(resp).slice(0, 500)}`
    )
  }
  return id
}

/**
 * Upload an attachment (resume) to Candidate.
 * If file path is missing or not found, this is a no-op.
 */
export async function uploadCandidateAttachment (candidateId, absFilePath) {
  if (!absFilePath || !fs.existsSync(absFilePath)) return

  const stat = fs.statSync(absFilePath)
  if (!stat.isFile() || stat.size === 0) return

  const filename = path.basename(absFilePath)
  const buffer   = fs.readFileSync(absFilePath)

  // Web FormData + Blob so Node's fetch sets multipart boundary correctly
  const form = new FormData()
  // REQUIRED by Zoho Recruit for candidate attachments (e.g. "Resume" or "Other")
  form.append('attachments_category', 'Resume')
  form.append('file', new Blob([buffer]), filename)

  await zohoRequest('POST', `/Candidates/${candidateId}/Attachments`, {
    body: form,
  })
}

/**
 * Fetch all field metadata for the Candidates module.
 * Returns array of fields with name, data_type, label, and other info.
 */
export async function getCandidateFields() {
  const data = await zohoRequest('GET', '/settings/fields?module=Candidates')
  return data?.fields || []
}
