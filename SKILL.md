# jsonos - AI Agent Integration Guide

> Render JSON-LD as beautiful UI with one script tag.

## What is jsonos?

jsonos renders [schema.org](https://schema.org) JSON-LD data into rich, interactive views using the `@view` proposal ([W3C JSON-LD Syntax Issue #384](https://github.com/w3c/json-ld-syntax/issues/384)). Data describes itself and hints at its own renderer.

## Quick Start

Add JSON-LD with `@view` to any HTML page, include one script:

```html
<script type="application/ld+json">
{
  "@context": { "schema": "http://schema.org/" },
  "@id": "#me",
  "@type": "schema:Person",
  "@view": "https://jsonos.com/examples/src/panes/person.js",
  "schema:name": "Marie Curie",
  "schema:jobTitle": "Physicist",
  "schema:description": "Pioneer in radioactivity research"
}
</script>
<script src="https://unpkg.com/solid-shim/dist/mashlib.min.js"></script>
```

That's it. The page renders a styled person card.

## How It Works

1. `mashlib.min.js` loads and scans for `<script type="application/ld+json">` blocks
2. JSON-LD is parsed into RDF triples in an in-memory store
3. If `@view` exists, the pane JS module is loaded via dynamic `import()`
4. If `@view` fails or is missing, falls back to `@type`-based pane lookup
5. The pane's `render()` function builds and returns a DOM element

## JSON-LD Data Format

### Required Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `@context` | Namespace definitions | `{ "schema": "http://schema.org/" }` |
| `@type` | Schema.org type | `"schema:Person"` |

### Optional but Recommended

| Field | Purpose | Example |
|-------|---------|---------|
| `@id` | Fragment identifier | `"#me"`, `"#event"`, `"#recipe"` |
| `@view` | URL to pane JS module | `"https://jsonos.com/examples/src/panes/person.js"` |

### Property Conventions

- All properties use `schema:` prefix: `"schema:name"`, `"schema:description"`
- URLs are wrapped in `@id`: `"schema:url": { "@id": "https://example.com" }`
- Images use `@id` too: `"schema:image": { "@id": "https://example.com/photo.jpg" }`
- Dates use ISO 8601: `"schema:startDate": "2025-03-15T09:00:00Z"`
- Durations use ISO 8601: `"schema:prepTime": "PT15M"`
- Nested objects include their own `@type`: `"schema:author": { "@type": "schema:Person", "schema:name": "Chef Bob" }`
- Arrays of primitives: `"schema:recipeIngredient": ["flour", "sugar", "eggs"]`
- Arrays of objects: each item needs `@type`

### Example: Full Event

```json
{
  "@context": { "schema": "http://schema.org/" },
  "@id": "#event",
  "@type": "schema:Event",
  "@view": "https://jsonos.com/examples/src/panes/event.js",
  "schema:name": "WebSummit 2025",
  "schema:description": "The world's largest tech conference",
  "schema:startDate": "2025-11-11T09:00:00Z",
  "schema:endDate": "2025-11-14T18:00:00Z",
  "schema:eventStatus": "EventScheduled",
  "schema:location": "Lisbon, Portugal",
  "schema:organizer": {
    "@type": "schema:Organization",
    "schema:name": "WebSummit"
  },
  "schema:url": { "@id": "https://websummit.com" },
  "schema:image": { "@id": "https://example.com/websummit.jpg" }
}
```

## Available Panes

Built-in panes at `https://jsonos.com/examples/src/panes/`:

| Type | Pane File | Key Properties |
|------|-----------|----------------|
| `schema:Person` | `person.js` | name, jobTitle, description, image, url, knows |
| `schema:Event` | `event.js` | name, startDate, endDate, location, organizer, eventStatus |
| `schema:Article` | `article.js` | headline, author, datePublished, articleBody, publisher |
| `schema:Recipe` | `recipe.js` | name, author, prepTime, cookTime, recipeIngredient, recipeInstructions |
| `schema:Product` | `product.js` | name, brand, offers, aggregateRating, sku, image |
| `schema:Organization` | `organization.js` | name, description, founder, member, foundingDate, logo |
| `schema:Place` | `place.js` | name, description, address, geo, photo |
| `schema:Movie` | `movie.js` | name, director, actor, duration, genre |
| `schema:Book` | `book.js` | name, author, isbn, numberOfPages |
| `schema:Review` | `review.js` | itemReviewed, reviewRating, author, reviewBody |
| `schema:FAQPage` | `faqpage.js` | mainEntity (array of Question/Answer) |
| `schema:HowTo` | `howto.js` | name, step, totalTime, supply |
| `schema:JobPosting` | `jobposting.js` | title, hiringOrganization, baseSalary, jobLocation |
| `schema:Restaurant` | `localbusiness.js` | name, address, openingHours, servesCuisine |
| `schema:LocalBusiness` | `localbusiness.js` | name, address, openingHours, telephone |
| `schema:Service` | `service.js` | name, provider, offers, serviceType |
| `schema:Course` | `course.js` | name, provider, description, coursePrerequisites |
| `schema:VideoObject` | `video.js` | name, thumbnailUrl, uploadDate, duration |
| `schema:MusicRecording` | `musicrecording.js` | name, byArtist, inAlbum, duration |
| `schema:SoftwareApplication` | `softwareapplication.js` | name, operatingSystem, offers, aggregateRating |
| `schema:CreativeWork` | `creativework.js` | name, creator, dateCreated, description |
| `schema:MedicalTestPanel` | `medicaltest.js` | name, provider, subTest, dateCreated |

## Creating a New Pane

A pane is an ES module that exports an object with `name`, `icon`, `label`, and `render`:

```javascript
const SCHEMA = $rdf.Namespace('http://schema.org/')

export default {
  name: 'schemaMyType',

  icon: 'data:image/svg+xml;base64,...',

  // Return a label string if this pane handles the subject, null otherwise
  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)
    if (types[SCHEMA('MyType').uri]) return 'My Type'
    return null
  },

  // Build and return a DOM element
  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    // Query the RDF store
    const name = store.anyValue(subject, SCHEMA('name'))       // string or null
    const image = store.any(subject, SCHEMA('image'))           // node or null
    const items = store.each(subject, SCHEMA('member'))         // array of nodes

    // Get URL from a node
    const imageUrl = image ? (image.uri || image.value) : null

    // Get property of a nested object
    const author = store.any(subject, SCHEMA('author'))
    const authorName = author ? store.anyValue(author, SCHEMA('name')) : null

    // Build DOM (all styling must be inline)
    const div = dom.createElement('div')
    div.className = 'schema-mytype-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 600px;
      margin: 0 auto;
    `

    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = 'margin: 0 0 16px; font-size: 2rem; font-weight: 800;'
      div.appendChild(h1)
    }

    // ... build more DOM elements ...

    return div
  }
}
```

### Store API Reference

| Method | Returns | Use |
|--------|---------|-----|
| `store.anyValue(subject, predicate)` | `string \| null` | Single text value |
| `store.any(subject, predicate)` | `NamedNode \| null` | Single linked resource |
| `store.each(subject, predicate)` | `NamedNode[]` | All values for a predicate |
| `store.findTypeURIs(subject)` | `{ [uri]: true }` | All `@type` URIs |

### Node Value Access

| Pattern | When |
|---------|------|
| `node.uri` | Named nodes (URLs) |
| `node.value` | Literals (strings, dates) |
| `image.uri \|\| image.value` | Safe access for either |

### Pane Rules

- All styling via `style.cssText` (no external stylesheets)
- Set `div.className` to prevent duplicate rendering (checked in `label()`)
- Use `dom.createElement()` not `innerHTML` for security
- The pane must return a complete, self-contained DOM element
- No assumptions about parent container width (use `max-width`)

## Embedding on Any Page

Use `embed.js` for zero-config embedding:

```html
<script type="application/ld+json">
{ "@type": "schema:Person", "@view": "https://jsonos.com/examples/src/panes/person.js", ... }
</script>
<script src="https://jsonos.com/examples/embed.js"></script>
```

Options via data attributes:

| Attribute | Default | Purpose |
|-----------|---------|---------|
| `data-target` | auto-created div | CSS selector for render target |
| `data-subject` | first `@id` found | Fragment ID to render |
| `data-theme` | `"light"` | `"light"` or `"dark"` |

## Links

- Live examples: https://jsonos.com/examples/
- Live editor: https://jsonos.com/examples/editor.html
- GitHub: https://github.com/json-os
- npm: `solid-shim`
- @view proposal: https://github.com/w3c/json-ld-syntax/issues/384
