/**
 * Schema.org Book Pane
 * Beautiful rendering of schema:Book
 */

const BOOK_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>')

export default {
  name: 'schemaBook',
  icon: BOOK_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Book').uri]) {
      return 'Book'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-book-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const author = store.any(subject, SCHEMA('author'))
    const isbn = store.anyValue(subject, SCHEMA('isbn'))
    const numberOfPages = store.anyValue(subject, SCHEMA('numberOfPages'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const publisher = store.any(subject, SCHEMA('publisher'))
    const genre = store.anyValue(subject, SCHEMA('genre'))
    const inLanguage = store.anyValue(subject, SCHEMA('inLanguage'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const url = store.any(subject, SCHEMA('url'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(146, 64, 14, 0.15);
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 0;
    `

    // Book cover section
    const coverSection = dom.createElement('div')
    coverSection.style.cssText = `
      background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = `
        position: relative;
        transform: perspective(800px) rotateY(-5deg);
        transition: transform 0.3s;
      `
      imgWrap.onmouseover = () => { imgWrap.style.transform = 'perspective(800px) rotateY(0deg)' }
      imgWrap.onmouseout = () => { imgWrap.style.transform = 'perspective(800px) rotateY(-5deg)' }

      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        width: 200px;
        height: 300px;
        object-fit: cover;
        border-radius: 4px;
        box-shadow: 10px 10px 30px rgba(0,0,0,0.4);
      `
      imgWrap.appendChild(img)

      // Spine effect
      const spine = dom.createElement('div')
      spine.style.cssText = `
        position: absolute;
        left: -10px;
        top: 0;
        bottom: 0;
        width: 10px;
        background: linear-gradient(90deg, #451a03 0%, #78350f 100%);
        border-radius: 2px 0 0 2px;
      `
      imgWrap.appendChild(spine)

      coverSection.appendChild(imgWrap)
    } else {
      const placeholder = dom.createElement('div')
      placeholder.style.cssText = `
        width: 200px;
        height: 300px;
        background: #fef3c7;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      placeholder.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 60px; height: 60px; stroke: #92400e; fill: none; stroke-width: 1.5;">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      `
      coverSection.appendChild(placeholder)
    }

    card.appendChild(coverSection)

    // Info section
    const info = dom.createElement('div')
    info.style.cssText = 'padding: 40px;'

    // Genre badge
    if (genre) {
      const badge = dom.createElement('div')
      badge.textContent = genre
      badge.style.cssText = `
        display: inline-block;
        background: #fef3c7;
        color: #92400e;
        padding: 6px 14px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 16px;
      `
      info.appendChild(badge)
    }

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #1c1917;
        line-height: 1.2;
        font-family: 'Georgia', serif;
      `
      info.appendChild(h1)
    }

    // Author
    if (author) {
      const authorName = store.anyValue(author, SCHEMA('name'))
      if (authorName) {
        const authorEl = dom.createElement('div')
        authorEl.textContent = 'by ' + authorName
        authorEl.style.cssText = `
          font-size: 1.1rem;
          color: #78350f;
          margin-bottom: 20px;
          font-style: italic;
        `
        info.appendChild(authorEl)
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
          gap: 8px;
          margin-bottom: 24px;
        `

        const stars = dom.createElement('div')
        stars.style.cssText = 'display: flex; gap: 2px;'
        const rating = parseFloat(ratingValue)
        for (let i = 0; i < 5; i++) {
          const star = dom.createElement('span')
          star.innerHTML = i < Math.floor(rating)
            ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#f59e0b;stroke:#f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:#d1d5db;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          stars.appendChild(star)
        }
        ratingEl.appendChild(stars)

        const ratingText = dom.createElement('span')
        ratingText.textContent = ratingValue + (reviewCount ? ` (${reviewCount} reviews)` : '')
        ratingText.style.cssText = 'font-size: 0.9rem; color: #78350f;'
        ratingEl.appendChild(ratingText)

        info.appendChild(ratingEl)
      }
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 28px 0;
        color: #57534e;
        line-height: 1.8;
        font-size: 1rem;
      `
      info.appendChild(desc)
    }

    // Details grid
    const details = []
    if (numberOfPages) details.push({ label: 'Pages', value: numberOfPages })
    if (isbn) details.push({ label: 'ISBN', value: isbn })
    if (inLanguage) details.push({ label: 'Language', value: inLanguage })
    if (datePublished) {
      const d = new Date(datePublished)
      details.push({ label: 'Published', value: d.getFullYear().toString() })
    }
    if (publisher) {
      const pubName = store.anyValue(publisher, SCHEMA('name'))
      if (pubName) details.push({ label: 'Publisher', value: pubName })
    }

    if (details.length > 0) {
      const detailsEl = dom.createElement('div')
      detailsEl.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        padding: 24px;
        background: #fafaf9;
        border-radius: 16px;
        margin-bottom: 28px;
      `

      details.forEach(detail => {
        const item = dom.createElement('div')
        const label = dom.createElement('div')
        label.textContent = detail.label
        label.style.cssText = 'font-size: 0.75rem; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.05em;'
        const value = dom.createElement('div')
        value.textContent = detail.value
        value.style.cssText = 'font-size: 0.95rem; color: #1c1917; font-weight: 500; margin-top: 4px;'
        item.appendChild(label)
        item.appendChild(value)
        detailsEl.appendChild(item)
      })

      info.appendChild(detailsEl)
    }

    // Buy button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Get This Book'
      btn.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
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
        btn.style.boxShadow = '0 8px 20px rgba(146, 64, 14, 0.4)'
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
