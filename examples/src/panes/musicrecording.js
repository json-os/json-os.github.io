/**
 * Schema.org MusicRecording Pane
 * Beautiful rendering of schema:MusicRecording, MusicAlbum
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

const MUSIC_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17V5l12-2v12"/></svg>')

const musicPane = {
  name: 'schemaMusicRecording',
  icon: MUSIC_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('MusicRecording').uri] || types[SCHEMA('MusicAlbum').uri]) {
      return 'Music'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-music-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 0;
      margin: 0;
      background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
      min-height: 100vh;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const image = store.any(subject, SCHEMA('image'))
    const byArtist = store.any(subject, SCHEMA('byArtist'))
    const inAlbum = store.any(subject, SCHEMA('inAlbum'))
    const duration = store.anyValue(subject, SCHEMA('duration'))
    const datePublished = store.anyValue(subject, SCHEMA('datePublished'))
    const genre = store.anyValue(subject, SCHEMA('genre'))
    const isrcCode = store.anyValue(subject, SCHEMA('isrcCode'))
    const track = store.each(subject, SCHEMA('track'))
    const url = store.any(subject, SCHEMA('url'))

    // Hero section
    const hero = dom.createElement('div')
    hero.style.cssText = `
      display: flex;
      gap: 32px;
      padding: 48px;
      align-items: flex-end;
      background: linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%);
    `

    // Album art
    const artWrap = dom.createElement('div')
    artWrap.style.cssText = `
      width: 240px;
      height: 240px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      flex-shrink: 0;
    `

    if (image) {
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
      artWrap.appendChild(img)
    } else {
      artWrap.style.cssText += `
        background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      `
      artWrap.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; stroke: rgba(255,255,255,0.5); fill: none; stroke-width: 1.5;">
          <circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17V5l12-2v12"/>
        </svg>
      `
    }
    hero.appendChild(artWrap)

    // Track info
    const info = dom.createElement('div')
    info.style.cssText = 'flex: 1;'

    // Type label
    const typeLabel = dom.createElement('div')
    typeLabel.textContent = track.length > 0 ? 'ALBUM' : 'SINGLE'
    typeLabel.style.cssText = `
      font-size: 0.75rem;
      font-weight: 700;
      color: rgba(255,255,255,0.8);
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    `
    info.appendChild(typeLabel)

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 3rem;
        font-weight: 800;
        color: white;
        line-height: 1.1;
      `
      info.appendChild(h1)
    }

    // Artist and meta
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.9);
      font-size: 0.95rem;
    `

    if (byArtist) {
      const artistName = store.anyValue(byArtist, SCHEMA('name'))
      const artistImage = store.any(byArtist, SCHEMA('image'))

      if (artistName) {
        if (artistImage) {
          const img = dom.createElement('img')
          img.src = artistImage.uri || artistImage.value
          img.style.cssText = 'width: 28px; height: 28px; border-radius: 50%; object-fit: cover;'
          meta.appendChild(img)
        }
        const nameEl = dom.createElement('span')
        nameEl.textContent = artistName
        nameEl.style.cssText = 'font-weight: 600;'
        meta.appendChild(nameEl)

        if (datePublished || duration) {
          const dot = dom.createElement('span')
          dot.textContent = '•'
          dot.style.cssText = 'opacity: 0.6;'
          meta.appendChild(dot)
        }
      }
    }

    if (datePublished) {
      const year = dom.createElement('span')
      year.textContent = new Date(datePublished).getFullYear()
      meta.appendChild(year)

      if (duration || track.length > 0) {
        const dot = dom.createElement('span')
        dot.textContent = '•'
        dot.style.cssText = 'opacity: 0.6;'
        meta.appendChild(dot)
      }
    }

    if (track.length > 0) {
      const trackCount = dom.createElement('span')
      trackCount.textContent = `${track.length} songs`
      meta.appendChild(trackCount)
    } else if (duration) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const m = match[2] ? parseInt(match[2]) : 0
        const s = match[3] ? parseInt(match[3]) : 0
        const durEl = dom.createElement('span')
        durEl.textContent = `${m}:${String(s).padStart(2, '0')}`
        meta.appendChild(durEl)
      }
    }

    info.appendChild(meta)
    hero.appendChild(info)
    div.appendChild(hero)

    // Content section
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 32px 48px;'

    // Action buttons
    const actions = dom.createElement('div')
    actions.style.cssText = 'display: flex; align-items: center; gap: 20px; margin-bottom: 32px;'

    const playBtn = dom.createElement('button')
    playBtn.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:black;">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    `
    playBtn.style.cssText = `
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1db954;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s, background 0.2s;
    `
    playBtn.onmouseover = () => {
      playBtn.style.transform = 'scale(1.05)'
      playBtn.style.background = '#1ed760'
    }
    playBtn.onmouseout = () => {
      playBtn.style.transform = 'scale(1)'
      playBtn.style.background = '#1db954'
    }
    if (url) {
      playBtn.onclick = () => window.open(url.uri || url.value, '_blank')
    }
    actions.appendChild(playBtn)

    content.appendChild(actions)

    // Track list (for albums)
    if (track.length > 0) {
      const trackList = dom.createElement('div')

      track.forEach((t, i) => {
        const trackName = store.anyValue(t, SCHEMA('name'))
        const trackDuration = store.anyValue(t, SCHEMA('duration'))
        const trackArtist = store.any(t, SCHEMA('byArtist'))

        if (trackName) {
          const row = dom.createElement('div')
          row.style.cssText = `
            display: grid;
            grid-template-columns: 40px 1fr auto;
            gap: 16px;
            align-items: center;
            padding: 12px 16px;
            border-radius: 6px;
            transition: background 0.2s;
            cursor: pointer;
          `
          row.onmouseover = () => { row.style.background = 'rgba(255,255,255,0.1)' }
          row.onmouseout = () => { row.style.background = 'transparent' }

          // Track number
          const num = dom.createElement('div')
          num.textContent = i + 1
          num.style.cssText = 'color: #a3a3a3; text-align: right;'
          row.appendChild(num)

          // Track info
          const trackInfo = dom.createElement('div')
          const titleEl = dom.createElement('div')
          titleEl.textContent = trackName
          titleEl.style.cssText = 'color: white; font-weight: 500;'
          trackInfo.appendChild(titleEl)

          if (trackArtist) {
            const artistName = store.anyValue(trackArtist, SCHEMA('name'))
            if (artistName) {
              const artistEl = dom.createElement('div')
              artistEl.textContent = artistName
              artistEl.style.cssText = 'color: #a3a3a3; font-size: 0.85rem; margin-top: 2px;'
              trackInfo.appendChild(artistEl)
            }
          }
          row.appendChild(trackInfo)

          // Duration
          if (trackDuration) {
            const match = trackDuration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)
            if (match) {
              const m = match[1] ? parseInt(match[1]) : 0
              const s = match[2] ? parseInt(match[2]) : 0
              const durEl = dom.createElement('div')
              durEl.textContent = `${m}:${String(s).padStart(2, '0')}`
              durEl.style.cssText = 'color: #a3a3a3; font-size: 0.9rem;'
              row.appendChild(durEl)
            }
          }

          trackList.appendChild(row)
        }
      })

      content.appendChild(trackList)
    }

    // Additional info
    if (genre || isrcCode) {
      const infoSection = dom.createElement('div')
      infoSection.style.cssText = `
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.1);
      `

      if (genre) {
        const genreEl = dom.createElement('div')
        genreEl.style.cssText = 'margin-bottom: 8px;'
        genreEl.innerHTML = `
          <span style="color: #a3a3a3;">Genre: </span>
          <span style="color: white;">${genre}</span>
        `
        infoSection.appendChild(genreEl)
      }

      if (isrcCode) {
        const isrcEl = dom.createElement('div')
        isrcEl.innerHTML = `
          <span style="color: #a3a3a3;">ISRC: </span>
          <span style="color: white;">${isrcCode}</span>
        `
        infoSection.appendChild(isrcEl)
      }

      content.appendChild(infoSection)
    }

    div.appendChild(content)

    return div
  }
}

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(musicPane)
}

if (typeof window !== 'undefined') {
  window.SchemaMusicRecordingPane = musicPane
}

})();
