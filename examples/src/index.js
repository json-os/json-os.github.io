/**
 * schemapanes v0.0.1
 * Schema.org panes for SolidOS
 *
 * @license AGPL-3.0
 */

(function(global) {
'use strict';

const VERSION = '0.0.1'

// Schema.org namespace
const SCHEMA = 'http://schema.org/'

// Bundled labels to avoid CORS fetches
const LABELS = {
  'http://schema.org/Person': 'Person',
  'http://schema.org/Event': 'Event',
  'http://schema.org/Article': 'Article',
  'http://schema.org/Organization': 'Organization',
  'http://schema.org/Product': 'Product',
  'http://schema.org/Recipe': 'Recipe',
  'http://schema.org/Place': 'Place',
  'http://schema.org/name': 'Name',
  'http://schema.org/description': 'Description',
  'http://schema.org/image': 'Image',
  'http://schema.org/url': 'URL',
  'http://schema.org/startDate': 'Start Date',
  'http://schema.org/endDate': 'End Date',
  'http://schema.org/location': 'Location',
  'http://schema.org/author': 'Author',
  'http://schema.org/datePublished': 'Published',
  'http://schema.org/headline': 'Headline'
}

/**
 * Pre-populate rdflib's label cache to avoid CORS fetches
 */
function preloadLabels() {
  if (typeof $rdf === 'undefined') return

  const store = $rdf.graph()
  const RDFS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#')

  Object.entries(LABELS).forEach(([uri, label]) => {
    store.add($rdf.sym(uri), RDFS('label'), label)
  })
}

/**
 * Register schema.org panes with SolidOS
 */
function register() {
  if (typeof panes === 'undefined') {
    console.error('schemapanes: panes not found. Load mashlib first.')
    return false
  }

  preloadLabels()

  // Register custom panes
  if (typeof window !== 'undefined') {
    if (window.SchemaPersonPane) panes.register(window.SchemaPersonPane)
    if (window.SchemaRecipePane) panes.register(window.SchemaRecipePane)
    if (window.SchemaArticlePane) panes.register(window.SchemaArticlePane)
    if (window.SchemaEventPane) panes.register(window.SchemaEventPane)
    if (window.SchemaOrganizationPane) panes.register(window.SchemaOrganizationPane)
  }

  console.log(`schemapanes v${VERSION} loaded`)
  return true
}

// Auto-register when mashlib is ready
function autoRegister() {
  if (typeof panes !== 'undefined') {
    register()
  } else {
    // Wait for mashlib
    const check = setInterval(() => {
      if (typeof panes !== 'undefined') {
        clearInterval(check)
        register()
      }
    }, 100)

    // Give up after 10 seconds
    setTimeout(() => clearInterval(check), 10000)
  }
}

// Attach to window
global.SchemaPanes = { register, preloadLabels, LABELS, VERSION }

// Auto-register
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoRegister)
} else {
  autoRegister()
}

})(typeof window !== 'undefined' ? window : this);
