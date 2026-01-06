/**
 * shared.js - Common initialization for schemapanes examples
 * ES Module version
 */

// Load a script dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Wait for mashlib globals
function waitForRdf() {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (typeof $rdf !== 'undefined' && typeof SolidLogic !== 'undefined') {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });
}

// Parse JSON-LD data island into RDF store
function parseDataIsland() {
  const island = document.querySelector('script[type="application/ld+json"]');
  if (!island) return null;

  const store = SolidLogic.store;
  const baseUri = window.location.href.split('#')[0];
  const jsonld = JSON.parse(island.textContent);

  function addTriples(node, subjectUri) {
    const subject = $rdf.sym(subjectUri);

    if (node['@type']) {
      const type = node['@type'].replace('schema:', 'http://schema.org/');
      store.add(subject, $rdf.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), $rdf.sym(type));
    }

    Object.keys(node).forEach(key => {
      if (key.startsWith('@')) return;
      const pred = key.replace('schema:', 'http://schema.org/');
      const val = node[key];

      if (typeof val === 'object' && val['@id']) {
        const uri = val['@id'].startsWith('http') ? val['@id'] : baseUri + val['@id'];
        store.add(subject, $rdf.sym(pred), $rdf.sym(uri));
      } else if (typeof val === 'object' && val['@type']) {
        const blankId = baseUri + '#_b' + Math.random().toString(36).substring(2, 8);
        store.add(subject, $rdf.sym(pred), $rdf.sym(blankId));
        addTriples(val, blankId);
      } else if (typeof val === 'string') {
        store.add(subject, $rdf.sym(pred), val);
      } else if (Array.isArray(val)) {
        val.forEach(item => {
          if (typeof item === 'object' && item['@type']) {
            const blankId = baseUri + '#_b' + Math.random().toString(36).substring(2, 8);
            store.add(subject, $rdf.sym(pred), $rdf.sym(blankId));
            addTriples(item, blankId);
          } else if (typeof item === 'object' && item['@id']) {
            const uri = item['@id'].startsWith('http') ? item['@id'] : baseUri + item['@id'];
            store.add(subject, $rdf.sym(pred), $rdf.sym(uri));
          } else if (typeof item === 'string') {
            store.add(subject, $rdf.sym(pred), item);
          }
        });
      }
    });
  }

  const rootId = baseUri + (jsonld['@id'] || '#thing');
  addTriples(jsonld, rootId);

  return { store, subject: $rdf.sym(rootId), jsonld };
}

// Standard views (Data + Source) - shared across all panes
function createViews(subject, paneRenderer) {
  return {
    profile: () => {
      if (paneRenderer) {
        return paneRenderer(subject, {
          dom: document,
          session: { store: SolidLogic.store }
        });
      }
      return document.createTextNode('No pane registered');
    },

    data: () => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 32px; max-width: 800px; margin: 0 auto; font-family: system-ui;';

      const h2 = document.createElement('h2');
      h2.textContent = 'RDF Data';
      h2.style.cssText = 'margin: 0 0 16px; color: #1e293b;';
      div.appendChild(h2);

      const table = document.createElement('table');
      table.style.cssText = 'width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';

      const stmts = SolidLogic.store.statementsMatching(subject, null, null);
      stmts.forEach(st => {
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom: 1px solid #e2e8f0;';

        const tdPred = document.createElement('td');
        tdPred.style.cssText = 'padding: 12px; color: #7c3aed; font-weight: 500; width: 30%;';
        tdPred.textContent = st.predicate.value.split(/[#\/]/).pop();

        const tdObj = document.createElement('td');
        tdObj.style.cssText = 'padding: 12px; color: #334155;';
        if (st.object.termType === 'NamedNode') {
          const a = document.createElement('a');
          a.href = st.object.value;
          a.textContent = st.object.value;
          a.style.cssText = 'color: #2563eb; text-decoration: none;';
          tdObj.appendChild(a);
        } else {
          tdObj.textContent = st.object.value;
        }

        tr.appendChild(tdPred);
        tr.appendChild(tdObj);
        table.appendChild(tr);
      });

      div.appendChild(table);
      return div;
    },

    source: () => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 32px; max-width: 800px; margin: 0 auto;';

      const h2 = document.createElement('h2');
      h2.textContent = 'JSON-LD Source';
      h2.style.cssText = 'margin: 0 0 16px; color: #1e293b; font-family: system-ui;';
      div.appendChild(h2);

      const pre = document.createElement('pre');
      pre.style.cssText = 'background: #1e293b; color: #e2e8f0; padding: 24px; border-radius: 12px; overflow-x: auto; font-size: 14px; line-height: 1.5;';
      const island = document.querySelector('script[type="application/ld+json"]');
      if (island) {
        const json = JSON.parse(island.textContent);
        pre.textContent = JSON.stringify(json, null, 2);
      }
      div.appendChild(pre);
      return div;
    }
  };
}

/**
 * Initialize the pane viewer
 * @param {Object} options
 * @param {Object} options.pane - The pane module (with render function)
 * @param {string} options.subject - Fragment ID of subject (e.g., '#me')
 * @param {string} options.mashlib - Path to mashlib (default: '/browser/dist/mashlib.min.js')
 */
export async function init(options = {}) {
  const mashlibPath = options.mashlib || '/browser/dist/mashlib.min.js';
  const pane = options.pane;
  const subjectId = options.subject || window.location.hash || '#thing';
  const theme = options.theme || { primary: '#667eea', bg: '#eff6ff' };

  // 1. Load mashlib
  await loadScript(mashlibPath);
  await waitForRdf();

  // 2. Parse data island
  const { subject } = parseDataIsland();

  // Override subject if specified
  const finalSubject = subjectId !== '#thing'
    ? $rdf.sym(window.location.href.split('#')[0] + subjectId)
    : subject;

  // 3. Load toolbar
  await loadScript('src/toolbar.js');

  // 4. Get pane renderer
  const paneRenderer = pane?.render || null;

  // 5. Create views
  const views = createViews(finalSubject, paneRenderer);

  // 6. Create content area
  const content = document.createElement('div');
  content.id = 'content';
  content.style.cssText = 'padding: 0;';

  function switchView(viewName) {
    content.innerHTML = '';
    content.appendChild(views[viewName]());
  }

  // 7. Create toolbar
  const toolbar = window.SchemaToolbar.render({
    dom: document,
    subject: finalSubject,
    theme: theme,
    onViewChange: switchView,
    onRefresh: () => window.location.reload()
  });

  // 8. Add to page
  document.body.appendChild(toolbar);
  document.body.appendChild(content);

  // 9. Initial render
  switchView('profile');

  return { subject: finalSubject, store: SolidLogic.store, views, switchView };
}
