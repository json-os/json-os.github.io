/**
 * Verifiable Credentials Pane
 * Beautiful rendering of W3C Verifiable Credentials
 * https://www.w3.org/TR/vc-data-model/
 */

const VC_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>')

export default {
  name: 'verifiableCredential',
  icon: VC_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const type = store.anyValue(subject, $rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))
    if (type && type.includes('VerifiableCredential')) {
      return 'Credential'
    }
    const types = store.each(subject, $rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))
    for (const t of types) {
      if (t.value && t.value.includes('VerifiableCredential')) {
        return 'Credential'
      }
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    // Namespaces
    const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    const CRED = $rdf.Namespace('https://www.w3.org/2018/credentials#')
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const SEC = $rdf.Namespace('https://w3id.org/security#')

    // Get credential properties
    const types = store.each(subject, RDF('type')).map(t => t.value)
    const issuer = store.any(subject, CRED('issuer')) || store.any(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuer'))
    const issuanceDate = store.anyValue(subject, CRED('issuanceDate')) || store.anyValue(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#issuanceDate'))
    const expirationDate = store.anyValue(subject, CRED('expirationDate')) || store.anyValue(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#expirationDate'))
    const credentialSubject = store.any(subject, CRED('credentialSubject')) || store.any(subject, $rdf.namedNode('https://www.w3.org/2018/credentials#credentialSubject'))
    const name = store.anyValue(subject, SCHEMA('name')) || store.anyValue(subject, $rdf.namedNode('https://schema.org/name'))
    const description = store.anyValue(subject, SCHEMA('description')) || store.anyValue(subject, $rdf.namedNode('https://schema.org/description'))

    // Get issuer details
    let issuerName = ''
    let issuerImage = null
    if (issuer) {
      issuerName = store.anyValue(issuer, SCHEMA('name')) || store.anyValue(issuer, $rdf.namedNode('https://schema.org/name')) || (issuer.uri ? issuer.uri : '')
      issuerImage = store.any(issuer, SCHEMA('image')) || store.any(issuer, SCHEMA('logo'))
    }

    // Get subject details
    let subjectName = ''
    let subjectId = ''
    let degree = ''
    let achievement = ''
    if (credentialSubject) {
      subjectName = store.anyValue(credentialSubject, SCHEMA('name')) || store.anyValue(credentialSubject, $rdf.namedNode('https://schema.org/name')) || ''
      subjectId = credentialSubject.uri || credentialSubject.value || ''

      // Look for degree/achievement
      const hasCredential = store.any(credentialSubject, SCHEMA('hasCredential'))
      if (hasCredential) {
        degree = store.anyValue(hasCredential, SCHEMA('name')) || ''
      }
      degree = degree || store.anyValue(credentialSubject, SCHEMA('degree')) || store.anyValue(credentialSubject, $rdf.namedNode('https://schema.org/educationalCredentialAwarded')) || ''
      achievement = store.anyValue(credentialSubject, SCHEMA('description')) || ''
    }

    // Determine credential type for display
    let credType = 'Verifiable Credential'
    for (const t of types) {
      if (t.includes('UniversityDegreeCredential')) credType = 'University Degree'
      else if (t.includes('DriverLicenseCredential')) credType = "Driver's License"
      else if (t.includes('PermanentResidentCard')) credType = 'Permanent Resident Card'
      else if (t.includes('AlumniCredential')) credType = 'Alumni Credential'
      else if (t.includes('EducationalCredential')) credType = 'Educational Credential'
      else if (t.includes('EmploymentCredential')) credType = 'Employment Credential'
      else if (t.includes('HealthCredential')) credType = 'Health Credential'
    }

    // Check validity
    const now = new Date()
    const issued = issuanceDate ? new Date(issuanceDate) : null
    const expires = expirationDate ? new Date(expirationDate) : null
    const isValid = (!expires || expires > now) && (!issued || issued <= now)

    // Build the UI
    const div = dom.createElement('div')
    div.className = 'vc-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    // Card container
    const card = dom.createElement('div')
    card.style.cssText = `
      background: linear-gradient(135deg, #1e3a5f 0%, #0d253f 50%, #1a1a2e 100%);
      border-radius: 20px;
      padding: 32px;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `

    // Security pattern overlay
    const pattern = dom.createElement('div')
    pattern.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px),
        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px);
      pointer-events: none;
    `
    card.appendChild(pattern)

    // Holographic accent
    const holo = dom.createElement('div')
    holo.style.cssText = `
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
      pointer-events: none;
    `
    card.appendChild(holo)

    // Content wrapper
    const content = dom.createElement('div')
    content.style.cssText = 'position: relative; z-index: 1;'

    // Header row: issuer + verification badge
    const header = dom.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    `

    // Issuer section
    const issuerSection = dom.createElement('div')
    issuerSection.style.cssText = 'display: flex; align-items: center; gap: 12px;'

    if (issuerImage) {
      const logo = dom.createElement('img')
      logo.src = issuerImage.uri || issuerImage.value
      logo.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: contain;
        background: white;
        padding: 4px;
      `
      issuerSection.appendChild(logo)
    } else {
      // Default seal
      const seal = dom.createElement('div')
      seal.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c9a227 0%, #f4d03f 50%, #c9a227 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4);
      `
      seal.innerHTML = `<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#1a1a2e"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`
      issuerSection.appendChild(seal)
    }

    const issuerInfo = dom.createElement('div')
    const issuerLabel = dom.createElement('div')
    issuerLabel.textContent = 'ISSUED BY'
    issuerLabel.style.cssText = 'font-size: 10px; letter-spacing: 1px; opacity: 0.7; margin-bottom: 2px;'
    issuerInfo.appendChild(issuerLabel)

    const issuerNameEl = dom.createElement('div')
    issuerNameEl.textContent = issuerName || 'Unknown Issuer'
    issuerNameEl.style.cssText = 'font-weight: 600; font-size: 14px;'
    issuerInfo.appendChild(issuerNameEl)

    issuerSection.appendChild(issuerInfo)
    header.appendChild(issuerSection)

    // Verification badge
    const badge = dom.createElement('div')
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      ${isValid
        ? 'background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);'
        : 'background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);'}
    `
    badge.innerHTML = isValid
      ? `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg> Verified`
      : `<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" stroke="#1a1a2e" stroke-width="2"/></svg> Expired`
    header.appendChild(badge)

    content.appendChild(header)

    // Credential type badge
    const typeBadge = dom.createElement('div')
    typeBadge.textContent = credType.toUpperCase()
    typeBadge.style.cssText = `
      display: inline-block;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      font-size: 11px;
      letter-spacing: 1.5px;
      font-weight: 600;
      margin-bottom: 16px;
    `
    content.appendChild(typeBadge)

    // Credential name/title
    if (name || degree) {
      const title = dom.createElement('h1')
      title.textContent = name || degree
      title.style.cssText = `
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.2;
      `
      content.appendChild(title)
    }

    // Description
    if (description || achievement) {
      const desc = dom.createElement('p')
      desc.textContent = description || achievement
      desc.style.cssText = `
        font-size: 14px;
        opacity: 0.8;
        margin: 0 0 24px 0;
        line-height: 1.5;
      `
      content.appendChild(desc)
    }

    // Recipient section
    if (subjectName) {
      const recipientSection = dom.createElement('div')
      recipientSection.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      `

      const recipientLabel = dom.createElement('div')
      recipientLabel.textContent = 'AWARDED TO'
      recipientLabel.style.cssText = 'font-size: 10px; letter-spacing: 1px; opacity: 0.7; margin-bottom: 8px;'
      recipientSection.appendChild(recipientLabel)

      const recipientName = dom.createElement('div')
      recipientName.textContent = subjectName
      recipientName.style.cssText = 'font-size: 22px; font-weight: 700;'
      recipientSection.appendChild(recipientName)

      if (subjectId && subjectId !== subjectName) {
        const recipientId = dom.createElement('div')
        const shortId = subjectId.length > 50 ? subjectId.substring(0, 47) + '...' : subjectId
        recipientId.textContent = shortId
        recipientId.title = subjectId
        recipientId.style.cssText = 'font-size: 11px; opacity: 0.6; font-family: monospace; margin-top: 4px;'
        recipientSection.appendChild(recipientId)
      }

      content.appendChild(recipientSection)
    }

    // Dates row
    const datesRow = dom.createElement('div')
    datesRow.style.cssText = 'display: flex; gap: 32px;'

    if (issuanceDate) {
      const issuedDiv = dom.createElement('div')
      const issuedLabel = dom.createElement('div')
      issuedLabel.textContent = 'ISSUED'
      issuedLabel.style.cssText = 'font-size: 10px; letter-spacing: 1px; opacity: 0.6; margin-bottom: 4px;'
      issuedDiv.appendChild(issuedLabel)

      const issuedDate = dom.createElement('div')
      issuedDate.textContent = new Date(issuanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      issuedDate.style.cssText = 'font-size: 14px; font-weight: 500;'
      issuedDiv.appendChild(issuedDate)

      datesRow.appendChild(issuedDiv)
    }

    if (expirationDate) {
      const expiresDiv = dom.createElement('div')
      const expiresLabel = dom.createElement('div')
      expiresLabel.textContent = 'EXPIRES'
      expiresLabel.style.cssText = 'font-size: 10px; letter-spacing: 1px; opacity: 0.6; margin-bottom: 4px;'
      expiresDiv.appendChild(expiresLabel)

      const expiresDateEl = dom.createElement('div')
      expiresDateEl.textContent = new Date(expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      expiresDateEl.style.cssText = `font-size: 14px; font-weight: 500; ${!isValid ? 'color: #f87171;' : ''}`
      expiresDiv.appendChild(expiresDateEl)

      datesRow.appendChild(expiresDiv)
    }

    if (datesRow.children.length > 0) {
      content.appendChild(datesRow)
    }

    card.appendChild(content)
    div.appendChild(card)

    // Footer note
    const footer = dom.createElement('p')
    footer.style.cssText = `
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
    `
    footer.innerHTML = 'W3C Verifiable Credential · <a href="https://www.w3.org/TR/vc-data-model/" style="color: #667eea;">Learn more</a>'
    div.appendChild(footer)

    return div
  }
}
