# jsonos Examples

Self-describing JSON-LD with the `@view` proposal. Data that knows how to display itself.

## The Idea

JSON-LD describes *what* data is, but not *how* to display it. The `@view` property fixes this:

```json
{
  "@type": "schema:Person",
  "@view": "https://jsonos.com/examples/src/panes/person.js",
  "schema:name": "Marie Curie"
}
```

The data carries its own renderer. No external configuration needed.

## Live Editor

Try it: [editor.html](https://jsonos.com/examples/editor.html)

- Edit JSON-LD (top-left)
- Edit pane code (bottom-left)
- See live preview (right)

Change the render code and watch the output update instantly.

## One-Line Embed

Add any schema.org type to your page:

```html
<script type="application/ld+json">
{
  "@type": "schema:Person",
  "@view": "https://jsonos.com/examples/src/panes/person.js",
  "schema:name": "Marie Curie"
}
</script>
<script src="https://unpkg.com/solid-shim/dist/mashlib.min.js"></script>
```

That's it. The `@view` triggers automatic rendering.

## 20 Schema.org Types

| Type | Example | Pane |
|------|---------|------|
| Person | [person.html](person.html) | [person.js](src/panes/person.js) |
| Article | [article.html](article.html) | [article.js](src/panes/article.js) |
| Event | [event.html](event.html) | [event.js](src/panes/event.js) |
| Organization | [organization.html](organization.html) | [organization.js](src/panes/organization.js) |
| Recipe | [recipe.html](recipe.html) | [recipe.js](src/panes/recipe.js) |
| Product | [product.html](product.html) | [product.js](src/panes/product.js) |
| Place | [place.html](place.html) | [place.js](src/panes/place.js) |
| Movie | [movie.html](movie.html) | [movie.js](src/panes/movie.js) |
| Book | [book.html](book.html) | [book.js](src/panes/book.js) |
| Review | [review.html](review.html) | [review.js](src/panes/review.js) |
| FAQPage | [faqpage.html](faqpage.html) | [faqpage.js](src/panes/faqpage.js) |
| HowTo | [howto.html](howto.html) | [howto.js](src/panes/howto.js) |
| JobPosting | [jobposting.html](jobposting.html) | [jobposting.js](src/panes/jobposting.js) |
| LocalBusiness | [localbusiness.html](localbusiness.html) | [localbusiness.js](src/panes/localbusiness.js) |
| Service | [service.html](service.html) | [service.js](src/panes/service.js) |
| Course | [course.html](course.html) | [course.js](src/panes/course.js) |
| Video | [video.html](video.html) | [video.js](src/panes/video.js) |
| Music | [musicrecording.html](musicrecording.html) | [musicrecording.js](src/panes/musicrecording.js) |
| Software | [softwareapplication.html](softwareapplication.html) | [softwareapplication.js](src/panes/softwareapplication.js) |
| CreativeWork | [creativework.html](creativework.html) | [creativework.js](src/panes/creativework.js) |

## Writing a Pane

Panes are ES modules with a `render` function:

```javascript
export default {
  name: 'myPane',

  render(subject, context) {
    const store = context.session.store;
    const SCHEMA = $rdf.Namespace('http://schema.org/');

    const name = store.anyValue(subject, SCHEMA('name'));

    const div = document.createElement('div');
    div.textContent = name;
    return div;
  }
}
```

The `context.session.store` is an rdflib store with the parsed JSON-LD.

## The @view Proposal

See [W3C JSON-LD Syntax Issue #384](https://github.com/w3c/json-ld-syntax/issues/384)

Benefits:
- **Self-describing** - Data carries its own display hint
- **Decentralized** - Anyone can publish views
- **Progressive** - Processors that don't support @view ignore it
- **Extensible** - New types get views immediately

## Links

- [Live Editor](https://jsonos.com/examples/editor.html)
- [@view Documentation](https://jsonos.com/examples/view.html)
- [solid-shim on npm](https://www.npmjs.com/package/solid-shim)
- [W3C Proposal](https://github.com/w3c/json-ld-syntax/issues/384)
