/**
 * Schema.org Article Pane
 * Beautiful rendering of schema:Article
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

// Simple inline SVG icon as data URI
const ARTICLE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>')

const articlePane = {
  name: 'schemaArticle',

  icon: ARTICLE_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const dominated = context.dom.querySelector('.schema-article-pane')
    if (dominated) return null

    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Article').uri] || types[SCHEMA('BlogPosting').uri] || types[SCHEMA('NewsArticle').uri]) {
      return 'Article'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-article-pane'
    div.style.cssText = `
      font-family: 'Georgia', 'Times New Roman', serif;
      padding: 48px 24px;
      max-width: 720px;
      margin: 0 auto;
      background: #fafafa;
      min-height: 100vh;
    `

    // Get properties
    const headline = store.anyValue(subject, SCHEMA('headline')) || store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const articleBody = store.anyValue(subject, SCHEMA('articleBody'))
    const image = store.any(subject, SCHEMA('image'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const dateModified = store.anyValue(subject, SCHEMA('dateModified'))
    const author = store.any(subject, SCHEMA('author'))
    const publisher = store.any(subject, SCHEMA('publisher'))
    const keywords = store.anyValue(subject, SCHEMA('keywords'))
    const url = store.any(subject, SCHEMA('url'))

    // Article container
    const article = dom.createElement('article')
    article.style.cssText = `
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
    `

    // Hero image
    if (image) {
      const imgWrap = dom.createElement('div')
      imgWrap.style.cssText = `
        position: relative;
        overflow: hidden;
      `
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        width: 100%;
        height: 400px;
        object-fit: cover;
        display: block;
      `
      imgWrap.appendChild(img)
      article.appendChild(imgWrap)
    }

    // Content wrapper with good padding
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 48px;'

    // Category / Publisher badge
    if (publisher) {
      const pubName = store.anyValue(publisher, SCHEMA('name'))
      if (pubName) {
        const badge = dom.createElement('div')
        badge.textContent = pubName
        badge.style.cssText = `
          display: inline-block;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 6px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 24px;
        `
        content.appendChild(badge)
      }
    }

    // Headline
    if (headline) {
      const h1 = dom.createElement('h1')
      h1.textContent = headline
      h1.style.cssText = `
        margin: 0 0 24px 0;
        font-size: 2.75rem;
        font-weight: 700;
        color: #111827;
        line-height: 1.15;
        letter-spacing: -0.025em;
      `
      content.appendChild(h1)
    }

    // Lead paragraph (description) - moved up for better flow
    if (description) {
      const lead = dom.createElement('p')
      lead.textContent = description
      lead.style.cssText = `
        margin: 0 0 32px 0;
        font-size: 1.375rem;
        color: #4b5563;
        line-height: 1.7;
        font-style: italic;
      `
      content.appendChild(lead)
    }

    // Meta line
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 40px;
      padding: 24px 0;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      font-family: 'Inter', system-ui, sans-serif;
      flex-wrap: wrap;
    `

    // Author
    if (author) {
      const authorName = store.anyValue(author, SCHEMA('name'))
      const authorImage = store.any(author, SCHEMA('image'))

      if (authorName) {
        const authorWrap = dom.createElement('div')
        authorWrap.style.cssText = 'display: flex; align-items: center; gap: 14px;'

        if (authorImage) {
          const img = dom.createElement('img')
          img.src = authorImage.uri || authorImage.value
          img.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e5e7eb;
          `
          authorWrap.appendChild(img)
        } else {
          const avatar = dom.createElement('div')
          avatar.textContent = authorName.charAt(0).toUpperCase()
          avatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.125rem;
          `
          authorWrap.appendChild(avatar)
        }

        const nameEl = dom.createElement('div')
        const byline = dom.createElement('div')
        byline.textContent = 'Written by'
        byline.style.cssText = 'font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;'
        const name = dom.createElement('div')
        name.textContent = authorName
        name.style.cssText = 'font-size: 1rem; color: #111827; font-weight: 600;'
        nameEl.appendChild(byline)
        nameEl.appendChild(name)
        authorWrap.appendChild(nameEl)
        meta.appendChild(authorWrap)
      }
    }

    // Date
    if (datePublished) {
      const dateWrap = dom.createElement('div')
      dateWrap.style.cssText = 'margin-left: auto;'
      const dateLabel = dom.createElement('div')
      dateLabel.textContent = 'Published'
      dateLabel.style.cssText = 'font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;'
      const dateValue = dom.createElement('div')
      const d = new Date(datePublished)
      dateValue.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      dateValue.style.cssText = 'font-size: 1rem; color: #111827; font-weight: 500;'
      dateWrap.appendChild(dateLabel)
      dateWrap.appendChild(dateValue)
      meta.appendChild(dateWrap)
    }

    if (author || datePublished) {
      content.appendChild(meta)
    }

    // Keywords
    if (keywords) {
      const tags = dom.createElement('div')
      tags.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 40px;
        flex-wrap: wrap;
        font-family: 'Inter', system-ui, sans-serif;
      `

      keywords.split(',').forEach(keyword => {
        const tag = dom.createElement('span')
        tag.textContent = '#' + keyword.trim().toLowerCase().replace(/\s+/g, '')
        tag.style.cssText = `
          color: #667eea;
          background: #eff6ff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        `
        tags.appendChild(tag)
      })

      content.appendChild(tags)
    }

    // Body
    if (articleBody) {
      const body = dom.createElement('div')
      body.style.cssText = `
        color: #1f2937;
        font-size: 1.1875rem;
        line-height: 1.9;
      `

      // Split into paragraphs and add drop cap to first
      const paragraphs = articleBody.split(/\n\n+/)
      paragraphs.forEach((para, i) => {
        const p = dom.createElement('p')
        p.style.cssText = 'margin: 0 0 32px 0;'

        // Drop cap on first paragraph
        if (i === 0 && para.length > 0) {
          const first = para.charAt(0)
          const rest = para.substring(1)
          p.innerHTML = `<span style="float: left; font-size: 4.5rem; line-height: 0.75; padding-right: 14px; padding-top: 10px; color: #667eea; font-weight: 700; font-family: Georgia, serif;">${first}</span>${rest}`
        } else {
          p.textContent = para
        }

        body.appendChild(p)
      })

      content.appendChild(body)
    }

    // Read more link
    if (url) {
      const linkWrap = dom.createElement('div')
      linkWrap.style.cssText = `
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      `
      const link = dom.createElement('a')
      link.href = url.uri || url.value
      link.target = '_blank'
      link.textContent = 'Continue Reading'
      link.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: 'Inter', system-ui, sans-serif;
        color: white;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 14px 28px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      link.onmouseover = () => {
        link.style.transform = 'translateY(-2px)'
        link.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
      }
      link.onmouseout = () => {
        link.style.transform = 'translateY(0)'
        link.style.boxShadow = 'none'
      }
      link.innerHTML += `
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2;">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      `
      linkWrap.appendChild(link)
      content.appendChild(linkWrap)
    }

    article.appendChild(content)
    div.appendChild(article)

    return div
  }
}

// Register with panes
if (typeof panes !== 'undefined' && panes.register) {
  panes.register(articlePane)
}

// Export
if (typeof window !== 'undefined') {
  window.SchemaArticlePane = articlePane
}

})();
