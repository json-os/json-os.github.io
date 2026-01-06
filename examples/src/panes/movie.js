/**
 * Schema.org Movie Pane
 * Beautiful rendering of schema:Movie
 */

const MOVIE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>')

export default {
  name: 'schemaMovie',
  icon: MOVIE_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Movie').uri]) {
      return 'Movie'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-movie-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 0;
      max-width: 100%;
      margin: 0;
      background: #0f0f0f;
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const director = store.any(subject, SCHEMA('director'))
    const actor = store.each(subject, SCHEMA('actor'))
    const genre = store.anyValue(subject, SCHEMA('genre'))
    const duration = store.anyValue(subject, SCHEMA('duration'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const contentRating = store.anyValue(subject, SCHEMA('contentRating'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const trailer = store.any(subject, SCHEMA('trailer'))
    const url = store.any(subject, SCHEMA('url'))

    // Hero backdrop
    const hero = dom.createElement('div')
    hero.style.cssText = `
      position: relative;
      height: 500px;
      overflow: hidden;
    `

    if (image) {
      const backdrop = dom.createElement('img')
      backdrop.src = image.uri || image.value
      backdrop.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.4);
      `
      hero.appendChild(backdrop)
    } else {
      hero.style.background = 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
    }

    // Gradient overlay
    const overlay = dom.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 300px;
      background: linear-gradient(transparent, #0f0f0f);
    `
    hero.appendChild(overlay)

    // Hero content
    const heroContent = dom.createElement('div')
    heroContent.style.cssText = `
      position: absolute;
      bottom: 48px;
      left: 48px;
      right: 48px;
    `

    // Genre and rating badges
    const badges = dom.createElement('div')
    badges.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;'

    if (contentRating) {
      const badge = dom.createElement('span')
      badge.textContent = contentRating
      badge.style.cssText = `
        background: transparent;
        border: 2px solid rgba(255,255,255,0.5);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
      `
      badges.appendChild(badge)
    }

    if (genre) {
      genre.split(',').forEach(g => {
        const badge = dom.createElement('span')
        badge.textContent = g.trim()
        badge.style.cssText = `
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
        `
        badges.appendChild(badge)
      })
    }

    if (badges.children.length > 0) {
      heroContent.appendChild(badges)
    }

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 3.5rem;
        font-weight: 800;
        color: white;
        text-shadow: 0 4px 20px rgba(0,0,0,0.5);
      `
      heroContent.appendChild(h1)
    }

    // Meta line
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 24px;
      color: rgba(255,255,255,0.8);
      font-size: 1rem;
    `

    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      if (ratingValue) {
        const ratingEl = dom.createElement('div')
        ratingEl.style.cssText = 'display: flex; align-items: center; gap: 8px;'
        ratingEl.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#fbbf24;stroke:#fbbf24;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style="color: #fbbf24; font-weight: 700; font-size: 1.2rem;">${ratingValue}</span>
          <span>/10</span>
        `
        meta.appendChild(ratingEl)
      }
    }

    if (datePublished) {
      const year = dom.createElement('span')
      year.textContent = new Date(datePublished).getFullYear()
      meta.appendChild(year)
    }

    if (duration) {
      // Parse ISO duration
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
      if (match) {
        const h = match[1] ? parseInt(match[1]) : 0
        const m = match[2] ? parseInt(match[2]) : 0
        const durEl = dom.createElement('span')
        durEl.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`
        meta.appendChild(durEl)
      }
    }

    if (meta.children.length > 0) {
      heroContent.appendChild(meta)
    }

    hero.appendChild(heroContent)
    div.appendChild(hero)

    // Content section
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 48px; max-width: 1200px; margin: 0 auto;'

    // Action buttons
    const actions = dom.createElement('div')
    actions.style.cssText = 'display: flex; gap: 16px; margin-bottom: 40px;'

    if (trailer) {
      const trailerUrl = trailer.uri || trailer.value || store.anyValue(trailer, SCHEMA('contentUrl'))
      if (trailerUrl) {
        const btn = dom.createElement('a')
        btn.href = trailerUrl
        btn.target = '_blank'
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:white;margin-right:10px;">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Watch Trailer
        `
        btn.style.cssText = `
          display: inline-flex;
          align-items: center;
          background: #dc2626;
          color: white;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.2s;
        `
        btn.onmouseover = () => { btn.style.background = '#b91c1c' }
        btn.onmouseout = () => { btn.style.background = '#dc2626' }
        actions.appendChild(btn)
      }
    }

    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'More Info'
      btn.style.cssText = `
        display: inline-flex;
        align-items: center;
        background: rgba(255,255,255,0.1);
        color: white;
        padding: 16px 32px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        border: 1px solid rgba(255,255,255,0.2);
        transition: background 0.2s;
      `
      btn.onmouseover = () => { btn.style.background = 'rgba(255,255,255,0.2)' }
      btn.onmouseout = () => { btn.style.background = 'rgba(255,255,255,0.1)' }
      actions.appendChild(btn)
    }

    if (actions.children.length > 0) {
      content.appendChild(actions)
    }

    // Description
    if (description) {
      const descSection = dom.createElement('div')
      descSection.style.cssText = 'margin-bottom: 40px; max-width: 800px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'Overview'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
      `
      descSection.appendChild(h2)

      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: rgba(255,255,255,0.7);
        line-height: 1.8;
        font-size: 1.05rem;
      `
      descSection.appendChild(desc)
      content.appendChild(descSection)
    }

    // Director
    if (director) {
      const directorName = store.anyValue(director, SCHEMA('name'))
      if (directorName) {
        const dirSection = dom.createElement('div')
        dirSection.style.cssText = 'margin-bottom: 40px;'

        const label = dom.createElement('div')
        label.textContent = 'Director'
        label.style.cssText = 'font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px;'
        dirSection.appendChild(label)

        const nameEl = dom.createElement('div')
        nameEl.textContent = directorName
        nameEl.style.cssText = 'font-size: 1.1rem; color: white; font-weight: 500;'
        dirSection.appendChild(nameEl)

        content.appendChild(dirSection)
      }
    }

    // Cast
    if (actor.length > 0) {
      const castSection = dom.createElement('div')

      const h2 = dom.createElement('h2')
      h2.textContent = 'Cast'
      h2.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
      `
      castSection.appendChild(h2)

      const castGrid = dom.createElement('div')
      castGrid.style.cssText = 'display: flex; gap: 24px; flex-wrap: wrap;'

      actor.slice(0, 6).forEach(a => {
        const actorName = store.anyValue(a, SCHEMA('name'))
        const actorImage = store.any(a, SCHEMA('image'))

        if (actorName) {
          const actorCard = dom.createElement('div')
          actorCard.style.cssText = 'text-align: center; width: 100px;'

          if (actorImage) {
            const img = dom.createElement('img')
            img.src = actorImage.uri || actorImage.value
            img.style.cssText = `
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 10px;
            `
            actorCard.appendChild(img)
          } else {
            const avatar = dom.createElement('div')
            avatar.textContent = actorName.charAt(0)
            avatar.style.cssText = `
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              font-weight: 600;
              margin: 0 auto 10px;
            `
            actorCard.appendChild(avatar)
          }

          const nameEl = dom.createElement('div')
          nameEl.textContent = actorName
          nameEl.style.cssText = 'font-size: 0.9rem; color: white;'
          actorCard.appendChild(nameEl)

          castGrid.appendChild(actorCard)
        }
      })

      castSection.appendChild(castGrid)
      content.appendChild(castSection)
    }

    div.appendChild(content)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(moviePane)
}

if (typeof window !== 'undefined') {
  window.SchemaMoviePane = moviePane
}
