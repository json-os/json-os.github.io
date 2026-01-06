/**
 * Schema.org HowTo Pane
 * Beautiful rendering of schema:HowTo (tutorials, guides, instructions)
 */

const HOWTO_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>')

export default {
  name: 'schemaHowTo',
  icon: HOWTO_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('HowTo').uri]) {
      return 'How-To'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-howto-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #fdf4ff 0%, #faf5ff 100%);
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const totalTime = store.anyValue(subject, SCHEMA('totalTime'))
    const estimatedCost = store.any(subject, SCHEMA('estimatedCost'))
    const supply = store.each(subject, SCHEMA('supply'))
    const tool = store.each(subject, SCHEMA('tool'))
    const step = store.each(subject, SCHEMA('step'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(147, 51, 234, 0.1);
    `

    // Hero
    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = 'position: relative; height: 240px;'
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      imgWrap.appendChild(img)

      // Gradient overlay
      const overlay = dom.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(transparent, rgba(0,0,0,0.6));
      `
      imgWrap.appendChild(overlay)

      card.appendChild(imgWrap)
    }

    const content = dom.createElement('div')
    content.style.cssText = 'padding: 32px;'

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #1e1b4b;
      `
      content.appendChild(h1)
    }

    // Meta row (time, cost)
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    `

    if (totalTime) {
      const timeEl = dom.createElement('div')
      timeEl.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        color: #7c3aed;
        font-weight: 500;
      `
      // Parse ISO duration
      const match = totalTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
      let timeText = totalTime
      if (match) {
        const h = match[1] ? parseInt(match[1]) : 0
        const m = match[2] ? parseInt(match[2]) : 0
        timeText = h > 0 ? `${h}h ${m}m` : `${m} min`
      }
      timeEl.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>${timeText}</span>
      `
      meta.appendChild(timeEl)
    }

    if (estimatedCost) {
      const costValue = store.anyValue(estimatedCost, SCHEMA('value')) || store.anyValue(estimatedCost, SCHEMA('price'))
      const currency = store.anyValue(estimatedCost, SCHEMA('currency')) || store.anyValue(estimatedCost, SCHEMA('priceCurrency')) || '$'
      if (costValue) {
        const costEl = dom.createElement('div')
        costEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          color: #059669;
          font-weight: 500;
        `
        costEl.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>${currency === 'USD' ? '$' : currency}${costValue}</span>
        `
        meta.appendChild(costEl)
      }
    }

    if (meta.children.length > 0) {
      content.appendChild(meta)
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 32px 0;
        color: #64748b;
        line-height: 1.7;
        font-size: 1rem;
      `
      content.appendChild(desc)
    }

    // Supplies and tools
    if (supply.length > 0 || tool.length > 0) {
      const reqSection = dom.createElement('div')
      reqSection.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 32px;
      `

      if (supply.length > 0) {
        const supplyBox = dom.createElement('div')
        supplyBox.style.cssText = `
          background: #fef3c7;
          padding: 20px;
          border-radius: 16px;
        `
        const supplyTitle = dom.createElement('h3')
        supplyTitle.textContent = 'Supplies'
        supplyTitle.style.cssText = `
          margin: 0 0 12px 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        `
        supplyBox.appendChild(supplyTitle)

        const supplyList = dom.createElement('ul')
        supplyList.style.cssText = 'margin: 0; padding: 0 0 0 20px; color: #78350f;'
        supply.forEach(s => {
          const li = dom.createElement('li')
          li.textContent = store.anyValue(s, SCHEMA('name')) || s.value || s.uri
          li.style.cssText = 'margin-bottom: 6px;'
          supplyList.appendChild(li)
        })
        supplyBox.appendChild(supplyList)
        reqSection.appendChild(supplyBox)
      }

      if (tool.length > 0) {
        const toolBox = dom.createElement('div')
        toolBox.style.cssText = `
          background: #dbeafe;
          padding: 20px;
          border-radius: 16px;
        `
        const toolTitle = dom.createElement('h3')
        toolTitle.textContent = 'Tools'
        toolTitle.style.cssText = `
          margin: 0 0 12px 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        `
        toolBox.appendChild(toolTitle)

        const toolList = dom.createElement('ul')
        toolList.style.cssText = 'margin: 0; padding: 0 0 0 20px; color: #1e3a8a;'
        tool.forEach(t => {
          const li = dom.createElement('li')
          li.textContent = store.anyValue(t, SCHEMA('name')) || t.value || t.uri
          li.style.cssText = 'margin-bottom: 6px;'
          toolList.appendChild(li)
        })
        toolBox.appendChild(toolList)
        reqSection.appendChild(toolBox)
      }

      content.appendChild(reqSection)
    }

    // Steps
    if (step.length > 0) {
      const stepsSection = dom.createElement('div')

      const stepsTitle = dom.createElement('h2')
      stepsTitle.textContent = 'Steps'
      stepsTitle.style.cssText = `
        margin: 0 0 24px 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e1b4b;
      `
      stepsSection.appendChild(stepsTitle)

      step.forEach((s, i) => {
        const stepName = store.anyValue(s, SCHEMA('name'))
        const stepText = store.anyValue(s, SCHEMA('text'))
        const stepImage = store.any(s, SCHEMA('image'))

        const stepEl = dom.createElement('div')
        stepEl.style.cssText = `
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        `

        // Step number
        const numEl = dom.createElement('div')
        numEl.textContent = i + 1
        numEl.style.cssText = `
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
        `
        stepEl.appendChild(numEl)

        const stepContent = dom.createElement('div')
        stepContent.style.cssText = 'flex: 1;'

        if (stepName) {
          const h3 = dom.createElement('h3')
          h3.textContent = stepName
          h3.style.cssText = `
            margin: 0 0 8px 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e1b4b;
          `
          stepContent.appendChild(h3)
        }

        if (stepText) {
          const p = dom.createElement('p')
          p.textContent = stepText
          p.style.cssText = `
            margin: 0;
            color: #64748b;
            line-height: 1.7;
          `
          stepContent.appendChild(p)
        }

        if (stepImage) {
          const img = dom.createElement('img')
          img.src = stepImage.uri || stepImage.value
          img.style.cssText = `
            margin-top: 16px;
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          `
          stepContent.appendChild(img)
        }

        stepEl.appendChild(stepContent)
        stepsSection.appendChild(stepEl)
      })

      content.appendChild(stepsSection)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(howtoPane)
}

if (typeof window !== 'undefined') {
  window.SchemaHowToPane = howtoPane
}
