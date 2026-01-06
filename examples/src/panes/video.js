/**
 * Schema.org VideoObject Pane
 * Beautiful rendering of schema:VideoObject
 */

const VIDEO_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>')

export default {
  name: 'schemaVideo',
  icon: VIDEO_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('VideoObject').uri]) {
      return 'Video'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-video-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const thumbnailUrl = store.any(subject, SCHEMA('thumbnailUrl'))
    const contentUrl = store.any(subject, SCHEMA('contentUrl'))
    const embedUrl = store.any(subject, SCHEMA('embedUrl'))
    const duration = store.anyValue(subject, SCHEMA('duration'))
    const uploadDate = store.anyValue(subject, SCHEMA('uploadDate'))
    const author = store.any(subject, SCHEMA('author'))
    const interactionCount = store.anyValue(subject, SCHEMA('interactionCount'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: #0f172a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    `

    // Video player / thumbnail
    const player = dom.createElement('div')
    player.style.cssText = `
      position: relative;
      aspect-ratio: 16/9;
      background: #000;
    `

    if (embedUrl) {
      // Try to embed the video
      const iframe = dom.createElement('iframe')
      iframe.src = embedUrl.uri || embedUrl.value
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullscreen = true
      player.appendChild(iframe)
    } else if (thumbnailUrl) {
      const thumb = dom.createElement('img')
      thumb.src = thumbnailUrl.uri || thumbnailUrl.value
      thumb.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      player.appendChild(thumb)

      // Play button overlay
      const playBtn = dom.createElement('div')
      playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        background: rgba(255,255,255,0.95);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      playBtn.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #0f172a; margin-left: 4px;">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `
      playBtn.onmouseover = () => {
        playBtn.style.transform = 'translate(-50%, -50%) scale(1.1)'
        playBtn.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
      }
      playBtn.onmouseout = () => {
        playBtn.style.transform = 'translate(-50%, -50%)'
        playBtn.style.boxShadow = 'none'
      }

      if (contentUrl) {
        playBtn.onclick = () => window.open(contentUrl.uri || contentUrl.value, '_blank')
      }

      player.appendChild(playBtn)

      // Duration badge
      if (duration) {
        const durationBadge = dom.createElement('div')
        durationBadge.style.cssText = `
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        `
        // Parse ISO duration
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        if (match) {
          const h = match[1] ? parseInt(match[1]) : 0
          const m = match[2] ? parseInt(match[2]) : 0
          const s = match[3] ? parseInt(match[3]) : 0
          durationBadge.textContent = h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`
          player.appendChild(durationBadge)
        }
      }
    }

    card.appendChild(player)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 24px;'

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        line-height: 1.3;
      `
      content.appendChild(h1)
    }

    // Meta row
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      color: #94a3b8;
    `

    if (interactionCount) {
      const views = dom.createElement('span')
      views.textContent = parseInt(interactionCount).toLocaleString() + ' views'
      meta.appendChild(views)
    }

    if (uploadDate) {
      const date = dom.createElement('span')
      const d = new Date(uploadDate)
      date.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      meta.appendChild(date)
    }

    if (meta.children.length > 0) {
      content.appendChild(meta)
    }

    // Author
    if (author) {
      const authorName = store.anyValue(author, SCHEMA('name'))
      const authorImage = store.any(author, SCHEMA('image'))

      if (authorName) {
        const authorEl = dom.createElement('div')
        authorEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        `

        if (authorImage) {
          const img = dom.createElement('img')
          img.src = authorImage.uri || authorImage.value
          img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover;'
          authorEl.appendChild(img)
        } else {
          const avatar = dom.createElement('div')
          avatar.textContent = authorName.charAt(0).toUpperCase()
          avatar.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          `
          authorEl.appendChild(avatar)
        }

        const nameEl = dom.createElement('div')
        nameEl.textContent = authorName
        nameEl.style.cssText = 'color: white; font-weight: 500;'
        authorEl.appendChild(nameEl)

        content.appendChild(authorEl)
      }
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: #94a3b8;
        line-height: 1.7;
        font-size: 0.95rem;
      `
      content.appendChild(desc)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(videoPane)
}

if (typeof window !== 'undefined') {
  window.SchemaVideoPane = videoPane
}
