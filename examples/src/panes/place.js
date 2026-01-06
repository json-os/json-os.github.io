/**
 * Schema.org Place Pane
 * Beautiful rendering of schema:Place, TouristAttraction, LandmarksOrHistoricalBuildings
 */

const PLACE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>')

export default {
  name: 'schemaPlace',
  icon: PLACE_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Place').uri] || types[SCHEMA('TouristAttraction').uri] ||
        types[SCHEMA('LandmarksOrHistoricalBuildings').uri] || types[SCHEMA('Park').uri]) {
      return 'Place'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-place-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 0;
      max-width: 100%;
      margin: 0;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const photo = store.each(subject, SCHEMA('photo'))
    const address = store.any(subject, SCHEMA('address'))
    const geo = store.any(subject, SCHEMA('geo'))
    const telephone = store.anyValue(subject, SCHEMA('telephone'))
    const openingHours = store.anyValue(subject, SCHEMA('openingHours'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const url = store.any(subject, SCHEMA('url'))

    // Hero image
    const hero = dom.createElement('div')
    hero.style.cssText = `
      position: relative;
      height: 400px;
      overflow: hidden;
    `

    if (image) {
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      hero.appendChild(img)
    } else {
      hero.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    }

    // Gradient overlay
    const overlay = dom.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
    `
    hero.appendChild(overlay)

    // Hero content
    const heroContent = dom.createElement('div')
    heroContent.style.cssText = `
      position: absolute;
      bottom: 32px;
      left: 32px;
      right: 32px;
    `

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `
      heroContent.appendChild(h1)
    }

    // Rating
    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      const reviewCount = store.anyValue(aggregateRating, SCHEMA('reviewCount'))

      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = 'display: flex; align-items: center; gap: 8px;'

        const stars = dom.createElement('div')
        stars.style.cssText = 'display: flex; gap: 2px;'
        const rating = parseFloat(ratingValue)
        for (let i = 0; i < 5; i++) {
          const star = dom.createElement('span')
          star.innerHTML = i < Math.floor(rating)
            ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#fbbf24;stroke:#fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:rgba(255,255,255,0.5);stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          stars.appendChild(star)
        }
        ratingEl.appendChild(stars)

        const ratingText = dom.createElement('span')
        ratingText.textContent = ratingValue + (reviewCount ? ` (${reviewCount} reviews)` : '')
        ratingText.style.cssText = 'color: rgba(255,255,255,0.9); font-size: 0.95rem;'
        ratingEl.appendChild(ratingText)

        heroContent.appendChild(ratingEl)
      }
    }

    hero.appendChild(heroContent)
    div.appendChild(hero)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = `
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
    `

    // Quick info cards
    const infoCards = dom.createElement('div')
    infoCards.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    `

    // Address card
    if (address) {
      const streetAddress = store.anyValue(address, SCHEMA('streetAddress'))
      const locality = store.anyValue(address, SCHEMA('addressLocality'))
      const region = store.anyValue(address, SCHEMA('addressRegion'))
      const postalCode = store.anyValue(address, SCHEMA('postalCode'))
      const country = store.anyValue(address, SCHEMA('addressCountry'))

      const addrText = [streetAddress, locality, region, postalCode, country].filter(Boolean).join(', ')
      if (addrText) {
        const card = dom.createElement('div')
        card.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        `
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#2563eb;fill:none;stroke-width:2;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Address</div>
          </div>
          <div style="color: #1e293b; line-height: 1.5;">${addrText}</div>
        `
        infoCards.appendChild(card)
      }
    }

    // Phone card
    if (telephone) {
      const card = dom.createElement('div')
      card.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      `
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 40px; height: 40px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#16a34a;fill:none;stroke-width:2;">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Phone</div>
        </div>
        <a href="tel:${telephone}" style="color: #1e293b; text-decoration: none; font-weight: 500;">${telephone}</a>
      `
      infoCards.appendChild(card)
    }

    // Hours card
    if (openingHours) {
      const card = dom.createElement('div')
      card.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      `
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 40px; height: 40px; background: #fef3c7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#d97706;fill:none;stroke-width:2;">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Hours</div>
        </div>
        <div style="color: #1e293b;">${openingHours}</div>
      `
      infoCards.appendChild(card)
    }

    if (infoCards.children.length > 0) {
      content.appendChild(infoCards)
    }

    // Description
    if (description) {
      const descSection = dom.createElement('div')
      descSection.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 20px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        margin-bottom: 32px;
      `

      const h2 = dom.createElement('h2')
      h2.textContent = 'About'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
      `
      descSection.appendChild(h2)

      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: #64748b;
        line-height: 1.8;
        font-size: 1rem;
      `
      descSection.appendChild(desc)
      content.appendChild(descSection)
    }

    // Photo gallery
    if (photo.length > 0) {
      const gallery = dom.createElement('div')
      gallery.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      `

      photo.slice(0, 6).forEach(p => {
        const photoUrl = p.uri || p.value || store.anyValue(p, SCHEMA('contentUrl'))
        if (photoUrl) {
          const img = dom.createElement('img')
          img.src = photoUrl
          img.style.cssText = `
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s;
          `
          img.onmouseover = () => { img.style.transform = 'scale(1.02)' }
          img.onmouseout = () => { img.style.transform = 'scale(1)' }
          gallery.appendChild(img)
        }
      })

      if (gallery.children.length > 0) {
        content.appendChild(gallery)
      }
    }

    // Map placeholder (if geo coordinates)
    if (geo) {
      const lat = store.anyValue(geo, SCHEMA('latitude'))
      const lon = store.anyValue(geo, SCHEMA('longitude'))

      if (lat && lon) {
        const mapCard = dom.createElement('div')
        mapCard.style.cssText = `
          background: #e2e8f0;
          border-radius: 16px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        `
        mapCard.innerHTML = `
          <div style="text-align: center; color: #64748b;">
            <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:currentColor;fill:none;stroke-width:1.5;margin-bottom:8px;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>${lat}, ${lon}</div>
          </div>
        `
        content.appendChild(mapCard)
      }
    }

    // Visit button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Visit Website'
      btn.style.cssText = `
        display: inline-block;
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
      content.appendChild(btn)
    }

    div.appendChild(content)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(placePane)
}

if (typeof window !== 'undefined') {
  window.SchemaPlacePane = placePane
}
