/**
 * Schema.org LocalBusiness Pane
 * Beautiful rendering of schema:LocalBusiness, Restaurant, Store, etc.
 */

const BUSINESS_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>')

export default {
  name: 'schemaLocalBusiness',
  icon: BUSINESS_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('LocalBusiness').uri] || types[SCHEMA('Restaurant').uri] ||
        types[SCHEMA('Store').uri] || types[SCHEMA('FoodEstablishment').uri]) {
      return 'Business'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-localbusiness-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const address = store.any(subject, SCHEMA('address'))
    const telephone = store.anyValue(subject, SCHEMA('telephone'))
    const email = store.anyValue(subject, SCHEMA('email'))
    const url = store.any(subject, SCHEMA('url'))
    const openingHours = store.anyValue(subject, SCHEMA('openingHours'))
    const priceRange = store.anyValue(subject, SCHEMA('priceRange'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const servesCuisine = store.anyValue(subject, SCHEMA('servesCuisine'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    `

    // Hero image
    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = 'position: relative; height: 200px; overflow: hidden;'
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      imgWrap.appendChild(img)

      // Overlay gradient
      const overlay = dom.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(transparent, rgba(0,0,0,0.5));
      `
      imgWrap.appendChild(overlay)

      card.appendChild(imgWrap)
    }

    const content = dom.createElement('div')
    content.style.cssText = 'padding: 28px;'

    // Name and rating row
    const header = dom.createElement('div')
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;'

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      `
      header.appendChild(h1)
    }

    // Rating badge
    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      if (ratingValue) {
        const badge = dom.createElement('div')
        badge.style.cssText = `
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fef3c7;
          padding: 6px 12px;
          border-radius: 20px;
        `
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#f59e0b;stroke:#f59e0b;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style="font-weight: 600; color: #92400e; font-size: 0.9rem;">${ratingValue}</span>
        `
        header.appendChild(badge)
      }
    }

    content.appendChild(header)

    // Tags row (cuisine, price range)
    const tags = dom.createElement('div')
    tags.style.cssText = 'display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;'

    if (servesCuisine) {
      const tag = dom.createElement('span')
      tag.textContent = servesCuisine
      tag.style.cssText = `
        background: #dbeafe;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 500;
      `
      tags.appendChild(tag)
    }

    if (priceRange) {
      const tag = dom.createElement('span')
      tag.textContent = priceRange
      tag.style.cssText = `
        background: #dcfce7;
        color: #166534;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 500;
      `
      tags.appendChild(tag)
    }

    if (tags.children.length > 0) {
      content.appendChild(tags)
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 24px 0;
        color: #64748b;
        line-height: 1.6;
        font-size: 0.95rem;
      `
      content.appendChild(desc)
    }

    // Info list
    const infoList = dom.createElement('div')
    infoList.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;'

    const addInfoItem = (icon, text, href) => {
      const item = dom.createElement(href ? 'a' : 'div')
      if (href) {
        item.href = href
        item.target = '_blank'
      }
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        color: ${href ? '#0ea5e9' : '#475569'};
        text-decoration: none;
        font-size: 0.9rem;
      `
      item.innerHTML = `
        <div style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
          ${icon}
        </div>
        <span>${text}</span>
      `
      infoList.appendChild(item)
    }

    // Address
    if (address) {
      const streetAddress = store.anyValue(address, SCHEMA('streetAddress'))
      const locality = store.anyValue(address, SCHEMA('addressLocality'))
      const region = store.anyValue(address, SCHEMA('addressRegion'))
      const postalCode = store.anyValue(address, SCHEMA('postalCode'))

      let addrText = [streetAddress, locality, region, postalCode].filter(Boolean).join(', ')
      if (addrText) {
        addInfoItem(
          '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#64748b;fill:none;stroke-width:2;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
          addrText
        )
      }
    }

    if (telephone) {
      addInfoItem(
        '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#64748b;fill:none;stroke-width:2;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        telephone,
        'tel:' + telephone
      )
    }

    if (email) {
      addInfoItem(
        '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#64748b;fill:none;stroke-width:2;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        email,
        'mailto:' + email
      )
    }

    if (openingHours) {
      addInfoItem(
        '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#64748b;fill:none;stroke-width:2;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        openingHours
      )
    }

    if (infoList.children.length > 0) {
      content.appendChild(infoList)
    }

    // Action buttons
    if (url) {
      const actions = dom.createElement('div')
      actions.style.cssText = 'display: flex; gap: 12px;'

      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Visit Website'
      btn.style.cssText = `
        flex: 1;
        text-align: center;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: white;
        padding: 14px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
      `
      actions.appendChild(btn)

      content.appendChild(actions)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}
