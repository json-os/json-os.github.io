/**
 * jsonos Embed Script
 *
 * Add this to any HTML page with JSON-LD to auto-render a beautiful pane.
 *
 * Supports @view proposal for JSON-LD (self-describing view hint)
 * See: https://github.com/w3c/json-ld-syntax/issues/384
 *
 * Usage:
 *   <script type="application/ld+json">
 *   {
 *     "@context": { "schema": "http://schema.org/" },
 *     "@type": "schema:Person",
 *     "@view": "https://jsonos.com/examples/src/panes/person.js",
 *     "schema:name": "Marie Curie",
 *     "schema:jobTitle": "Physicist"
 *   }
 *   </script>
 *   <script src="https://jsonos.com/examples/embed.js"></script>
 *
 * Options (via data attributes on script tag):
 *   data-target="#myDiv"  - Render into specific element (default: creates container)
 *   data-subject="#me"    - Subject ID to render (default: first @id found)
 *   data-theme="dark"     - Color theme (default: light)
 */

(async function() {
  const MASHLIB_URL = 'https://unpkg.com/solid-shim/dist/mashlib.js';
  const PANES_BASE = 'https://jsonos.com/examples/src/panes/';
  const SHARED_URL = 'https://jsonos.com/examples/src/shared.js';

  // Get script tag options
  const scriptTag = document.currentScript;
  const targetSelector = scriptTag?.dataset?.target;
  const subjectId = scriptTag?.dataset?.subject;
  const theme = scriptTag?.dataset?.theme || 'light';

  // Find JSON-LD
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
  if (!jsonLdScript) {
    console.warn('jsonos embed: No JSON-LD found on page');
    return;
  }

  let data;
  try {
    data = JSON.parse(jsonLdScript.textContent);
  } catch (e) {
    console.error('jsonos embed: Invalid JSON-LD', e);
    return;
  }

  // Detect type
  const typeMap = {
    'schema:Person': 'person',
    'schema:Event': 'event',
    'schema:Article': 'article',
    'schema:Organization': 'organization',
    'schema:Recipe': 'recipe',
    'schema:Product': 'product',
    'schema:Place': 'place',
    'schema:Movie': 'movie',
    'schema:Book': 'book',
    'schema:Review': 'review',
    'schema:FAQPage': 'faqpage',
    'schema:HowTo': 'howto',
    'schema:JobPosting': 'jobposting',
    'schema:Restaurant': 'localbusiness',
    'schema:LocalBusiness': 'localbusiness',
    'schema:Service': 'service',
    'schema:Course': 'course',
    'schema:VideoObject': 'video',
    'schema:MusicRecording': 'musicrecording',
    'schema:SoftwareApplication': 'softwareapplication',
    'schema:CreativeWork': 'creativework'
  };

  const schemaType = data['@type'] || '';
  const paneType = typeMap[schemaType] || 'person';
  const subject = subjectId || data['@id'] || '#thing';

  // Load mashlib
  await new Promise((resolve, reject) => {
    if (window.$rdf) return resolve();
    const script = document.createElement('script');
    script.src = MASHLIB_URL;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // Load pane - check @view first, then fall back to @type detection
  let pane;
  if (data['@view']) {
    // @view: self-describing view hint (JSON-LD proposal)
    // See: https://github.com/w3c/json-ld-syntax/issues/384
    try {
      console.log(`[jsonos] Loading @view: ${data['@view']}`);
      const paneModule = await import(data['@view']);
      pane = paneModule.default || paneModule;
    } catch (err) {
      console.warn(`[jsonos] Failed to load @view, falling back to @type:`, err);
      const paneModule = await import(`${PANES_BASE}${paneType}.js`);
      pane = paneModule.default;
    }
  } else {
    // Fall back to @type-based detection
    const paneModule = await import(`${PANES_BASE}${paneType}.js`);
    pane = paneModule.default;
  }

  // Create or find target element
  let target;
  if (targetSelector) {
    target = document.querySelector(targetSelector);
  }
  if (!target) {
    target = document.createElement('div');
    target.id = 'jsonos-embed';
    target.style.cssText = `
      font-family: system-ui, -apple-system, sans-serif;
      background: ${theme === 'dark' ? '#1e293b' : '#f8fafc'};
      color: ${theme === 'dark' ? '#e2e8f0' : '#1e293b'};
      min-height: 100px;
    `;
    // Insert after the JSON-LD script
    jsonLdScript.parentNode.insertBefore(target, jsonLdScript.nextSibling);
  }

  // Parse JSON-LD into store
  const store = $rdf.graph();
  const baseUri = window.location.href;
  const fullUri = baseUri + subject;

  function addTriples(node, subjectUri) {
    const subj = $rdf.sym(subjectUri);
    const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    if (node['@type']) {
      const typeUri = node['@type'].replace('schema:', 'http://schema.org/');
      store.add(subj, RDF('type'), $rdf.sym(typeUri));
    }

    Object.entries(node).forEach(([key, val]) => {
      if (key.startsWith('@')) return;
      const pred = $rdf.sym(key.replace('schema:', 'http://schema.org/'));

      if (Array.isArray(val)) {
        val.forEach((item, i) => {
          if (typeof item === 'object' && !item['@id']) {
            const blankId = `${subjectUri}_${key}_${i}`;
            store.add(subj, pred, $rdf.sym(blankId));
            addTriples(item, blankId);
          } else if (typeof item === 'object' && item['@id']) {
            store.add(subj, pred, $rdf.sym(item['@id']));
          } else {
            store.add(subj, pred, item);
          }
        });
      } else if (typeof val === 'object' && val['@id']) {
        store.add(subj, pred, $rdf.sym(val['@id']));
      } else if (typeof val === 'object') {
        const blankId = `${subjectUri}_${key}`;
        store.add(subj, pred, $rdf.sym(blankId));
        addTriples(val, blankId);
      } else {
        store.add(subj, pred, val);
      }
    });
  }

  addTriples(data, fullUri);

  // Render pane
  const context = {
    session: { store },
    dom: document
  };

  try {
    const rendered = pane.render($rdf.sym(fullUri), context);
    target.appendChild(rendered);
  } catch (e) {
    console.error('jsonos embed: Render error', e);
    target.innerHTML = `<p style="color: #dc2626; padding: 1rem;">Error rendering pane: ${e.message}</p>`;
  }
})();
