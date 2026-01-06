/**
 * Person Composite Pane
 * Mashlib-style with modern styling
 */

const PERSON_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')

export default {
  name: 'personComposite',
  icon: PERSON_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    const type = store.any(subject, RDF('type'))
    if (type && (type.value.includes('Person') || type.value.includes('foaf/Person'))) {
      return 'Profile'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    // Container
    const container = dom.createElement('div')
    container.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: white;
      color: #1e293b;
      min-height: 100%;
    `

    // Get matching panes - include preferred ones
    let matchingPanes = []
    const skipPanes = ['internal', 'home', 'ui', 'sharing', 'humanReadable', 'personComposite']
    const preferredPanes = ['profile', 'social', 'friends', 'default', 'source', 'dataContents']

    try {
      if (typeof panes !== 'undefined' && panes.list) {
        // Get panes that match naturally
        const naturalMatches = panes.list.filter(pane => {
          if (skipPanes.includes(pane.name)) return false
          try {
            return pane.label(subject, context) != null
          } catch (e) { return false }
        })

        // Also include preferred panes by name
        const preferred = panes.list.filter(pane =>
          preferredPanes.includes(pane.name) && !skipPanes.includes(pane.name)
        )

        // Combine, preferred first, then natural matches
        const seen = new Set()
        matchingPanes = [...preferred, ...naturalMatches].filter(p => {
          if (seen.has(p.name)) return false
          seen.add(p.name)
          return true
        })

        console.log('[person-composite] Panes:', matchingPanes.map(p => p.name))
      }
    } catch (e) {
      console.warn('[person-composite] Error:', e)
    }

    // === MODERN STYLES FOR MASHLIB CONTENT ===
    const style = dom.createElement('style')
    style.textContent = `
      /* Photos */
      .personCompositeContent img[src^="http"] {
        max-width: 120px !important;
        max-height: 120px !important;
        border-radius: 12px !important;
        object-fit: cover;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      /* QR codes */
      .personCompositeContent .QRCode,
      .personCompositeContent .QRCode svg {
        max-width: 80px !important;
        max-height: 80px !important;
      }
      /* Links */
      .personCompositeContent a {
        color: #5865f2 !important;
        text-decoration: none !important;
      }
      .personCompositeContent a:hover {
        text-decoration: underline !important;
      }
      /* Buttons */
      .personCompositeContent input[type="button"],
      .personCompositeContent button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        margin: 4px !important;
      }
      /* Headers */
      .personCompositeContent h1,
      .personCompositeContent h2,
      .personCompositeContent h3 {
        color: #1e293b !important;
        font-weight: 600 !important;
      }
      /* Tables - cleaner */
      .personCompositeContent table {
        border-collapse: collapse;
        font-size: 0.9rem;
      }
      .personCompositeContent td,
      .personCompositeContent th {
        padding: 8px 12px !important;
        border-bottom: 1px solid #f1f5f9 !important;
        vertical-align: top;
      }
      .personCompositeContent tr:hover td {
        background: #f8fafc;
      }
      /* General text */
      .personCompositeContent {
        font-family: 'Inter', -apple-system, sans-serif;
        line-height: 1.5;
        color: #374151;
      }
    `
    container.appendChild(style)

    // === TAB BAR ===
    const tabBar = dom.createElement('div')
    tabBar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    `

    // Tab state
    let activePane = matchingPanes.find(p => p.name === 'profile') || matchingPanes[0]
    const tabButtons = []

    // Content area
    const contentArea = dom.createElement('div')
    contentArea.className = 'personCompositeContent'
    contentArea.style.cssText = 'padding: 16px; overflow: auto;'

    function renderActivePane() {
      contentArea.innerHTML = ''
      if (!activePane) {
        contentArea.textContent = 'No pane available'
        return
      }
      try {
        const rendered = activePane.render(subject, context)
        if (rendered) contentArea.appendChild(rendered)
      } catch (e) {
        console.error('[person-composite] Render error:', activePane.name, e)
        contentArea.textContent = 'Error rendering ' + activePane.name
      }
    }

    function updateTabStyles() {
      tabButtons.forEach((btn, i) => {
        const isActive = matchingPanes[i] === activePane
        btn.style.background = isActive ? '#e0e7ff' : 'transparent'
        btn.style.borderColor = isActive ? '#a5b4fc' : 'transparent'
        btn.style.color = isActive ? '#4f46e5' : '#64748b'
        const icon = btn.querySelector('img')
        if (icon) icon.style.opacity = isActive ? '1' : '0.6'
      })
    }

    // Create tabs
    matchingPanes.forEach((pane, i) => {
      const btn = dom.createElement('div')

      let label = pane.name
      try { label = pane.label(subject, context) || pane.name } catch (e) {}

      btn.title = label
      btn.style.cssText = `
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s;
        ${pane === activePane ? 'background: #e0e7ff; border-color: #a5b4fc;' : ''}
      `

      if (pane.icon) {
        const icon = dom.createElement('img')
        icon.src = pane.icon
        icon.style.cssText = `width: 18px; height: 18px; opacity: ${pane === activePane ? '1' : '0.6'};`
        btn.appendChild(icon)
      } else {
        btn.textContent = label.charAt(0).toUpperCase()
        btn.style.fontSize = '12px'
        btn.style.fontWeight = '600'
        btn.style.color = pane === activePane ? '#4f46e5' : '#64748b'
      }

      btn.onmouseenter = () => { if (pane !== activePane) btn.style.background = '#f1f5f9' }
      btn.onmouseleave = () => updateTabStyles()
      btn.onclick = () => {
        activePane = pane
        updateTabStyles()
        renderActivePane()
      }

      tabButtons.push(btn)
      tabBar.appendChild(btn)
    })

    container.appendChild(tabBar)
    container.appendChild(contentArea)
    renderActivePane()

    return container
  }
}
