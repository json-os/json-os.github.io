/**
 * Schema.org Event Pane
 * Beautiful rendering of schema:Event
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

// Simple inline SVG icon as data URI
const EVENT_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>')

const eventPane = {
  name: 'schemaEvent',

  icon: EVENT_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const dominated = context.dom.querySelector('.schema-event-pane')
    if (dominated) return null

    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Event').uri]) {
      return 'Event'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-event-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 500px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const startDate = store.anyValue(subject, SCHEMA('startDate'))
    const endDate = store.anyValue(subject, SCHEMA('endDate'))
    const location = store.anyValue(subject, SCHEMA('location'))
    const eventStatus = store.anyValue(subject, SCHEMA('eventStatus'))
    const organizer = store.any(subject, SCHEMA('organizer'))
    const url = store.any(subject, SCHEMA('url'))

    // Card with glassmorphism
    const card = dom.createElement('div')
    card.style.cssText = `
      position: relative;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(30, 27, 75, 0.5);
    `

    // Decorative circles
    const circle1 = dom.createElement('div')
    circle1.style.cssText = `
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    `
    card.appendChild(circle1)

    const circle2 = dom.createElement('div')
    circle2.style.cssText = `
      position: absolute;
      bottom: -80px;
      left: -80px;
      width: 250px;
      height: 250px;
      background: rgba(255,255,255,0.03);
      border-radius: 50%;
    `
    card.appendChild(circle2)

    // Content
    const content = dom.createElement('div')
    content.style.cssText = `
      position: relative;
      padding: 32px;
      color: white;
    `

    // Status badge
    if (eventStatus) {
      const status = eventStatus.replace('Event', '').replace('https://schema.org/', '')
      const badge = dom.createElement('div')
      badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 20px;
      `
      const dot = dom.createElement('span')
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        animation: pulse 2s infinite;
      `
      badge.appendChild(dot)
      badge.appendChild(dom.createTextNode(status))
      content.appendChild(badge)

      // Add pulse animation
      const style = dom.createElement('style')
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `
      div.appendChild(style)
    }

    // Event name
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -0.02em;
      `
      content.appendChild(h1)
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 28px 0;
        opacity: 0.85;
        line-height: 1.6;
        font-size: 0.95rem;
      `
      content.appendChild(desc)
    }

    // Date/time card
    if (startDate) {
      const dateCard = dom.createElement('div')
      dateCard.style.cssText = `
        display: flex;
        gap: 16px;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
      `

      const start = new Date(startDate)

      // Calendar icon
      const calIcon = dom.createElement('div')
      calIcon.style.cssText = `
        width: 56px;
        height: 56px;
        background: white;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      `
      const month = dom.createElement('div')
      month.textContent = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      month.style.cssText = 'color: #dc2626; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em;'
      const day = dom.createElement('div')
      day.textContent = start.getDate()
      day.style.cssText = 'color: #1e1b4b; font-size: 1.5rem; font-weight: 800; line-height: 1;'
      calIcon.appendChild(month)
      calIcon.appendChild(day)
      dateCard.appendChild(calIcon)

      // Date details
      const dateInfo = dom.createElement('div')
      dateInfo.style.cssText = 'display: flex; flex-direction: column; justify-content: center;'

      const dayName = dom.createElement('div')
      dayName.textContent = start.toLocaleDateString('en-US', { weekday: 'long' })
      dayName.style.cssText = 'font-weight: 600; font-size: 1rem; margin-bottom: 4px;'
      dateInfo.appendChild(dayName)

      const timeStr = dom.createElement('div')
      let timeText = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      if (endDate) {
        const end = new Date(endDate)
        timeText += ' - ' + end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      timeStr.textContent = timeText
      timeStr.style.cssText = 'opacity: 0.7; font-size: 0.9rem;'
      dateInfo.appendChild(timeStr)

      dateCard.appendChild(dateInfo)
      content.appendChild(dateCard)
    }

    // Location
    if (location) {
      const locRow = dom.createElement('div')
      locRow.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        opacity: 0.9;
      `
      const icon = dom.createElement('span')
      icon.textContent = '📍'
      icon.style.cssText = 'font-size: 1.25rem;'
      locRow.appendChild(icon)
      const locText = dom.createElement('span')
      locText.textContent = location
      locText.style.cssText = 'font-size: 0.95rem;'
      locRow.appendChild(locText)
      content.appendChild(locRow)
    }

    // Organizer
    if (organizer) {
      const orgName = store.anyValue(organizer, SCHEMA('name'))
      if (orgName) {
        const orgRow = dom.createElement('div')
        orgRow.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          opacity: 0.9;
        `
        const icon = dom.createElement('span')
        icon.textContent = '🏢'
        icon.style.cssText = 'font-size: 1.25rem;'
        orgRow.appendChild(icon)
        const text = dom.createElement('span')
        text.textContent = 'By ' + orgName
        text.style.cssText = 'font-size: 0.95rem;'
        orgRow.appendChild(text)
        content.appendChild(orgRow)
      }
    }

    // Join button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Register Now'
      btn.style.cssText = `
        display: block;
        text-align: center;
        background: white;
        color: #1e1b4b;
        padding: 16px 32px;
        border-radius: 12px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'
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

// Register with panes
if (typeof panes !== 'undefined' && panes.register) {
  panes.register(eventPane)
}

// Export
if (typeof window !== 'undefined') {
  window.SchemaEventPane = eventPane
}

})();
