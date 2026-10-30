export const DEMONSTRATION_NOTICE = 'DEMONSTRATION — REASONING ENGINE NOT YET IMPLEMENTED'

export const DEMONSTRATION_INTERPRETATION =
  'This sample demonstrates how a future interface could restate the classifier output. It does not explain the model decision, add radiological findings, or provide an independently verified interpretation.'

export const PLANNED_REASONING_CAPABILITIES = [
  {
    title: 'Alternative explanations',
    description: 'Not generated. No reasoning service is connected.',
  },
  {
    title: 'Contradictory evidence',
    description: 'Not assessed. No evidence synthesis is implemented.',
  },
  {
    title: 'Follow-up questions',
    description: 'Not generated. Clinical context is not sent to a reasoning service.',
  },
  {
    title: 'Evidence-based assessment',
    description: 'Unavailable. No evidence retrieval or clinical validation is connected.',
  },
]
