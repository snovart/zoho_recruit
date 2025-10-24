// frontend/src/constants/application.js
// ------------------------------------------------------------
// Static literals and option lists used by the 2-step application form.
// Keep this file dumb: only values (no side effects).
// ------------------------------------------------------------

// --- Step titles ---------------------------------------------------------
export const APP_TEXT = {
  newTitle: 'New Application',
  stepper: ['Step 1', 'Step 2'],
  actions: {
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    saving: 'Saving draft…',
    saved: 'Draft saved',
  },
  success: {
    created: 'Application submitted successfully.',
  },
};

// --- Field labels --------------------------------------------------------
export const FIELDS = {
  // Step 1
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone',
  address: 'Current address',
  dateOfBirth: 'Date of birth',
  position: 'Position applied for',
  resume: 'Resume / CV',
  linkedin: 'LinkedIn URL',

  // Step 2
  education: 'Education level',
  yearsExp: 'Years of experience',
  skills: 'Skills',
  prevEmployer: 'Previous employer',
  currentTitle: 'Current job title',
  notice: 'Notice period',
  expectedSalary: 'Expected salary',
  interviewAt: 'Availability for interview',
  preferredLocation: 'Preferred location',
  coverLetter: 'Cover letter',
  source: 'How did you hear about us?',
};

// --- Validation messages -------------------------------------------------
export const ERRORS = {
  required: 'This field is required.',
  invalidEmail: 'Enter a valid email.',
  invalidUrl: 'Enter a valid URL.',
  invalidDate: 'Enter a valid date.',
  fileRequired: 'Please upload your resume.',
};

// --- Option lists (value/label) -----------------------------------------
export const POSITION_OPTIONS = [
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'data_analyst', label: 'Data Analyst' },
  { value: 'qa_engineer', label: 'QA Engineer' },
  { value: 'ux_designer', label: 'UX Designer' },
  { value: 'project_manager', label: 'Project Manager' },
];

export const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'associates_degree', label: "Associate's Degree" },
  { value: 'bachelors_degree', label: "Bachelor's Degree" },
  { value: 'masters_degree', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate' },
];

export const NOTICE_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
  { value: 'more_than_1_month', label: 'More than 1 month' },
];

export const LOCATION_OPTIONS = [
  { value: 'new_york', label: 'New York' },
  { value: 'san_francisco', label: 'San Francisco' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'austin', label: 'Austin' },
  { value: 'remote', label: 'Remote' },
];

export const SOURCE_OPTIONS = [
  { value: 'company_website', label: 'Company website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'job_board', label: 'Job board' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

// --- Skills per position (basic suggestion list) ------------------------
// Used to show relevant suggestions when a position is selected.
export const SKILL_SUGGESTIONS = {
  software_engineer: [
    'JavaScript',
    'Python',
    'SQL',
    'Java',
    'C#',
    'React',
    'Node.js',
    'AWS',
    'Docker',
    'Kubernetes',
  ],
  data_analyst: [
    'SQL',
    'Python',
    'R',
    'Excel',
    'Tableau',
    'PowerBI',
    'SAS',
    'MATLAB',
  ],
  qa_engineer: [
    'Test Automation',
    'Selenium',
    'JIRA',
    'TestRail',
    'Performance Testing',
  ],
  ux_designer: [
    'Sketch',
    'Figma',
    'Adobe XD',
    'User Research',
    'Prototyping',
    'Wireframing',
  ],
  project_manager: [
    'Agile',
    'Scrum',
    'Project Planning',
    'Risk Management',
    'Budgeting',
  ],
};

// --- Step 1 required keys ------------------------------------------------
export const STEP1_REQUIRED = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'current_address',
  'date_of_birth',
  'position_applied_for',
  'resume_path', // must be set after upload
];

// --- Step 2 required keys ------------------------------------------------
export const STEP2_REQUIRED = [
  'education_level',
  'years_of_experience',
  'notice_period',
  'source_of_application',
];

// Key used for draft persistence in storage
export const DRAFT_STORAGE_KEY = 'zr:application:draft';
