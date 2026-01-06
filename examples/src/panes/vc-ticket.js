/**
 * Event Ticket Pane
 * Beautiful ticket/pass rendering for event credentials
 */

const TICKET_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>')

export default {
  name: 'eventTicket',
  icon: TICKET_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const name = store.anyValue(subject, $rdf.namedNode('http://schema.org/name')) || ''
    if (name.toLowerCase().includes('ticket') || name.toLowerCase().includes('access') || name.toLowerCase().includes('pass')) {
      return 'Ticket'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const CRED = $rdf.Namespace('https://www.w3.org/2018/credentials#')

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name')) || 'Event Access'
    const description = store.anyValue(subject, SCHEMA('description')) || ''
    const issuer = store.any(subject, CRED('issuer')) || store.any(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuer'))
    const issuanceDate = store.anyValue(subject, CRED('issuanceDate')) || store.anyValue(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuanceDate'))
    const expirationDate = store.anyValue(subject, CRED('expirationDate')) || store.anyValue(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#expirationDate'))

    let issuerName = issuer ? (issuer.uri || issuer.value || '').replace('https://', '').replace('http://', '') : 'Event Organizer'

    // Parse name for event details
    const nameParts = name.split(' - ')
    const eventName = nameParts[0] || name
    const accessType = nameParts[1] || 'General Admission'

    // Check validity
    const now = new Date()
    const expires = expirationDate ? new Date(expirationDate) : null
    const isValid = !expires || expires > now

    // Container
    const div = dom.createElement('div')
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 700px;
      margin: 0 auto;
    `

    // Ticket container
    const ticket = dom.createElement('div')
    ticket.style.cssText = `
      display: flex;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `

    // Left stub
    const stub = dom.createElement('div')
    stub.style.cssText = `
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 100px;
      position: relative;
      border-right: 2px dashed rgba(255,255,255,0.3);
    `

    // Stub circles (perforation effect)
    const topCircle = dom.createElement('div')
    topCircle.style.cssText = `
      position: absolute;
      top: -12px;
      right: -12px;
      width: 24px;
      height: 24px;
      background: #0f172a;
      border-radius: 50%;
    `
    stub.appendChild(topCircle)

    const bottomCircle = dom.createElement('div')
    bottomCircle.style.cssText = `
      position: absolute;
      bottom: -12px;
      right: -12px;
      width: 24px;
      height: 24px;
      background: #0f172a;
      border-radius: 50%;
    `
    stub.appendChild(bottomCircle)

    // Stub content
    const stubIcon = dom.createElement('div')
    stubIcon.innerHTML = `<svg viewBox="0 0 24 24" style="width:32px;height:32px;fill:white;opacity:0.9"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`
    stub.appendChild(stubIcon)

    const stubText = dom.createElement('div')
    stubText.textContent = 'VIP'
    stubText.style.cssText = `
      color: white;
      font-weight: 800;
      font-size: 18px;
      margin-top: 8px;
      letter-spacing: 2px;
    `
    stub.appendChild(stubText)

    const stubAccess = dom.createElement('div')
    stubAccess.textContent = 'ACCESS'
    stubAccess.style.cssText = `
      color: rgba(255,255,255,0.8);
      font-size: 10px;
      letter-spacing: 3px;
      margin-top: 2px;
    `
    stub.appendChild(stubAccess)

    ticket.appendChild(stub)

    // Main section
    const main = dom.createElement('div')
    main.style.cssText = `
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
      padding: 28px 32px;
      flex: 1;
      position: relative;
      overflow: hidden;
    `

    // Decorative pattern
    const pattern = dom.createElement('div')
    pattern.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
      pointer-events: none;
    `
    main.appendChild(pattern)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'position: relative; z-index: 1;'

    // Event name
    const eventTitle = dom.createElement('h1')
    eventTitle.textContent = eventName
    eventTitle.style.cssText = `
      color: white;
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 4px 0;
      line-height: 1.2;
    `
    content.appendChild(eventTitle)

    // Access type badge
    const accessBadge = dom.createElement('div')
    accessBadge.textContent = accessType.toUpperCase()
    accessBadge.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 16px;
    `
    content.appendChild(accessBadge)

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        color: rgba(255,255,255,0.85);
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 20px 0;
      `
      content.appendChild(desc)
    }

    // Bottom row
    const bottomRow = dom.createElement('div')
    bottomRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 16px;
    `

    // Date info
    const dateInfo = dom.createElement('div')
    if (expirationDate) {
      const validLabel = dom.createElement('div')
      validLabel.textContent = 'VALID UNTIL'
      validLabel.style.cssText = 'color: rgba(255,255,255,0.6); font-size: 10px; letter-spacing: 1px; margin-bottom: 4px;'
      dateInfo.appendChild(validLabel)

      const validDate = dom.createElement('div')
      validDate.textContent = new Date(expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      validDate.style.cssText = 'color: white; font-size: 16px; font-weight: 600;'
      dateInfo.appendChild(validDate)
    }
    bottomRow.appendChild(dateInfo)

    // QR code placeholder
    const qr = dom.createElement('div')
    qr.style.cssText = `
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    `
    // Simple QR-like pattern
    qr.innerHTML = `
      <svg viewBox="0 0 32 32" style="width:100%;height:100%">
        <rect x="0" y="0" width="10" height="10" fill="#1e1b4b"/>
        <rect x="22" y="0" width="10" height="10" fill="#1e1b4b"/>
        <rect x="0" y="22" width="10" height="10" fill="#1e1b4b"/>
        <rect x="12" y="12" width="8" height="8" fill="#1e1b4b"/>
        <rect x="2" y="2" width="6" height="6" fill="white"/>
        <rect x="24" y="2" width="6" height="6" fill="white"/>
        <rect x="2" y="24" width="6" height="6" fill="white"/>
        <rect x="3" y="3" width="4" height="4" fill="#1e1b4b"/>
        <rect x="25" y="3" width="4" height="4" fill="#1e1b4b"/>
        <rect x="3" y="25" width="4" height="4" fill="#1e1b4b"/>
        <rect x="14" y="0" width="2" height="2" fill="#1e1b4b"/>
        <rect x="18" y="4" width="2" height="2" fill="#1e1b4b"/>
        <rect x="0" y="14" width="2" height="2" fill="#1e1b4b"/>
        <rect x="30" y="14" width="2" height="2" fill="#1e1b4b"/>
        <rect x="14" y="30" width="2" height="2" fill="#1e1b4b"/>
        <rect x="22" y="14" width="2" height="4" fill="#1e1b4b"/>
        <rect x="26" y="22" width="4" height="2" fill="#1e1b4b"/>
        <rect x="22" y="26" width="2" height="4" fill="#1e1b4b"/>
      </svg>
    `
    bottomRow.appendChild(qr)

    content.appendChild(bottomRow)
    main.appendChild(content)
    ticket.appendChild(main)
    div.appendChild(ticket)

    // Issuer footer
    const footer = dom.createElement('div')
    footer.style.cssText = `
      text-align: center;
      margin-top: 16px;
      color: #64748b;
      font-size: 12px;
    `
    footer.innerHTML = `Issued by <strong style="color:#94a3b8">${issuerName}</strong> · W3C Verifiable Credential`
    div.appendChild(footer)

    return div
  }
}
