/**
 * Schema.org Organization Pane
 * Beautiful rendering of schema:Organization
 */

// Simple inline SVG icon as data URI
const ORG_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 11v4"/><path d="M8 11v4"/><path d="M16 11v4"/></svg>')

export default {
  name: 'schemaOrganization',

  icon: ORG_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dominated = context.dom.querySelector('.schema-organization-pane')
    if (dominated) return null

    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Organization').uri] || types[SCHEMA('Corporation').uri] || types[SCHEMA('LocalBusiness').uri]) {
      return 'Organization'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-organization-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 560px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const logo = store.any(subject, SCHEMA('logo'))
    const url = store.any(subject, SCHEMA('url'))
    const foundingDate = store.anyValue(subject, SCHEMA('foundingDate'))
    const founder = store.any(subject, SCHEMA('founder'))
    const members = store.each(subject, SCHEMA('member'))
    const email = store.anyValue(subject, SCHEMA('email'))
    const telephone = store.anyValue(subject, SCHEMA('telephone'))

    // Main card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    `

    // Header with gradient
    const header = dom.createElement('div')
    header.style.cssText = `
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      padding: 40px 32px;
      text-align: center;
      position: relative;
    `

    // Logo
    if (logo) {
      const logoWrap = dom.createElement('div')
      logoWrap.style.cssText = `
        width: 100px;
        height: 100px;
        background: white;
        border-radius: 20px;
        padding: 16px;
        margin: 0 auto 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      `
      const img = dom.createElement('img')
      img.src = logo.uri || logo.value
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
      `
      logoWrap.appendChild(img)
      header.appendChild(logoWrap)
    }

    // Name
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0;
        color: white;
        font-size: 1.75rem;
        font-weight: 700;
      `
      header.appendChild(h1)
    }

    // Founded year
    if (foundingDate) {
      const founded = dom.createElement('div')
      founded.textContent = 'Est. ' + foundingDate
      founded.style.cssText = `
        margin-top: 8px;
        color: rgba(255,255,255,0.8);
        font-size: 0.9rem;
      `
      header.appendChild(founded)
    }

    card.appendChild(header)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 32px;'

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 24px 0;
        color: #475569;
        line-height: 1.7;
        font-size: 1rem;
        text-align: center;
      `
      content.appendChild(desc)
    }

    // Stats row
    const stats = dom.createElement('div')
    stats.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 32px;
      padding: 20px 0;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    `

    if (foundingDate) {
      const years = new Date().getFullYear() - parseInt(foundingDate)
      if (years > 0) {
        const stat = dom.createElement('div')
        stat.style.cssText = 'text-align: center;'
        const val = dom.createElement('div')
        val.textContent = years + '+'
        val.style.cssText = 'font-size: 1.5rem; font-weight: 700; color: #0ea5e9;'
        const label = dom.createElement('div')
        label.textContent = 'Years'
        label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
        stat.appendChild(val)
        stat.appendChild(label)
        stats.appendChild(stat)
      }
    }

    if (members.length > 0) {
      const stat = dom.createElement('div')
      stat.style.cssText = 'text-align: center;'
      const val = dom.createElement('div')
      val.textContent = members.length
      val.style.cssText = 'font-size: 1.5rem; font-weight: 700; color: #0ea5e9;'
      const label = dom.createElement('div')
      label.textContent = 'Team'
      label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
      stat.appendChild(val)
      stat.appendChild(label)
      stats.appendChild(stat)
    }

    if (stats.children.length > 0) {
      content.appendChild(stats)
    }

    // Founder
    if (founder) {
      const founderName = store.anyValue(founder, SCHEMA('name'))
      if (founderName) {
        const section = dom.createElement('div')
        section.style.cssText = 'margin-bottom: 24px;'

        const label = dom.createElement('div')
        label.textContent = 'Founded by'
        label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;'
        section.appendChild(label)

        const founderCard = dom.createElement('div')
        founderCard.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 12px;
        `

        const avatar = dom.createElement('div')
        avatar.textContent = founderName.charAt(0).toUpperCase()
        avatar.style.cssText = `
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        `
        founderCard.appendChild(avatar)

        const nameEl = dom.createElement('div')
        nameEl.textContent = founderName
        nameEl.style.cssText = 'font-weight: 600; color: #1e293b;'
        founderCard.appendChild(nameEl)

        section.appendChild(founderCard)
        content.appendChild(section)
      }
    }

    // Team members
    if (members.length > 0) {
      const section = dom.createElement('div')
      section.style.cssText = 'margin-bottom: 24px;'

      const label = dom.createElement('div')
      label.textContent = 'Team Members'
      label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;'
      section.appendChild(label)

      const grid = dom.createElement('div')
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      `

      members.forEach(member => {
        const memberName = store.anyValue(member, SCHEMA('name'))
        const memberTitle = store.anyValue(member, SCHEMA('jobTitle'))

        if (memberName) {
          const memberCard = dom.createElement('div')
          memberCard.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f8fafc;
            padding: 12px;
            border-radius: 12px;
          `

          const avatar = dom.createElement('div')
          avatar.textContent = memberName.charAt(0).toUpperCase()
          avatar.style.cssText = `
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            color: #0284c7;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
          `
          memberCard.appendChild(avatar)

          const info = dom.createElement('div')
          const nameEl = dom.createElement('div')
          nameEl.textContent = memberName
          nameEl.style.cssText = 'font-weight: 600; color: #1e293b; font-size: 0.9rem;'
          info.appendChild(nameEl)

          if (memberTitle) {
            const title = dom.createElement('div')
            title.textContent = memberTitle
            title.style.cssText = 'color: #64748b; font-size: 0.8rem;'
            info.appendChild(title)
          }

          memberCard.appendChild(info)
          grid.appendChild(memberCard)
        }
      })

      section.appendChild(grid)
      content.appendChild(section)
    }

    // Contact / Actions
    const actions = dom.createElement('div')
    actions.style.cssText = `
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    `

    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Visit Website'
      btn.style.cssText = `
        flex: 1;
        min-width: 140px;
        display: block;
        text-align: center;
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
      `
      actions.appendChild(btn)
    }

    if (email) {
      const btn = dom.createElement('a')
      btn.href = 'mailto:' + email
      btn.textContent = 'Contact'
      btn.style.cssText = `
        flex: 1;
        min-width: 140px;
        display: block;
        text-align: center;
        background: #f1f5f9;
        color: #0284c7;
        padding: 14px 24px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
      `
      actions.appendChild(btn)
    }

    if (actions.children.length > 0) {
      content.appendChild(actions)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}
