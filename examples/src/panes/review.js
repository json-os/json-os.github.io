/**
 * Schema.org Review Pane
 * Beautiful rendering of schema:Review
 */

const REVIEW_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>')

export default {
  name: 'schemaReview',
  icon: REVIEW_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Review').uri]) {
      return 'Review'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-review-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const reviewBody = store.anyValue(subject, SCHEMA('reviewBody'))
    const author = store.any(subject, SCHEMA('author'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const reviewRating = store.any(subject, SCHEMA('reviewRating'))
    const itemReviewed = store.any(subject, SCHEMA('itemReviewed'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    `

    // Quote icon
    const quoteIcon = dom.createElement('div')
    quoteIcon.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: #e0f2fe; stroke: none;">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
      </svg>
    `
    card.appendChild(quoteIcon)

    // Rating
    if (reviewRating) {
      const ratingValue = store.anyValue(reviewRating, SCHEMA('ratingValue'))
      const bestRating = store.anyValue(reviewRating, SCHEMA('bestRating')) || '5'

      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
        `

        const stars = dom.createElement('div')
        stars.style.cssText = 'display: flex; gap: 4px;'
        const rating = parseFloat(ratingValue)
        const max = parseInt(bestRating)

        for (let i = 0; i < max; i++) {
          const star = dom.createElement('span')
          star.innerHTML = i < Math.floor(rating)
            ? '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fbbf24;stroke:#fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            : '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:none;stroke:#d1d5db;stroke-width:2;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          stars.appendChild(star)
        }
        ratingEl.appendChild(stars)

        const ratingText = dom.createElement('span')
        ratingText.textContent = `${ratingValue}/${bestRating}`
        ratingText.style.cssText = 'font-size: 1rem; color: #64748b; font-weight: 500;'
        ratingEl.appendChild(ratingText)

        card.appendChild(ratingEl)
      }
    }

    // Review title
    if (name) {
      const title = dom.createElement('h2')
      title.textContent = name
      title.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
      `
      card.appendChild(title)
    }

    // Review body
    if (reviewBody) {
      const body = dom.createElement('p')
      body.textContent = reviewBody
      body.style.cssText = `
        margin: 0 0 24px 0;
        color: #475569;
        line-height: 1.8;
        font-size: 1.05rem;
      `
      card.appendChild(body)
    }

    // Item reviewed
    if (itemReviewed) {
      const itemName = store.anyValue(itemReviewed, SCHEMA('name'))
      if (itemName) {
        const itemEl = dom.createElement('div')
        itemEl.style.cssText = `
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 24px;
        `
        const label = dom.createElement('div')
        label.textContent = 'Reviewed'
        label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;'
        const itemNameEl = dom.createElement('div')
        itemNameEl.textContent = itemName
        itemNameEl.style.cssText = 'font-size: 1rem; color: #1e293b; font-weight: 600;'
        itemEl.appendChild(label)
        itemEl.appendChild(itemNameEl)
        card.appendChild(itemEl)
      }
    }

    // Author and date
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    `

    if (author) {
      const authorName = store.anyValue(author, SCHEMA('name'))
      const authorImage = store.any(author, SCHEMA('image'))

      if (authorName) {
        const authorEl = dom.createElement('div')
        authorEl.style.cssText = 'display: flex; align-items: center; gap: 12px;'

        if (authorImage) {
          const img = dom.createElement('img')
          img.src = authorImage.uri || authorImage.value
          img.style.cssText = 'width: 44px; height: 44px; border-radius: 50%; object-fit: cover;'
          authorEl.appendChild(img)
        } else {
          const avatar = dom.createElement('div')
          avatar.textContent = authorName.charAt(0).toUpperCase()
          avatar.style.cssText = `
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
          `
          authorEl.appendChild(avatar)
        }

        const authorInfo = dom.createElement('div')
        const nameEl = dom.createElement('div')
        nameEl.textContent = authorName
        nameEl.style.cssText = 'font-weight: 600; color: #1e293b;'
        authorInfo.appendChild(nameEl)

        if (datePublished) {
          const dateEl = dom.createElement('div')
          const d = new Date(datePublished)
          dateEl.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          dateEl.style.cssText = 'font-size: 0.85rem; color: #94a3b8;'
          authorInfo.appendChild(dateEl)
        }

        authorEl.appendChild(authorInfo)
        meta.appendChild(authorEl)
      }
    }

    card.appendChild(meta)
    div.appendChild(card)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(reviewPane)
}

if (typeof window !== 'undefined') {
  window.SchemaReviewPane = reviewPane
}
