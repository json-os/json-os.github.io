/**
 * Schema.org Product Pane
 * Beautiful rendering of schema:Product
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

const PRODUCT_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>')

const productPane = {
  name: 'schemaProduct',
  icon: PRODUCT_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Product').uri] || types[SCHEMA('IndividualProduct').uri]) {
      return 'Product'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-product-pane'
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
    const brand = store.any(subject, SCHEMA('brand'))
    const offers = store.any(subject, SCHEMA('offers'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const sku = store.anyValue(subject, SCHEMA('sku'))
    const color = store.anyValue(subject, SCHEMA('color'))
    const material = store.anyValue(subject, SCHEMA('material'))
    const url = store.any(subject, SCHEMA('url'))

    // Main card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    `

    // Image section
    const imageSection = dom.createElement('div')
    imageSection.style.cssText = `
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    `

    if (image) {
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        max-width: 100%;
        max-height: 320px;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      `
      imageSection.appendChild(img)
    } else {
      const placeholder = dom.createElement('div')
      placeholder.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; stroke: #94a3b8; fill: none; stroke-width: 1.5;">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      `
      imageSection.appendChild(placeholder)
    }
    card.appendChild(imageSection)

    // Info section
    const info = dom.createElement('div')
    info.style.cssText = 'padding: 40px;'

    // Brand
    if (brand) {
      const brandName = store.anyValue(brand, SCHEMA('name')) || (brand.value ? brand.value.split('/').pop() : '')
      if (brandName) {
        const brandEl = dom.createElement('div')
        brandEl.textContent = brandName
        brandEl.style.cssText = `
          font-size: 0.85rem;
          font-weight: 600;
          color: #0ea5e9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        `
        info.appendChild(brandEl)
      }
    }

    // Name
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.3;
      `
      info.appendChild(h1)
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
          gap: 8px;
          margin-bottom: 20px;
        `

        const stars = dom.createElement('div')
        stars.style.cssText = 'display: flex; gap: 2px;'
        const rating = parseFloat(ratingValue)
        for (let i = 0; i < 5; i++) {
          const star = dom.createElement('span')
          star.innerHTML = i < Math.floor(rating)
            ? '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#fbbf24;stroke:#fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#d1d5db;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          stars.appendChild(star)
        }
        ratingEl.appendChild(stars)

        const ratingText = dom.createElement('span')
        ratingText.textContent = ratingValue + (reviewCount ? ` (${reviewCount} reviews)` : '')
        ratingText.style.cssText = 'font-size: 0.9rem; color: #64748b;'
        ratingEl.appendChild(ratingText)

        info.appendChild(ratingEl)
      }
    }

    // Price
    if (offers) {
      const price = store.anyValue(offers, SCHEMA('price'))
      const currency = store.anyValue(offers, SCHEMA('priceCurrency')) || '$'
      const availability = store.anyValue(offers, SCHEMA('availability'))

      if (price) {
        const priceEl = dom.createElement('div')
        priceEl.style.cssText = 'margin-bottom: 24px;'

        const priceValue = dom.createElement('span')
        priceValue.textContent = currency === 'USD' ? '$' + price : price + ' ' + currency
        priceValue.style.cssText = `
          font-size: 2rem;
          font-weight: 700;
          color: #059669;
        `
        priceEl.appendChild(priceValue)

        if (availability) {
          const avail = dom.createElement('span')
          const inStock = availability.includes('InStock')
          avail.textContent = inStock ? ' In Stock' : ' Out of Stock'
          avail.style.cssText = `
            margin-left: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            color: ${inStock ? '#059669' : '#dc2626'};
          `
          priceEl.appendChild(avail)
        }

        info.appendChild(priceEl)
      }
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 24px 0;
        color: #475569;
        line-height: 1.7;
        font-size: 0.95rem;
      `
      info.appendChild(desc)
    }

    // Specs
    const specs = []
    if (sku) specs.push({ label: 'SKU', value: sku })
    if (color) specs.push({ label: 'Color', value: color })
    if (material) specs.push({ label: 'Material', value: material })

    if (specs.length > 0) {
      const specsEl = dom.createElement('div')
      specsEl.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 24px;
      `

      specs.forEach(spec => {
        const item = dom.createElement('div')
        const label = dom.createElement('div')
        label.textContent = spec.label
        label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
        const value = dom.createElement('div')
        value.textContent = spec.value
        value.style.cssText = 'font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 4px;'
        item.appendChild(label)
        item.appendChild(value)
        specsEl.appendChild(item)
      })

      info.appendChild(specsEl)
    }

    // Buy button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'View Product'
      btn.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.4)'
      }
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)'
        btn.style.boxShadow = 'none'
      }
      info.appendChild(btn)
    }

    card.appendChild(info)
    div.appendChild(card)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(productPane)
}

if (typeof window !== 'undefined') {
  window.SchemaProductPane = productPane
}

})();
