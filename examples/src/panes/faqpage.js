/**
 * Schema.org FAQPage Pane
 * Beautiful rendering of schema:FAQPage
 */

const FAQ_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>')

export default {
  name: 'schemaFAQPage',
  icon: FAQ_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('FAQPage').uri]) {
      return 'FAQ'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-faq-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background: #f0fdf4;
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const mainEntity = store.each(subject, SCHEMA('mainEntity'))

    // Header
    const header = dom.createElement('div')
    header.style.cssText = `
      text-align: center;
      margin-bottom: 48px;
    `

    // Icon
    const iconWrap = dom.createElement('div')
    iconWrap.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 64px; height: 64px; stroke: #16a34a; fill: none; stroke-width: 1.5;">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    `
    iconWrap.style.cssText = 'margin-bottom: 20px;'
    header.appendChild(iconWrap)

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #14532d;
      `
      header.appendChild(h1)
    }

    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: #166534;
        font-size: 1.1rem;
        max-width: 600px;
        margin: 0 auto;
      `
      header.appendChild(desc)
    }

    div.appendChild(header)

    // FAQ items
    if (mainEntity.length > 0) {
      const faqList = dom.createElement('div')
      faqList.style.cssText = 'display: flex; flex-direction: column; gap: 16px;'

      mainEntity.forEach((q, index) => {
        const questionText = store.anyValue(q, SCHEMA('name'))
        const acceptedAnswer = store.any(q, SCHEMA('acceptedAnswer'))
        const answerText = acceptedAnswer ? store.anyValue(acceptedAnswer, SCHEMA('text')) : null

        if (questionText) {
          const item = dom.createElement('div')
          item.style.cssText = `
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(22, 163, 74, 0.1);
          `

          // Question
          const questionEl = dom.createElement('div')
          questionEl.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 24px;
            cursor: pointer;
            transition: background 0.2s;
          `

          const qNum = dom.createElement('div')
          qNum.textContent = 'Q'
          qNum.style.cssText = `
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
          `
          questionEl.appendChild(qNum)

          const qText = dom.createElement('div')
          qText.textContent = questionText
          qText.style.cssText = `
            flex: 1;
            font-weight: 600;
            color: #14532d;
            font-size: 1.1rem;
            line-height: 1.5;
          `
          questionEl.appendChild(qText)

          const chevron = dom.createElement('div')
          chevron.innerHTML = `
            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: #16a34a; fill: none; stroke-width: 2; transition: transform 0.3s;">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          `
          chevron.style.cssText = 'flex-shrink: 0;'
          questionEl.appendChild(chevron)

          item.appendChild(questionEl)

          // Answer
          if (answerText) {
            const answerEl = dom.createElement('div')
            answerEl.style.cssText = `
              display: flex;
              gap: 16px;
              padding: 0 24px 24px 24px;
              border-top: 1px solid #dcfce7;
            `

            const aNum = dom.createElement('div')
            aNum.textContent = 'A'
            aNum.style.cssText = `
              width: 36px;
              height: 36px;
              background: #f0fdf4;
              color: #16a34a;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              flex-shrink: 0;
              margin-top: 20px;
            `
            answerEl.appendChild(aNum)

            const aText = dom.createElement('div')
            aText.textContent = answerText
            aText.style.cssText = `
              flex: 1;
              color: #475569;
              line-height: 1.8;
              margin-top: 20px;
            `
            answerEl.appendChild(aText)

            item.appendChild(answerEl)
          }

          faqList.appendChild(item)
        }
      })

      div.appendChild(faqList)
    }

    return div
  }
}
