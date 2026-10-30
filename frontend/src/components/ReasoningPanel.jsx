import React, { useState } from 'react'
import {
  DEMONSTRATION_INTERPRETATION,
  DEMONSTRATION_NOTICE,
  PLANNED_REASONING_CAPABILITIES,
} from '../data/reasoningPrototype'

const INITIAL_CLINICAL_INFO = {
  symptoms: '',
  duration: '',
  medicalHistory: '',
  oxygenSaturation: '',
  bodyTemperature: '',
  observations: '',
}

function EvidenceStatus({ status, children }) {
  return (
    <span className={`evidence-status ${status}`} aria-label={status}>
      {children}
    </span>
  )
}

export default function ReasoningPanel({ result }) {
  const [clinicalInfo, setClinicalInfo] = useState(INITIAL_CLINICAL_INFO)
  const hasDemoInfo = Object.values(clinicalInfo).some((value) => value.trim())

  if (!result) return null

  function updateField(event) {
    const { name, value } = event.target
    setClinicalInfo((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="reasoning-panel" aria-labelledby="reasoning-title">
      <div className="demonstration-notice" role="note">
        <span className="demo-notice-mark" aria-hidden="true">DEMO</span>
        <strong>{DEMONSTRATION_NOTICE}</strong>
      </div>

      <details className="reasoning-disclosure">
        <summary className="reasoning-heading">
          <div>
            <span className="eyebrow">Prototype workspace</span>
            <h3 id="reasoning-title" className="reasoning-title">Interpretation &amp; evidence</h3>
          </div>
          <span className="reasoning-summary-meta">
            <span className="prototype-badge">Prototype</span>
            <span className="reasoning-toggle" aria-hidden="true" />
          </span>
        </summary>

        <div className="reasoning-content">
          <section className="reasoning-subsection" aria-labelledby="interpretation-title">
            <div className="reasoning-subheading">
              <h4 id="interpretation-title">Interpretation</h4>
              <EvidenceStatus status="demo">Demonstration</EvidenceStatus>
            </div>
            <p className="interpretation-copy">
              The CNN classification is {result.prediction}. {DEMONSTRATION_INTERPRETATION}
            </p>
            <p className="interpretation-source">
              Classification above is backend output. The accompanying interpretation text is static prototype content.
            </p>
          </section>

          <section className="reasoning-subsection" aria-labelledby="evidence-title">
        <div className="reasoning-subheading">
          <h4 id="evidence-title">Supporting evidence</h4>
          <span className="section-meta">Availability</span>
        </div>
        <div className="evidence-list">
          <div className="evidence-row">
            <div>
              <span className="evidence-title">Model classification</span>
              <span className="evidence-detail">{result?.prediction || 'Awaiting image analysis'}</span>
            </div>
            <EvidenceStatus status={result ? 'available' : 'pending'}>
              {result ? 'Available' : 'Awaiting'}
            </EvidenceStatus>
          </div>
          <div className="evidence-row">
            <div>
              <span className="evidence-title">Image visualisation</span>
              <span className="evidence-detail">
                {result?.heatmap ? 'Handcrafted OpenCV visualization' : 'No visualization returned yet'}
              </span>
            </div>
            <EvidenceStatus status={result?.heatmap ? 'limited' : 'pending'}>
              {result?.heatmap ? 'Available · limited' : 'Awaiting'}
            </EvidenceStatus>
          </div>
          <div className="evidence-row">
            <div>
              <span className="evidence-title">Clinical information</span>
              <span className="evidence-detail">
                {hasDemoInfo ? 'Entered locally for UI demonstration only' : 'Not available to the classifier'}
              </span>
            </div>
            <EvidenceStatus status="unavailable">
              {hasDemoInfo ? 'Not sent to model' : 'Unavailable'}
            </EvidenceStatus>
          </div>
          <div className="evidence-row">
            <div>
              <span className="evidence-title">Clinical validation</span>
              <span className="evidence-detail">No validation evidence is provided by this prototype</span>
            </div>
            <EvidenceStatus status="unavailable">Unavailable</EvidenceStatus>
          </div>
          <div className="evidence-row">
            <div>
              <span className="evidence-title">Backend summary text</span>
              <span className="evidence-detail">Rule-based narrative is not treated as verified interpretation</span>
            </div>
            <EvidenceStatus status="limited">Not shown</EvidenceStatus>
          </div>
        </div>
          </section>

          <section className="uncertainty-section" aria-labelledby="uncertainty-title">
        <div className="reasoning-subheading">
          <h4 id="uncertainty-title">Uncertainty &amp; limitations</h4>
          <span className="section-meta">Current system</span>
        </div>
        <ul className="limitation-list">
          <li><span>Uncalibrated model confidence</span><EvidenceStatus status="limited">Not calibrated</EvidenceStatus></li>
          <li><span>Clinical context is not part of inference</span><EvidenceStatus status="unavailable">Missing</EvidenceStatus></li>
          <li><span>OpenCV heatmap is not a validated localization map</span><EvidenceStatus status="limited">Limited</EvidenceStatus></li>
          <li><span>Clinical validation has not been established here</span><EvidenceStatus status="unavailable">Unavailable</EvidenceStatus></li>
        </ul>
          </section>

          <section className="clinical-demo-section" aria-labelledby="clinical-demo-title">
        <div className="reasoning-subheading">
          <div>
            <h4 id="clinical-demo-title">Additional information</h4>
            <p className="subsection-description">Example inputs a future version could accept.</p>
          </div>
          <EvidenceStatus status="demo">Local demo only</EvidenceStatus>
        </div>
        <p className="clinical-demo-notice">
          These fields stay in this browser session. They are not sent to Flask and do not change the CNN prediction.
        </p>
        <div className="clinical-fields">
          <label className="clinical-field">
            <span>Symptoms</span>
            <input name="symptoms" value={clinicalInfo.symptoms} onChange={updateField} placeholder="e.g. cough" />
          </label>
          <label className="clinical-field">
            <span>Symptom duration</span>
            <input name="duration" value={clinicalInfo.duration} onChange={updateField} placeholder="e.g. 3 days" />
          </label>
          <label className="clinical-field">
            <span>Medical history</span>
            <input name="medicalHistory" value={clinicalInfo.medicalHistory} onChange={updateField} placeholder="Optional demo entry" />
          </label>
          <label className="clinical-field">
            <span>Oxygen saturation (%)</span>
            <input
              name="oxygenSaturation"
              type="number"
              min="0"
              max="100"
              value={clinicalInfo.oxygenSaturation}
              onChange={updateField}
              placeholder="—"
            />
          </label>
          <label className="clinical-field">
            <span>Body temperature (°C)</span>
            <input
              name="bodyTemperature"
              type="number"
              step="0.1"
              value={clinicalInfo.bodyTemperature}
              onChange={updateField}
              placeholder="—"
            />
          </label>
          <label className="clinical-field clinical-field-wide">
            <span>Other clinical observations</span>
            <textarea
              name="observations"
              rows="2"
              value={clinicalInfo.observations}
              onChange={updateField}
              placeholder="Optional demonstration notes"
            />
          </label>
        </div>
          </section>

          <section className="future-section" aria-labelledby="future-title">
        <div className="reasoning-subheading">
          <h4 id="future-title">Future reasoning capabilities</h4>
          <span className="section-meta">Not implemented</span>
        </div>
        <div className="future-capability-grid">
          {PLANNED_REASONING_CAPABILITIES.map(({ title, description }) => (
            <article className="future-capability" key={title}>
              <div className="future-capability-heading">
                <h5>{title}</h5>
                <EvidenceStatus status="pending">Planned</EvidenceStatus>
              </div>
              <p>{description}</p>
            </article>
          ))}
        </div>
          </section>
        </div>
      </details>
    </section>
  )
}
