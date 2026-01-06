/**
 * Person Composite Pane
 * SolidOS-style profile page with multiple sections
 */

const PERSON_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>')

export default {
  name: 'personComposite',
  icon: PERSON_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const SCHEMA = $rdf.Namespace('http://schema.org/')
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

    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
    const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')

    // Helper to get value from multiple predicates
    function getValue(...predicates) {
      for (const pred of predicates) {
        const val = store.anyValue(subject, pred)
        if (val) return val
      }
      return null
    }

    function getNode(...predicates) {
      for (const pred of predicates) {
        const val = store.any(subject, pred)
        if (val) return val
      }
      return null
    }

    function getAll(...predicates) {
      const results = []
      for (const pred of predicates) {
        const vals = store.each(subject, pred)
        results.push(...vals)
      }
      return results
    }

    // Extract data
    const name = getValue(SCHEMA('name'), FOAF('name'), VCARD('fn')) || 'Unknown'
    const image = getValue(SCHEMA('image'), FOAF('img'), VCARD('hasPhoto'))
    const jobTitle = getValue(SCHEMA('jobTitle'), VCARD('role'))
    const description = getValue(SCHEMA('description'), VCARD('note'))
    const email = getValue(SCHEMA('email'), FOAF('mbox'), VCARD('hasEmail'))
    const url = getValue(SCHEMA('url'), FOAF('homepage'))

    // Organization
    const worksForNode = getNode(SCHEMA('worksFor'))
    let orgName = null
    if (worksForNode) {
      orgName = store.anyValue(worksForNode, SCHEMA('name'))
    }

    // Social links
    const sameAs = getAll(SCHEMA('sameAs'), FOAF('account'))

    // Skills/knows
    const knows = getAll(SCHEMA('knows'), FOAF('knows'))

    // Languages
    const languages = getAll(SCHEMA('knowsLanguage'))

    // Location
    const addressNode = getNode(SCHEMA('address'))
    let location = null
    if (addressNode) {
      const locality = store.anyValue(addressNode, SCHEMA('addressLocality'))
      const region = store.anyValue(addressNode, SCHEMA('addressRegion'))
      location = [locality, region].filter(Boolean).join(', ')
    }

    // Build the composite layout
    const container = dom.createElement('div')
    container.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: white;
      color: #1e293b;
      min-height: 100%;
    `

    // Pane icons bar (decorative)
    const iconsBar = dom.createElement('div')
    iconsBar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    `
    const icons = ['👤', '📇', '🔗', '📝', '⚙️']
    icons.forEach((icon, i) => {
      const iconEl = dom.createElement('span')
      iconEl.textContent = icon
      iconEl.style.cssText = `
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        ${i === 0 ? 'background: #ede9fe;' : ''}
      `
      iconsBar.appendChild(iconEl)
    })
    container.appendChild(iconsBar)

    // Main content area
    const main = dom.createElement('div')
    main.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px;
    `

    // Left column - Photo and basic info
    const leftCol = dom.createElement('div')

    // Photo card
    const photoCard = dom.createElement('div')
    photoCard.style.cssText = `
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    `

    if (image) {
      const img = dom.createElement('img')
      img.src = image
      img.alt = name
      img.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
      `
      photoCard.appendChild(img)
    } else {
      // Placeholder with initials
      const placeholder = dom.createElement('div')
      placeholder.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 6rem;
        font-weight: 700;
        color: white;
      `
      placeholder.textContent = name.split(' ').map(n => n[0]).join('').substring(0, 2)
      photoCard.appendChild(placeholder)
    }
    leftCol.appendChild(photoCard)

    // Name and title
    const nameSection = dom.createElement('div')
    nameSection.style.cssText = 'text-align: center; margin-bottom: 16px;'

    const nameLink = dom.createElement('a')
    nameLink.href = subject.value || '#'
    nameLink.textContent = name
    nameLink.style.cssText = `
      font-size: 1.25rem;
      font-weight: 600;
      color: #6366f1;
      text-decoration: underline;
    `
    nameSection.appendChild(nameLink)

    if (jobTitle && orgName) {
      const titleEl = dom.createElement('div')
      titleEl.textContent = `${jobTitle} at ${orgName}`
      titleEl.style.cssText = 'color: #64748b; font-size: 0.9rem; margin-top: 4px;'
      nameSection.appendChild(titleEl)
    } else if (jobTitle) {
      const titleEl = dom.createElement('div')
      titleEl.textContent = jobTitle
      titleEl.style.cssText = 'color: #64748b; font-size: 0.9rem; margin-top: 4px;'
      nameSection.appendChild(titleEl)
    }

    leftCol.appendChild(nameSection)

    // Action button
    const actionBtn = dom.createElement('button')
    actionBtn.textContent = 'LOGIN TO ADD ME TO YOUR FRIEND LIST'
    actionBtn.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #f472b6;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      margin-bottom: 24px;
    `
    leftCol.appendChild(actionBtn)

    // Follow me on section
    if (sameAs.length > 0) {
      const followSection = dom.createElement('div')
      followSection.style.cssText = `
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      `

      const followTitle = dom.createElement('div')
      followTitle.textContent = 'Follow me on'
      followTitle.style.cssText = `
        text-align: center;
        color: #6366f1;
        font-weight: 600;
        margin-bottom: 12px;
      `
      followSection.appendChild(followTitle)

      const linksContainer = dom.createElement('div')
      linksContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;'

      sameAs.forEach(link => {
        const linkEl = dom.createElement('a')
        linkEl.href = link.value || link
        linkEl.target = '_blank'

        // Try to extract platform name from URL
        let platform = 'Link'
        const url = link.value || link
        if (url.includes('github')) platform = 'GitHub'
        else if (url.includes('twitter') || url.includes('x.com')) platform = 'Twitter'
        else if (url.includes('linkedin')) platform = 'LinkedIn'
        else if (url.includes('mastodon')) platform = 'Mastodon'

        linkEl.textContent = platform
        linkEl.style.cssText = `
          padding: 6px 12px;
          background: #f1f5f9;
          border-radius: 6px;
          color: #475569;
          text-decoration: none;
          font-size: 0.85rem;
        `
        linksContainer.appendChild(linkEl)
      })

      followSection.appendChild(linksContainer)
      leftCol.appendChild(followSection)
    }

    main.appendChild(leftCol)

    // Right column - Bio, Skills, Languages
    const rightCol = dom.createElement('div')

    // Bio section
    const bioSection = dom.createElement('div')
    bioSection.style.cssText = `
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    `

    const bioTitle = dom.createElement('div')
    bioTitle.textContent = 'Bio'
    bioTitle.style.cssText = `
      text-align: center;
      color: #6366f1;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    `
    bioSection.appendChild(bioTitle)

    if (jobTitle && orgName) {
      const roleEl = dom.createElement('div')
      roleEl.innerHTML = `<strong>${orgName}.</strong> ${jobTitle}`
      roleEl.style.cssText = 'margin-bottom: 16px; color: #334155;'
      bioSection.appendChild(roleEl)
    }

    if (description) {
      const descEl = dom.createElement('div')
      descEl.textContent = description
      descEl.style.cssText = 'color: #64748b; line-height: 1.6;'
      bioSection.appendChild(descEl)
    }

    // Skills subsection
    const skillsTitle = dom.createElement('div')
    skillsTitle.textContent = 'Skills'
    skillsTitle.style.cssText = `
      text-align: center;
      color: #6366f1;
      font-weight: 600;
      margin: 16px 0 8px;
    `
    bioSection.appendChild(skillsTitle)

    // Languages subsection
    if (languages.length > 0) {
      const langTitle = dom.createElement('div')
      langTitle.textContent = 'Languages'
      langTitle.style.cssText = `
        text-align: center;
        color: #6366f1;
        font-weight: 600;
        margin: 16px 0 8px;
      `
      bioSection.appendChild(langTitle)

      languages.forEach(lang => {
        const langEl = dom.createElement('div')
        langEl.textContent = lang.value || lang
        langEl.style.cssText = 'text-align: center; color: #334155;'
        bioSection.appendChild(langEl)
      })
    }

    rightCol.appendChild(bioSection)

    // Stuff section (links/connections)
    if (knows.length > 0 || url) {
      const stuffSection = dom.createElement('div')
      stuffSection.style.cssText = `
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      `

      const stuffTitle = dom.createElement('div')
      stuffTitle.textContent = 'Stuff'
      stuffTitle.style.cssText = `
        text-align: center;
        color: #6366f1;
        font-weight: 600;
        margin-bottom: 12px;
      `
      stuffSection.appendChild(stuffTitle)

      if (url) {
        const urlEl = dom.createElement('a')
        urlEl.href = url
        urlEl.textContent = url
        urlEl.target = '_blank'
        urlEl.style.cssText = `
          display: block;
          color: #6366f1;
          text-decoration: none;
          margin-bottom: 8px;
          word-break: break-all;
        `
        stuffSection.appendChild(urlEl)
      }

      if (email) {
        const emailEl = dom.createElement('a')
        emailEl.href = `mailto:${email.replace('mailto:', '')}`
        emailEl.textContent = email.replace('mailto:', '')
        emailEl.style.cssText = `
          display: block;
          color: #6366f1;
          text-decoration: none;
        `
        stuffSection.appendChild(emailEl)
      }

      rightCol.appendChild(stuffSection)
    }

    main.appendChild(rightCol)
    container.appendChild(main)

    return container
  }
}
