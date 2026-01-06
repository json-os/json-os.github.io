/**
 * Schema.org Course Pane
 * Beautiful rendering of schema:Course
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

const COURSE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>')

const coursePane = {
  name: 'schemaCourse',
  icon: COURSE_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Course').uri]) {
      return 'Course'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-course-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const provider = store.any(subject, SCHEMA('provider'))
    const courseCode = store.anyValue(subject, SCHEMA('courseCode'))
    const educationalLevel = store.anyValue(subject, SCHEMA('educationalLevel'))
    const timeRequired = store.anyValue(subject, SCHEMA('timeRequired'))
    const hasCourseInstance = store.each(subject, SCHEMA('hasCourseInstance'))
    const aggregateRating = store.any(subject, SCHEMA('aggregateRating'))
    const url = store.any(subject, SCHEMA('url'))

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    `

    // Hero section with gradient
    const hero = dom.createElement('div')
    hero.style.cssText = `
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 48px;
      position: relative;
    `

    // Course code badge
    if (courseCode) {
      const badge = dom.createElement('div')
      badge.textContent = courseCode
      badge.style.cssText = `
        display: inline-block;
        background: rgba(255,255,255,0.2);
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 20px;
      `
      hero.appendChild(badge)
    }

    // Title
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 2.25rem;
        font-weight: 700;
        color: white;
        line-height: 1.2;
      `
      hero.appendChild(h1)
    }

    // Provider
    if (provider) {
      const providerName = store.anyValue(provider, SCHEMA('name'))
      const providerLogo = store.any(provider, SCHEMA('logo'))

      if (providerName) {
        const providerEl = dom.createElement('div')
        providerEl.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        `

        if (providerLogo) {
          const logo = dom.createElement('img')
          logo.src = providerLogo.uri || providerLogo.value
          logo.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: white;
            object-fit: contain;
          `
          providerEl.appendChild(logo)
        }

        const nameEl = dom.createElement('span')
        nameEl.textContent = 'by ' + providerName
        nameEl.style.cssText = 'color: rgba(255,255,255,0.9); font-size: 1rem;'
        providerEl.appendChild(nameEl)

        hero.appendChild(providerEl)
      }
    }

    // Stats row
    const stats = dom.createElement('div')
    stats.style.cssText = `
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    `

    if (aggregateRating) {
      const ratingValue = store.anyValue(aggregateRating, SCHEMA('ratingValue'))
      const reviewCount = store.anyValue(aggregateRating, SCHEMA('reviewCount'))
      if (ratingValue) {
        const stat = dom.createElement('div')
        stat.style.cssText = 'display: flex; align-items: center; gap: 8px; color: white;'
        stat.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#fbbf24;stroke:#fbbf24;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style="font-weight: 600;">${ratingValue}</span>
          ${reviewCount ? `<span style="opacity: 0.8;">(${reviewCount} reviews)</span>` : ''}
        `
        stats.appendChild(stat)
      }
    }

    if (timeRequired) {
      const stat = dom.createElement('div')
      stat.style.cssText = 'display: flex; align-items: center; gap: 8px; color: white;'
      // Parse ISO duration
      let timeText = timeRequired
      const match = timeRequired.match(/PT?(?:(\d+)H)?(?:(\d+)M)?/)
      if (match) {
        const h = match[1] ? parseInt(match[1]) : 0
        const m = match[2] ? parseInt(match[2]) : 0
        timeText = h > 0 ? `${h} hours` : `${m} min`
      }
      stat.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:white;fill:none;stroke-width:2;">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>${timeText}</span>
      `
      stats.appendChild(stat)
    }

    if (educationalLevel) {
      const stat = dom.createElement('div')
      stat.style.cssText = 'display: flex; align-items: center; gap: 8px; color: white;'
      stat.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:white;fill:none;stroke-width:2;">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        </svg>
        <span>${educationalLevel}</span>
      `
      stats.appendChild(stat)
    }

    if (stats.children.length > 0) {
      hero.appendChild(stats)
    }

    card.appendChild(hero)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = 'padding: 40px;'

    // Description
    if (description) {
      const h2 = dom.createElement('h2')
      h2.textContent = 'About This Course'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
      `
      content.appendChild(h2)

      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 32px 0;
        color: #64748b;
        line-height: 1.8;
        font-size: 1rem;
      `
      content.appendChild(desc)
    }

    // Course instances (sessions)
    if (hasCourseInstance.length > 0) {
      const instancesSection = dom.createElement('div')
      instancesSection.style.cssText = 'margin-bottom: 32px;'

      const h2 = dom.createElement('h2')
      h2.textContent = 'Available Sessions'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
      `
      instancesSection.appendChild(h2)

      hasCourseInstance.forEach(instance => {
        const startDate = store.anyValue(instance, SCHEMA('startDate'))
        const endDate = store.anyValue(instance, SCHEMA('endDate'))
        const location = store.any(instance, SCHEMA('location'))

        const instanceEl = dom.createElement('div')
        instanceEl.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 12px;
        `

        const info = dom.createElement('div')
        if (startDate) {
          const d = new Date(startDate)
          const dateEl = dom.createElement('div')
          dateEl.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          dateEl.style.cssText = 'font-weight: 600; color: #1e293b;'
          info.appendChild(dateEl)
        }
        if (location) {
          const locName = store.anyValue(location, SCHEMA('name')) || 'Online'
          const locEl = dom.createElement('div')
          locEl.textContent = locName
          locEl.style.cssText = 'font-size: 0.9rem; color: #64748b; margin-top: 4px;'
          info.appendChild(locEl)
        }
        instanceEl.appendChild(info)

        const enrollBtn = dom.createElement('button')
        enrollBtn.textContent = 'Enroll'
        enrollBtn.style.cssText = `
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        `
        instanceEl.appendChild(enrollBtn)

        instancesSection.appendChild(instanceEl)
      })

      content.appendChild(instancesSection)
    }

    // CTA button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'View Course'
      btn.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
        padding: 16px 40px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)'
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

if (typeof panes !== 'undefined' && panes.register) {
  panes.register(coursePane)
}

if (typeof window !== 'undefined') {
  window.SchemaCoursePane = coursePane
}

})();
