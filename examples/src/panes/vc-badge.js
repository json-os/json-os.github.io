/**
 * Achievement Badge Pane
 * Beautiful medal/badge rendering for achievement credentials
 */

const BADGE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>')

export default {
  name: 'achievementBadge',
  icon: BADGE_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const name = store.anyValue(subject, $rdf.namedNode('http://schema.org/name')) || ''
    if (name.toLowerCase().includes('badge') || name.toLowerCase().includes('achievement') || name.toLowerCase().includes('contributor')) {
      return 'Badge'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const CRED = $rdf.Namespace('https://www.w3.org/2018/credentials#')

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name')) || 'Achievement Unlocked'
    const description = store.anyValue(subject, SCHEMA('description')) || ''
    const issuer = store.any(subject, CRED('issuer')) || store.any(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuer'))
    const issuanceDate = store.anyValue(subject, CRED('issuanceDate')) || store.anyValue(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuanceDate'))

    let issuerName = issuer ? (issuer.uri || issuer.value || '').replace('https://', '').replace('http://', '') : ''

    // Parse name for badge details
    const nameParts = name.split(' - ')
    const badgeName = nameParts[0] || name
    const badgeLevel = nameParts[1] || ''

    // Determine color scheme based on level
    let gradientColors = ['#fbbf24', '#f59e0b', '#d97706'] // Gold default
    let ribbonColor = '#dc2626'
    if (badgeLevel.toLowerCase().includes('silver') || badgeName.toLowerCase().includes('silver')) {
      gradientColors = ['#e2e8f0', '#cbd5e1', '#94a3b8']
      ribbonColor = '#3b82f6'
    } else if (badgeLevel.toLowerCase().includes('bronze') || badgeName.toLowerCase().includes('bronze')) {
      gradientColors = ['#d97706', '#b45309', '#92400e']
      ribbonColor = '#059669'
    } else if (badgeLevel.toLowerCase().includes('platinum') || badgeName.toLowerCase().includes('platinum')) {
      gradientColors = ['#e2e8f0', '#f8fafc', '#cbd5e1']
      ribbonColor = '#8b5cf6'
    }

    // Container
    const div = dom.createElement('div')
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 48px 32px;
      max-width: 500px;
      margin: 0 auto;
      text-align: center;
    `

    // Badge container with glow
    const badgeContainer = dom.createElement('div')
    badgeContainer.style.cssText = `
      position: relative;
      display: inline-block;
      margin-bottom: 32px;
    `

    // Glow effect
    const glow = dom.createElement('div')
    glow.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, ${gradientColors[0]}40 0%, transparent 70%);
      filter: blur(20px);
      pointer-events: none;
    `
    badgeContainer.appendChild(glow)

    // Ribbon behind badge
    const ribbon = dom.createElement('div')
    ribbon.style.cssText = `
      position: absolute;
      top: 120px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 100px;
      z-index: 1;
    `
    ribbon.innerHTML = `
      <svg viewBox="0 0 80 100" style="width:100%;height:100%">
        <path d="M10 0 L10 80 L40 60 L70 80 L70 0 Z" fill="${ribbonColor}"/>
        <path d="M10 0 L10 80 L40 60 L40 0 Z" fill="${ribbonColor}" opacity="0.8"/>
        <path d="M40 0 L40 60 L70 80 L70 0 Z" fill="${ribbonColor}" opacity="0.6"/>
      </svg>
    `
    badgeContainer.appendChild(ribbon)

    // Main badge circle
    const badge = dom.createElement('div')
    badge.style.cssText = `
      position: relative;
      z-index: 2;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%);
      box-shadow:
        0 4px 6px rgba(0,0,0,0.3),
        0 10px 20px rgba(0,0,0,0.2),
        inset 0 2px 4px rgba(255,255,255,0.5),
        inset 0 -2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // Inner circle
    const inner = dom.createElement('div')
    inner.style.cssText = `
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(180deg, ${gradientColors[1]} 0%, ${gradientColors[2]} 100%);
      box-shadow:
        inset 0 4px 8px rgba(255,255,255,0.3),
        inset 0 -4px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 20px;
    `

    // Star icon
    const star = dom.createElement('div')
    star.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:48px;height:48px;fill:#1e1b4b;opacity:0.9;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.2))">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    `
    inner.appendChild(star)

    // Level text on badge
    if (badgeLevel) {
      const levelText = dom.createElement('div')
      levelText.textContent = badgeLevel.toUpperCase()
      levelText.style.cssText = `
        color: #1e1b4b;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        margin-top: 4px;
        text-shadow: 0 1px 0 rgba(255,255,255,0.5);
      `
      inner.appendChild(levelText)
    }

    badge.appendChild(inner)
    badgeContainer.appendChild(badge)
    div.appendChild(badgeContainer)

    // Achievement name
    const title = dom.createElement('h1')
    title.textContent = badgeName
    title.style.cssText = `
      color: white;
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 12px 0;
      line-height: 1.2;
    `
    div.appendChild(title)

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        color: #94a3b8;
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 24px 0;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      `
      div.appendChild(desc)
    }

    // Earned date
    if (issuanceDate) {
      const earned = dom.createElement('div')
      earned.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.1);
        padding: 10px 20px;
        border-radius: 24px;
        color: #e2e8f0;
        font-size: 14px;
      `
      earned.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;opacity:0.7">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Earned ${new Date(issuanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      `
      div.appendChild(earned)
    }

    // Issuer
    if (issuerName) {
      const issuerEl = dom.createElement('p')
      issuerEl.style.cssText = `
        color: #64748b;
        font-size: 12px;
        margin-top: 20px;
      `
      issuerEl.innerHTML = `Awarded by <strong style="color:#94a3b8">${issuerName}</strong>`
      div.appendChild(issuerEl)
    }

    return div
  }
}
