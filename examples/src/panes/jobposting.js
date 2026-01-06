/**
 * Schema.org JobPosting Pane
 * Beautiful rendering of schema:JobPosting
 */

const JOB_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>')

export default {
  name: 'schemaJobPosting',
  icon: JOB_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('JobPosting').uri]) {
      return 'Job'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-jobposting-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background: #fafafa;
    `

    // Get properties
    const title = store.anyValue(subject, SCHEMA('title'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const hiringOrganization = store.any(subject, SCHEMA('hiringOrganization'))
    const jobLocation = store.any(subject, SCHEMA('jobLocation'))
    const employmentType = store.anyValue(subject, SCHEMA('employmentType'))
    const baseSalary = store.any(subject, SCHEMA('baseSalary'))
    const datePosted = store.anyValue(subject, SCHEMA('datePosted'))
    const validThrough = store.anyValue(subject, SCHEMA('validThrough'))
    const skills = store.anyValue(subject, SCHEMA('skills'))
    const qualifications = store.anyValue(subject, SCHEMA('qualifications'))
    const responsibilities = store.anyValue(subject, SCHEMA('responsibilities'))
    const url = store.any(subject, SCHEMA('url'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    `

    const content = dom.createElement('div')
    content.style.cssText = 'padding: 40px;'

    // Company header
    if (hiringOrganization) {
      const orgName = store.anyValue(hiringOrganization, SCHEMA('name'))
      const orgLogo = store.any(hiringOrganization, SCHEMA('logo'))

      const header = dom.createElement('div')
      header.style.cssText = `
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      `

      if (orgLogo) {
        const logo = dom.createElement('img')
        logo.src = orgLogo.uri || orgLogo.value
        logo.style.cssText = `
          width: 64px;
          height: 64px;
          border-radius: 12px;
          object-fit: contain;
          background: #f8fafc;
          padding: 8px;
        `
        header.appendChild(logo)
      } else if (orgName) {
        const avatar = dom.createElement('div')
        avatar.textContent = orgName.charAt(0).toUpperCase()
        avatar.style.cssText = `
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        `
        header.appendChild(avatar)
      }

      if (orgName) {
        const nameEl = dom.createElement('div')
        nameEl.textContent = orgName
        nameEl.style.cssText = `
          font-size: 1.1rem;
          font-weight: 600;
          color: #64748b;
        `
        header.appendChild(nameEl)
      }

      content.appendChild(header)
    }

    // Job title
    if (title) {
      const h1 = dom.createElement('h1')
      h1.textContent = title
      h1.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
      `
      content.appendChild(h1)
    }

    // Tags row
    const tags = dom.createElement('div')
    tags.style.cssText = 'display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap;'

    if (employmentType) {
      const tag = dom.createElement('span')
      tag.textContent = employmentType.replace(/_/g, ' ')
      tag.style.cssText = `
        background: #dbeafe;
        color: #1d4ed8;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
      `
      tags.appendChild(tag)
    }

    if (jobLocation) {
      const locName = store.anyValue(jobLocation, SCHEMA('name'))
      const address = store.any(jobLocation, SCHEMA('address'))
      let locationText = locName

      if (address) {
        const locality = store.anyValue(address, SCHEMA('addressLocality'))
        const region = store.anyValue(address, SCHEMA('addressRegion'))
        locationText = [locality, region].filter(Boolean).join(', ') || locName
      }

      if (locationText) {
        const tag = dom.createElement('span')
        tag.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-3px;margin-right:6px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${locationText}
        `
        tag.style.cssText = `
          background: #f1f5f9;
          color: #475569;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        `
        tags.appendChild(tag)
      }
    }

    if (tags.children.length > 0) {
      content.appendChild(tags)
    }

    // Salary
    if (baseSalary) {
      const salaryValue = store.anyValue(baseSalary, SCHEMA('value'))
      const currency = store.anyValue(baseSalary, SCHEMA('currency')) || 'USD'
      const minValue = store.anyValue(baseSalary, SCHEMA('minValue'))
      const maxValue = store.anyValue(baseSalary, SCHEMA('maxValue'))

      let salaryText = ''
      if (minValue && maxValue) {
        salaryText = `${currency === 'USD' ? '$' : currency}${parseInt(minValue).toLocaleString()} - ${currency === 'USD' ? '$' : currency}${parseInt(maxValue).toLocaleString()}`
      } else if (salaryValue) {
        salaryText = `${currency === 'USD' ? '$' : currency}${parseInt(salaryValue).toLocaleString()}`
      }

      if (salaryText) {
        const salaryEl = dom.createElement('div')
        salaryEl.style.cssText = `
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          padding: 20px 24px;
          border-radius: 16px;
          margin-bottom: 28px;
        `
        const label = dom.createElement('div')
        label.textContent = 'Salary Range'
        label.style.cssText = 'font-size: 0.8rem; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;'
        const value = dom.createElement('div')
        value.textContent = salaryText + ' / year'
        value.style.cssText = 'font-size: 1.5rem; font-weight: 700; color: #14532d;'
        salaryEl.appendChild(label)
        salaryEl.appendChild(value)
        content.appendChild(salaryEl)
      }
    }

    // Description
    if (description) {
      const section = dom.createElement('div')
      section.style.cssText = 'margin-bottom: 28px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'About the Role'
      h2.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #0f172a;
      `
      section.appendChild(h2)

      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0;
        color: #475569;
        line-height: 1.8;
      `
      section.appendChild(desc)
      content.appendChild(section)
    }

    // Responsibilities
    if (responsibilities) {
      const section = dom.createElement('div')
      section.style.cssText = 'margin-bottom: 28px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'Responsibilities'
      h2.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #0f172a;
      `
      section.appendChild(h2)

      const list = dom.createElement('ul')
      list.style.cssText = 'margin: 0; padding: 0 0 0 20px; color: #475569; line-height: 1.8;'
      responsibilities.split(/[,;\n]/).forEach(item => {
        if (item.trim()) {
          const li = dom.createElement('li')
          li.textContent = item.trim()
          li.style.cssText = 'margin-bottom: 8px;'
          list.appendChild(li)
        }
      })
      section.appendChild(list)
      content.appendChild(section)
    }

    // Qualifications
    if (qualifications) {
      const section = dom.createElement('div')
      section.style.cssText = 'margin-bottom: 28px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'Qualifications'
      h2.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #0f172a;
      `
      section.appendChild(h2)

      const list = dom.createElement('ul')
      list.style.cssText = 'margin: 0; padding: 0 0 0 20px; color: #475569; line-height: 1.8;'
      qualifications.split(/[,;\n]/).forEach(item => {
        if (item.trim()) {
          const li = dom.createElement('li')
          li.textContent = item.trim()
          li.style.cssText = 'margin-bottom: 8px;'
          list.appendChild(li)
        }
      })
      section.appendChild(list)
      content.appendChild(section)
    }

    // Skills
    if (skills) {
      const section = dom.createElement('div')
      section.style.cssText = 'margin-bottom: 28px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'Required Skills'
      h2.style.cssText = `
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #0f172a;
      `
      section.appendChild(h2)

      const skillTags = dom.createElement('div')
      skillTags.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;'
      skills.split(/[,;]/).forEach(skill => {
        if (skill.trim()) {
          const tag = dom.createElement('span')
          tag.textContent = skill.trim()
          tag.style.cssText = `
            background: #f3e8ff;
            color: #7c3aed;
            padding: 6px 14px;
            border-radius: 16px;
            font-size: 0.9rem;
            font-weight: 500;
          `
          skillTags.appendChild(tag)
        }
      })
      section.appendChild(skillTags)
      content.appendChild(section)
    }

    // Posted date and deadline
    const meta = dom.createElement('div')
    meta.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 28px;
    `

    if (datePosted) {
      const d = new Date(datePosted)
      const el = dom.createElement('div')
      el.textContent = 'Posted ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      meta.appendChild(el)
    }

    if (validThrough) {
      const d = new Date(validThrough)
      const el = dom.createElement('div')
      el.textContent = 'Apply by ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      el.style.cssText = 'color: #dc2626; font-weight: 500;'
      meta.appendChild(el)
    }

    if (meta.children.length > 0) {
      content.appendChild(meta)
    }

    // Apply button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Apply Now'
      btn.style.cssText = `
        display: block;
        text-align: center;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 18px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.4)'
      }
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)'
        btn.style.boxShadow = 'none'
      }
      content.appendChild(btn)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}
