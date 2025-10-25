// backend/src/controllers/zohoRecruitController.js
import { getCandidateFields } from '../services/zohoRecruitService.js'

export async function fetchCandidateFields(req, res) {
  try {
    const fields = await getCandidateFields()
    res.json({
      count: fields.length,
      fields: fields.map(f => ({
        api_name: f.api_name,
        data_type: f.data_type,
        field_label: f.field_label,
        required: f.required || false,
      })),
    })
  } catch (err) {
    console.error('[Zoho] getCandidateFields failed:', err)
    res.status(500).json({ error: err.message })
  }
}
