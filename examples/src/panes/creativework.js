/**
 * Schema.org CreativeWork Pane
 * Generic fallback for creative works that don't match specific types
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

const WORK_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>')

const creativeWorkPane = {
  name: 'schemaCreativeWork',
  icon: WORK_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    // Generic CreativeWork - lower priority than specific types
    if (types[SCHEMA('CreativeWork').uri] || types[SCHEMA('WebPage').uri] ||
        types[SCHEMA('Photograph').uri] || types[SCHEMA('Painting').uri] ||
        types[SCHEMA('Sculpture').uri] || types[SCHEMA('VisualArtwork').uri]) {
      return 'Work'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-creativework-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const author = store.any(subject, SCHEMA('author'))
    const creator = store.any(subject, SCHEMA('creator'))
    const dateCreated = store.anyValue(subject, SCHEMA('dateCreated'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const keywords = store.anyValue(subject, SCHEMA('keywords'))
    const genre = store.anyValue(subject, SCHEMA('genre'))
    const license = store.any(subject, SCHEMA('license'))
    const copyrightHolder = store.any(subject, SCHEMA('copyrightHolder'))
    const copyrightYear = store.anyValue(subject, SCHEMA('copyrightYear'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const url = store.any(subject, SCHEMA('url'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    `

    // Image
    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = 'position: relative;'
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        width: 100%;
        max-height: 500px;
        object-fit: contain;
        background: #f8fafc;
        display: block;
      `
      imgWrap.appendChild(img)
      card.appendChild(imgWrap)
    }

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 40px;'

    // Genre badge
    if (genre) {
      const badge = dom.createElement('div')
      badge.textContent = genre
      badge.style.cssText = `
        display: inline-block;
        background: #f3e8ff;
        color: #7c3aed;
        padding: 6px 14px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 16px;
      `
      content.appendChild(badge)
    }

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.3;
      `
      content.appendChild(h1)
    }

    // Creator info
    const creatorNode = author || creator
    if (creatorNode) {
      const creatorName = store.anyValue(creatorNode, SCHEMA('name'))
      const creatorImage = store.any(creatorNode, SCHEMA('image'))

      if (creatorName) {
        const creatorEl = dom.createElement('div')
        creatorEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        `

        if (creatorImage) {
          const img = dom.createElement('img')
          img.src = creatorImage.uri || creatorImage.value
          img.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
          `
          creatorEl.appendChild(img)
        } else {
          const avatar = dom.createElement('div')
          avatar.textContent = creatorName.charAt(0).toUpperCase()
          avatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
          `
          creatorEl.appendChild(avatar)
        }

        const infoEl = dom.createElement('div')
        const byline = dom.createElement('div')
        byline.textContent = 'Created by'
        byline.style.cssText = 'font-size: 0.8rem; color: #94a3b8; margin-bottom: 2px;'
        const nameEl = dom.createElement('div')
        nameEl.textContent = creatorName
        nameEl.style.cssText = 'font-weight: 600; color: #1e293b;'
        infoEl.appendChild(byline)
        infoEl.appendChild(nameEl)
        creatorEl.appendChild(infoEl)

        content.appendChild(creatorEl)
      }
    }

    // Rating
    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
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
        ratingText.textContent = ratingValue
        ratingText.style.cssText = 'color: #64748b; font-size: 0.95rem;'
        ratingEl.appendChild(ratingText)

        content.appendChild(ratingEl)
      }
    }

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

    // Keywords
    if (keywords) {
      const tags = dom.createElement('div')
      tags.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 28px;
      `

      keywords.split(',').forEach(keyword => {
        const tag = dom.createElement('span')
        tag.textContent = keyword.trim()
        tag.style.cssText = `
          background: #f1f5f9;
          color: #475569;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 0.85rem;
        `
        tags.appendChild(tag)
      })

      content.appendChild(tags)
    }

    // Metadata
    const meta = []
    if (dateCreated || datePublished) {
      const d = new Date(dateCreated || datePublished)
      meta.push({ label: 'Created', value: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) })
    }
    if (copyrightYear) {
      meta.push({ label: 'Copyright', value: copyrightYear })
    }
    if (copyrightHolder) {
      const holderName = store.anyValue(copyrightHolder, SCHEMA('name'))
      if (holderName) {
        meta.push({ label: 'Rights', value: holderName })
      }
    }
    if (license) {
      const licenseName = store.anyValue(license, SCHEMA('name')) || 'Licensed'
      meta.push({ label: 'License', value: licenseName })
    }

    if (meta.length > 0) {
      const metaEl = dom.createElement('div')
      metaEl.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 20px;
        padding: 24px;
        background: #f8fafc;
        border-radius: 16px;
        margin-bottom: 28px;
      `

      meta.forEach(item => {
        const itemEl = dom.createElement('div')
        const label = dom.createElement('div')
        label.textContent = item.label
        label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
        const value = dom.createElement('div')
        value.textContent = item.value
        value.style.cssText = 'font-size: 0.95rem; color: #1e293b; font-weight: 500; margin-top: 4px;'
        itemEl.appendChild(label)
        itemEl.appendChild(value)
        metaEl.appendChild(itemEl)
      })

      content.appendChild(metaEl)
    }

    // View button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'View Work'
      btn.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)'
      }
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)'
        btn.style.boxShadow = 'none'
      }
      content.appendChild(btn)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(creativeWorkPane)
}

if (typeof window !== 'undefined') {
  window.SchemaCreativeWorkPane = creativeWorkPane
}

})();
