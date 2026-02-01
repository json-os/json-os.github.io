/**
 * Schema.org MedicalTest Pane
 * Renders medical lab results with status indicators
 */

const ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>')

export default {
  name: 'schemaMedicalTest',

  icon: ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dominated = context.dom.querySelector('.schema-medicaltest-pane')
    if (dominated) return null

    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('MedicalTest').uri] || types[SCHEMA('MedicalTestPanel').uri]) {
      return 'Medical Test'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-medicaltest-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const dateCreated = store.anyValue(subject, SCHEMA('dateCreated'))
    const provider = store.any(subject, SCHEMA('provider'))
    const subTests = store.each(subject, SCHEMA('subTest'))

    // Main card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    `

    // Header
    const header = dom.createElement('div')
    header.style.cssText = `
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      padding: 32px;
      color: white;
    `

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      `
      header.appendChild(h1)
    }

    // Provider and date
    const meta = dom.createElement('div')
    meta.style.cssText = `
      margin-top: 8px;
      opacity: 0.9;
      font-size: 0.9rem;
    `
    const parts = []
    if (provider) {
      const providerName = store.anyValue(provider, SCHEMA('name'))
      if (providerName) parts.push(providerName)
    }
    if (dateCreated) parts.push(dateCreated)
    if (parts.length > 0) {
      meta.textContent = parts.join(' • ')
      header.appendChild(meta)
    }

    card.appendChild(header)

    // Description
    if (description) {
      const descDiv = dom.createElement('div')
      descDiv.style.cssText = `
        padding: 16px 32px;
        background: #f0f9ff;
        color: #0369a1;
        font-size: 0.9rem;
      `
      descDiv.textContent = description
      card.appendChild(descDiv)
    }

    // Test results
    if (subTests.length > 0) {
      const resultsDiv = dom.createElement('div')
      resultsDiv.style.cssText = 'padding: 8px 0;'

      subTests.forEach((test, index) => {
        const testName = store.anyValue(test, SCHEMA('name'))
        const altName = store.anyValue(test, SCHEMA('alternateName'))
        const result = store.anyValue(test, SCHEMA('result'))
        const normalRange = store.anyValue(test, SCHEMA('normalRange'))
        const status = store.anyValue(test, SCHEMA('status'))

        const row = dom.createElement('div')
        row.style.cssText = `
          display: flex;
          align-items: center;
          padding: 16px 32px;
          ${index < subTests.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}
        `

        // Test name
        const nameDiv = dom.createElement('div')
        nameDiv.style.cssText = 'flex: 1;'

        const nameText = dom.createElement('div')
        nameText.textContent = testName || 'Unknown Test'
        nameText.style.cssText = 'font-weight: 500; color: #1e293b;'
        nameDiv.appendChild(nameText)

        if (altName) {
          const altText = dom.createElement('div')
          altText.textContent = altName
          altText.style.cssText = 'font-size: 0.8rem; color: #64748b;'
          nameDiv.appendChild(altText)
        }

        row.appendChild(nameDiv)

        // Result value
        if (result) {
          const valueDiv = dom.createElement('div')
          valueDiv.textContent = result
          valueDiv.style.cssText = `
            font-weight: 600;
            font-size: 1rem;
            margin-right: 16px;
            ${status === 'normal' ? 'color: #16a34a;' : ''}
            ${status === 'high' ? 'color: #d97706;' : ''}
            ${status === 'low' ? 'color: #dc2626;' : ''}
          `
          row.appendChild(valueDiv)
        }

        // Normal range
        if (normalRange) {
          const rangeDiv = dom.createElement('div')
          rangeDiv.textContent = normalRange
          rangeDiv.style.cssText = `
            font-size: 0.8rem;
            color: #64748b;
            min-width: 100px;
            text-align: right;
            margin-right: 16px;
          `
          row.appendChild(rangeDiv)
        }

        // Status indicator
        const statusDiv = dom.createElement('div')
        const statusColors = {
          'normal': { bg: '#dcfce7', text: '#16a34a', icon: '✓' },
          'high': { bg: '#fef3c7', text: '#d97706', icon: '↑' },
          'low': { bg: '#fee2e2', text: '#dc2626', icon: '↓' }
        }
        const s = statusColors[status] || statusColors['normal']
        statusDiv.textContent = s.icon
        statusDiv.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          background: ${s.bg};
          color: ${s.text};
        `
        row.appendChild(statusDiv)

        resultsDiv.appendChild(row)
      })

      card.appendChild(resultsDiv)
    }

    // Footer with legend
    const footer = dom.createElement('div')
    footer.style.cssText = `
      padding: 16px 32px;
      background: #f8fafc;
      display: flex;
      gap: 24px;
      justify-content: center;
      font-size: 0.75rem;
      color: #64748b;
    `
    ;[
      { icon: '✓', label: 'Normal', color: '#16a34a' },
      { icon: '↑', label: 'High', color: '#d97706' },
      { icon: '↓', label: 'Low', color: '#dc2626' }
    ].forEach(item => {
      const legend = dom.createElement('div')
      legend.style.cssText = 'display: flex; align-items: center; gap: 6px;'
      const icon = dom.createElement('span')
      icon.textContent = item.icon
      icon.style.cssText = `color: ${item.color}; font-weight: bold;`
      const label = dom.createElement('span')
      label.textContent = item.label
      legend.appendChild(icon)
      legend.appendChild(label)
      footer.appendChild(legend)
    })
    card.appendChild(footer)

    div.appendChild(card)
    return div
  }
}
