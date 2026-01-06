/**
 * Schema.org Recipe Pane
 * Beautiful rendering of schema:Recipe
 */

// Simple inline SVG icon as data URI
const RECIPE_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>')

export default {
  name: 'schemaRecipe',

  icon: RECIPE_ICON,

  label: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dominated = context.dom.querySelector('.schema-recipe-pane')
    if (dominated) return null

    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('Recipe').uri]) {
      return 'Recipe'
    }
    return null
  },

  render: function(subject, context) {
    const SCHEMA = $rdf.Namespace('http://schema.org/')
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-recipe-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const prepTime = store.anyValue(subject, SCHEMA('prepTime'))
    const cookTime = store.anyValue(subject, SCHEMA('cookTime'))
    const totalTime = store.anyValue(subject, SCHEMA('totalTime'))
    const recipeYield = store.anyValue(subject, SCHEMA('recipeYield'))
    const category = store.anyValue(subject, SCHEMA('recipeCategory'))
    const cuisine = store.anyValue(subject, SCHEMA('recipeCuisine'))
    const ingredients = store.each(subject, SCHEMA('recipeIngredient'))
    const instructions = store.each(subject, SCHEMA('recipeInstructions'))

    function formatDuration(iso) {
      if (!iso) return null
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
      if (!match) return iso
      const hours = match[1] ? parseInt(match[1]) : 0
      const mins = match[2] ? parseInt(match[2]) : 0
      if (hours && mins) return `${hours}h ${mins}m`
      if (hours) return `${hours}h`
      return `${mins}m`
    }

    // Card
    const card = dom.createElement('div')
    card.style.cssText = `
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    `

    // Hero image
    if (image) {
      const heroWrap = dom.createElement('div')
      heroWrap.style.cssText = `
        position: relative;
        height: 280px;
        overflow: hidden;
      `
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `
      heroWrap.appendChild(img)

      // Gradient overlay
      const overlay = dom.createElement('div')
      overlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(transparent, rgba(0,0,0,0.6));
      `
      heroWrap.appendChild(overlay)

      // Title on image
      if (name) {
        const titleWrap = dom.createElement('div')
        titleWrap.style.cssText = `
          position: absolute;
          bottom: 20px;
          left: 24px;
          right: 24px;
        `
        const h1 = dom.createElement('h1')
        h1.textContent = name
        h1.style.cssText = `
          margin: 0;
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `
        titleWrap.appendChild(h1)
        heroWrap.appendChild(titleWrap)
      }

      card.appendChild(heroWrap)
    }

    const content = dom.createElement('div')
    content.style.cssText = 'padding: 24px;'

    // No image - show title in content
    if (!image && name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 16px 0;
        color: #1a1a2e;
        font-size: 1.75rem;
        font-weight: 700;
      `
      content.appendChild(h1)
    }

    // Time stats
    const stats = dom.createElement('div')
    stats.style.cssText = `
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    `

    const statItems = [
      { icon: '⏱️', label: 'Prep', value: formatDuration(prepTime) },
      { icon: '🍳', label: 'Cook', value: formatDuration(cookTime) },
      { icon: '🍽️', label: 'Serves', value: recipeYield }
    ]

    statItems.forEach(({ icon, label, value }) => {
      if (!value) return
      const stat = dom.createElement('div')
      stat.style.cssText = `
        flex: 1;
        min-width: 80px;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        padding: 16px;
        border-radius: 16px;
        text-align: center;
      `
      const iconEl = dom.createElement('div')
      iconEl.textContent = icon
      iconEl.style.cssText = 'font-size: 1.5rem; margin-bottom: 4px;'
      const labelEl = dom.createElement('div')
      labelEl.textContent = label
      labelEl.style.cssText = 'font-size: 0.7rem; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;'
      const valueEl = dom.createElement('div')
      valueEl.textContent = value
      valueEl.style.cssText = 'font-size: 1rem; color: #166534; font-weight: 700; margin-top: 2px;'
      stat.appendChild(iconEl)
      stat.appendChild(labelEl)
      stat.appendChild(valueEl)
      stats.appendChild(stat)
    })

    content.appendChild(stats)

    // Tags
    if (category || cuisine) {
      const tags = dom.createElement('div')
      tags.style.cssText = 'display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;'

      if (category) {
        const tag = dom.createElement('span')
        tag.textContent = category
        tag.style.cssText = `
          background: #fef3c7;
          color: #92400e;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        `
        tags.appendChild(tag)
      }

      if (cuisine) {
        const tag = dom.createElement('span')
        tag.textContent = cuisine + ' Cuisine'
        tag.style.cssText = `
          background: #fce7f3;
          color: #9d174d;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        `
        tags.appendChild(tag)
      }

      content.appendChild(tags)
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 24px 0;
        color: #64748b;
        line-height: 1.6;
        font-size: 0.95rem;
      `
      content.appendChild(desc)
    }

    // Ingredients
    if (ingredients.length > 0) {
      const section = dom.createElement('div')
      section.style.cssText = `
        background: #f8fafc;
        margin: 0 -24px;
        padding: 24px;
      `

      const h2 = dom.createElement('h2')
      h2.textContent = '🥗 Ingredients'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        color: #1e293b;
        font-weight: 700;
      `
      section.appendChild(h2)

      const list = dom.createElement('ul')
      list.style.cssText = `
        margin: 0;
        padding: 0;
        list-style: none;
      `

      ingredients.forEach(ing => {
        const li = dom.createElement('li')
        li.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.95rem;
        `
        const check = dom.createElement('span')
        check.textContent = '○'
        check.style.cssText = 'color: #16a34a; font-weight: bold;'
        li.appendChild(check)
        const text = dom.createElement('span')
        text.textContent = ing.value
        li.appendChild(text)
        list.appendChild(li)
      })

      section.appendChild(list)
      content.appendChild(section)
    }

    // Instructions
    if (instructions.length > 0) {
      const section = dom.createElement('div')
      section.style.cssText = 'padding-top: 24px;'

      const h2 = dom.createElement('h2')
      h2.textContent = '👨‍🍳 Instructions'
      h2.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        color: #1e293b;
        font-weight: 700;
      `
      section.appendChild(h2)

      instructions.forEach((inst, i) => {
        const step = dom.createElement('div')
        step.style.cssText = `
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        `
        const num = dom.createElement('div')
        num.textContent = i + 1
        num.style.cssText = `
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        `
        const text = dom.createElement('p')
        text.textContent = inst.value
        text.style.cssText = `
          margin: 0;
          color: #475569;
          line-height: 1.6;
          padding-top: 4px;
        `
        step.appendChild(num)
        step.appendChild(text)
        section.appendChild(step)
      })

      content.appendChild(section)
    }

    card.appendChild(content)
    div.appendChild(card)

    return div
  }
}
