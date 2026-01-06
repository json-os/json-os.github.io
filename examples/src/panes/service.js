/**
 * Schema.org Service Pane
 * Beautiful rendering of schema:Service
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

const SERVICE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>')

const servicePane = {
  name: 'schemaService',
  icon: SERVICE_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Service').uri] || types[SCHEMA('FinancialService').uri] ||
        types[SCHEMA('ProfessionalService').uri]) {
      return 'Service'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-service-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
      background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const provider = store.any(subject, SCHEMA('provider'))
    const serviceType = store.anyValue(subject, SCHEMA('serviceType'))
    const areaServed = store.any(subject, SCHEMA('areaServed'))
    const offers = store.any(subject, SCHEMA('offers'))
    const hasOfferCatalog = store.any(subject, SCHEMA('hasOfferCatalog'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const termsOfService = store.any(subject, SCHEMA('termsOfService'))
    const url = store.any(subject, SCHEMA('url'))

    // Header section
    const header = dom.createElement('div')
    header.style.cssText = `
      text-align: center;
      margin-bottom: 48px;
    `

    // Service icon
    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = `
        width: 100px;
        height: 100px;
        border-radius: 24px;
        overflow: hidden;
        margin: 0 auto 24px;
        box-shadow: 0 8px 32px rgba(14, 165, 233, 0.2);
      `
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      imgWrap.appendChild(img)
      header.appendChild(imgWrap)
    } else {
      const iconWrap = dom.createElement('div')
      iconWrap.style.cssText = `
        width: 100px;
        height: 100px;
        border-radius: 24px;
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        margin: 0 auto 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px rgba(14, 165, 233, 0.3);
      `
      iconWrap.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: white; fill: none; stroke-width: 1.5;">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      `
      header.appendChild(iconWrap)
    }

    // Service type badge
    if (serviceType) {
      const badge = dom.createElement('div')
      badge.textContent = serviceType
      badge.style.cssText = `
        display: inline-block;
        background: #e0f2fe;
        color: #0369a1;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 16px;
      `
      header.appendChild(badge)
    }

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #0f172a;
      `
      header.appendChild(h1)
    }

    // Provider
    if (provider) {
      const providerName = store.anyValue(provider, SCHEMA('name'))
      if (providerName) {
        const providerEl = dom.createElement('div')
        providerEl.textContent = 'by ' + providerName
        providerEl.style.cssText = 'color: #64748b; font-size: 1.1rem;'
        header.appendChild(providerEl)
      }
    }

    // Rating
    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      const reviewCount = store.anyValue(aggregateRating, SCHEMA('reviewCount'))

      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        `

        const stars = dom.createElement('div')
        stars.style.cssText = 'display: flex; gap: 2px;'
        const rating = parseFloat(ratingValue)
        for (let i = 0; i < 5; i++) {
          const star = dom.createElement('span')
          star.innerHTML = i < Math.floor(rating)
            ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#fbbf24;stroke:#fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#d1d5db;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          stars.appendChild(star)
        }
        ratingEl.appendChild(stars)

        const ratingText = dom.createElement('span')
        ratingText.textContent = ratingValue + (reviewCount ? ` (${reviewCount} reviews)` : '')
        ratingText.style.cssText = 'color: #64748b; font-size: 0.95rem;'
        ratingEl.appendChild(ratingText)

        header.appendChild(ratingEl)
      }
    }

    div.appendChild(header)

    // Description card
    if (description) {
      const descCard = dom.createElement('div')
      descCard.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 32px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        margin-bottom: 24px;
      `

      const h2 = dom.createElement('h2')
      h2.textContent = 'About This Service'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #0f172a;
      `
      descCard.appendChild(h2)

      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: #475569;
        line-height: 1.8;
        font-size: 1rem;
      `
      descCard.appendChild(desc)
      div.appendChild(descCard)
    }

    // Pricing section
    if (offers) {
      const price = store.anyValue(offers, SCHEMA('price'))
      const currency = store.anyValue(offers, SCHEMA('priceCurrency')) || 'USD'
      const priceSpec = store.anyValue(offers, SCHEMA('priceSpecification'))

      if (price || priceSpec) {
        const priceCard = dom.createElement('div')
        priceCard.style.cssText = `
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          text-align: center;
        `

        const label = dom.createElement('div')
        label.textContent = 'Starting at'
        label.style.cssText = 'color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;'
        priceCard.appendChild(label)

        const priceEl = dom.createElement('div')
        priceEl.textContent = currency === 'USD' ? '$' + price : price + ' ' + currency
        priceEl.style.cssText = `
          font-size: 3rem;
          font-weight: 700;
          color: white;
        `
        priceCard.appendChild(priceEl)

        div.appendChild(priceCard)
      }
    }

    // Area served
    if (areaServed) {
      const areaName = store.anyValue(areaServed, SCHEMA('name')) || areaServed.value || areaServed.uri
      if (areaName) {
        const areaCard = dom.createElement('div')
        areaCard.style.cssText = `
          background: white;
          border-radius: 20px;
          padding: 24px 32px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        `

        areaCard.innerHTML = `
          <div style="width: 48px; height: 48px; background: #f0f9ff; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#0ea5e9;fill:none;stroke-width:2;">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 0.85rem; color: #64748b;">Service Area</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: #0f172a;">${areaName}</div>
          </div>
        `

        div.appendChild(areaCard)
      }
    }

    // CTA section
    const cta = dom.createElement('div')
    cta.style.cssText = `
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    `

    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Get Started'
      btn.style.cssText = `
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        padding: 16px 40px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.4)'
      }
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)'
        btn.style.boxShadow = 'none'
      }
      cta.appendChild(btn)
    }

    if (termsOfService) {
      const termsLink = dom.createElement('a')
      termsLink.href = termsOfService.uri || termsOfService.value
      termsLink.target = '_blank'
      termsLink.textContent = 'Terms of Service'
      termsLink.style.cssText = `
        color: #64748b;
        padding: 16px 24px;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
      `
      cta.appendChild(termsLink)
    }

    if (cta.children.length > 0) {
      div.appendChild(cta)
    }

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(servicePane)
}

if (typeof window !== 'undefined') {
  window.SchemaServicePane = servicePane
}

})();
