/**
 * Nostr Post Pane
 * Renders a Nostr event as a social media post
 */

const NOSTR_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>')

export default {
  name: 'nostrPost',
  icon: NOSTR_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const types = store.findTypeURIs ? store.findTypeURIs(subject) : {}
    if (types[SCHEMA('SocialMediaPosting').uri]) {
      return 'Post'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const SCHEMA = $rdf.Namespace('http://schema.org/')

    // Get properties
    const text = store.anyValue(subject, SCHEMA('text')) || store.anyValue(subject, SCHEMA('articleBody')) || ''
    const dateCreated = store.anyValue(subject, SCHEMA('dateCreated')) || store.anyValue(subject, SCHEMA('datePublished'))
    const author = store.any(subject, SCHEMA('author'))

    let authorId = ''
    if (author) {
      authorId = store.anyValue(author, SCHEMA('identifier')) || author.uri || ''
    }

    // Truncate pubkey for display
    const shortPubkey = authorId ? `npub1${authorId.substring(0, 8)}...` : 'anonymous'
    const initial = authorId ? authorId.substring(0, 2).toUpperCase() : '??'

    // Time ago
    let timeAgo = ''
    if (dateCreated) {
      const seconds = Math.floor((Date.now() - new Date(dateCreated).getTime()) / 1000)
      if (seconds < 60) timeAgo = `${seconds}s ago`
      else if (seconds < 3600) timeAgo = `${Math.floor(seconds / 60)}m ago`
      else timeAgo = `${Math.floor(seconds / 3600)}h ago`
    }

    // Truncate content
    const content = text.length > 280 ? text.substring(0, 280) + '...' : text

    // Build card
    const card = dom.createElement('div')
    card.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 16px;
      color: #e2e8f0;
    `

    // Header
    const header = dom.createElement('div')
    header.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'

    const avatar = dom.createElement('div')
    avatar.textContent = initial
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
    `
    header.appendChild(avatar)

    const meta = dom.createElement('div')
    meta.style.cssText = 'flex: 1;'

    const authorName = dom.createElement('div')
    authorName.textContent = 'Nostr User'
    authorName.style.cssText = 'font-weight: 600; font-size: 14px; color: #e2e8f0;'
    meta.appendChild(authorName)

    const npub = dom.createElement('div')
    npub.textContent = shortPubkey
    npub.style.cssText = 'font-size: 11px; color: #64748b; font-family: monospace;'
    meta.appendChild(npub)

    header.appendChild(meta)
    card.appendChild(header)

    // Content
    const contentEl = dom.createElement('div')
    contentEl.textContent = content
    contentEl.style.cssText = `
      font-size: 14px;
      line-height: 1.5;
      color: #cbd5e1;
      word-break: break-word;
    `
    card.appendChild(contentEl)

    // Footer
    const footer = dom.createElement('div')
    footer.style.cssText = `
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    `

    const timeEl = dom.createElement('div')
    timeEl.textContent = `🕐 ${timeAgo}`
    footer.appendChild(timeEl)

    const badge = dom.createElement('div')
    badge.textContent = '@view rendered'
    badge.style.cssText = `
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
    `
    footer.appendChild(badge)

    card.appendChild(footer)

    return card
  }
}
