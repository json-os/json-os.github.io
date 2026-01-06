/**
 * Schema.org SoftwareApplication Pane
 * Beautiful rendering of schema:SoftwareApplication
 */

const APP_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>')

export default {
  name: 'schemaSoftwareApplication',
  icon: APP_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('SoftwareApplication').uri] || types[SCHEMA('MobileApplication').uri] || types[SCHEMA('WebApplication').uri]) {
      return 'App'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-software-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
      background: #f8fafc;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const screenshot = store.each(subject, SCHEMA('screenshot'))
    const author = store.any(subject, SCHEMA('author'))
    const applicationCategory = store.anyValue(subject, SCHEMA('applicationCategory'))
    const operatingSystem = store.anyValue(subject, SCHEMA('operatingSystem'))
    const softwareVersion = store.anyValue(subject, SCHEMA('softwareVersion'))
    const fileSize = store.anyValue(subject, SCHEMA('fileSize'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const offers = store.any(subject, SCHEMA('offers'))
    const downloadUrl = store.any(subject, SCHEMA('downloadUrl'))
    const url = store.any(subject, SCHEMA('url'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    `

    // Header with app icon
    const header = dom.createElement('div')
    header.style.cssText = `
      display: flex;
      gap: 24px;
      padding: 32px;
      border-bottom: 1px solid #f1f5f9;
    `

    // App icon
    const iconWrap = dom.createElement('div')
    iconWrap.style.cssText = `
      width: 120px;
      height: 120px;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      flex-shrink: 0;
    `

    if (image) {
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      iconWrap.appendChild(img)
    } else {
      iconWrap.style.cssText += `
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      `
      iconWrap.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: white; fill: none; stroke-width: 1.5;">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        </svg>
      `
    }
    header.appendChild(iconWrap)

    // App info
    const appInfo = dom.createElement('div')
    appInfo.style.cssText = 'flex: 1;'

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
      `
      appInfo.appendChild(h1)
    }

    if (author) {
      const authorName = store.anyValue(author, SCHEMA('name'))
      if (authorName) {
        const authorEl = dom.createElement('div')
        authorEl.textContent = authorName
        authorEl.style.cssText = 'color: #6366f1; font-size: 0.95rem; margin-bottom: 12px;'
        appInfo.appendChild(authorEl)
      }
    }

    // Rating and category
    const meta = dom.createElement('div')
    meta.style.cssText = 'display: flex; align-items: center; gap: 16px; flex-wrap: wrap;'

    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      const ratingCount = store.anyValue(aggregateRating, SCHEMA('ratingCount'))

      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = 'display: flex; align-items: center; gap: 6px;'
        ratingEl.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#fbbf24;stroke:#fbbf24;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style="font-weight: 600; color: #0f172a;">${ratingValue}</span>
          ${ratingCount ? `<span style="color: #94a3b8;">(${ratingCount})</span>` : ''}
        `
        meta.appendChild(ratingEl)
      }
    }

    if (applicationCategory) {
      const cat = dom.createElement('span')
      cat.textContent = applicationCategory
      cat.style.cssText = `
        background: #f1f5f9;
        color: #475569;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 0.85rem;
      `
      meta.appendChild(cat)
    }

    if (meta.children.length > 0) {
      appInfo.appendChild(meta)
    }

    header.appendChild(appInfo)

    // Download button in header
    const downloadWrap = dom.createElement('div')
    downloadWrap.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end; gap: 8px;'

    const getBtn = dom.createElement('a')
    getBtn.href = (downloadUrl || url)?.uri || (downloadUrl || url)?.value || '#'
    getBtn.target = '_blank'
    getBtn.textContent = 'GET'
    getBtn.style.cssText = `
      background: #6366f1;
      color: white;
      padding: 12px 32px;
      border-radius: 24px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: background 0.2s;
    `
    getBtn.onmouseover = () => { getBtn.style.background = '#4f46e5' }
    getBtn.onmouseout = () => { getBtn.style.background = '#6366f1' }
    downloadWrap.appendChild(getBtn)

    if (offers) {
      const price = store.anyValue(offers, SCHEMA('price'))
      const priceEl = dom.createElement('div')
      priceEl.textContent = price === '0' || !price ? 'Free' : '$' + price
      priceEl.style.cssText = 'font-size: 0.85rem; color: #64748b;'
      downloadWrap.appendChild(priceEl)
    }

    header.appendChild(downloadWrap)
    card.appendChild(header)

    // Screenshots
    if (screenshot.length > 0) {
      const ssSection = dom.createElement('div')
      ssSection.style.cssText = `
        padding: 24px 32px;
        border-bottom: 1px solid #f1f5f9;
        overflow-x: auto;
      `

      const ssRow = dom.createElement('div')
      ssRow.style.cssText = 'display: flex; gap: 16px;'

      screenshot.slice(0, 5).forEach(ss => {
        const ssUrl = ss.uri || ss.value
        if (ssUrl) {
          const img = dom.createElement('img')
          img.src = ssUrl
          img.style.cssText = `
            height: 300px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          `
          ssRow.appendChild(img)
        }
      })

      ssSection.appendChild(ssRow)
      card.appendChild(ssSection)
    }

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 32px;'

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 28px 0;
        color: #475569;
        line-height: 1.8;
        font-size: 1rem;
      `
      content.appendChild(desc)
    }

    // Information section
    const infoGrid = dom.createElement('div')
    infoGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 24px;
      padding: 24px;
      background: #f8fafc;
      border-radius: 16px;
    `

    const addInfo = (label, value) => {
      if (value) {
        const item = dom.createElement('div')
        const labelEl = dom.createElement('div')
        labelEl.textContent = label
        labelEl.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
        const valueEl = dom.createElement('div')
        valueEl.textContent = value
        valueEl.style.cssText = 'font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 4px;'
        item.appendChild(labelEl)
        item.appendChild(valueEl)
        infoGrid.appendChild(item)
      }
    }

    addInfo('Version', softwareVersion)
    addInfo('Size', fileSize)
    addInfo('Platform', operatingSystem)
    addInfo('Category', applicationCategory)

    if (infoGrid.children.length > 0) {
      content.appendChild(infoGrid)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}
