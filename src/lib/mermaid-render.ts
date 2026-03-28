/** Lazy-loaded mermaid renderer with one-time initialization. */

let mermaidReady: Promise<(typeof import('mermaid'))['default']> | null = null;
let idCounter = 0;

function getMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then(({ default: m }) => {
      m.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });
      return m;
    });
  }
  return mermaidReady;
}

/**
 * Find all `.mermaid-block` elements inside `container` and render them as SVG.
 * Safe to call multiple times — already-rendered blocks are skipped.
 * Errors are silently caught (raw source stays visible).
 */
export function renderMermaidBlocks(container: Element): void {
  const blocks = container.querySelectorAll('.mermaid-block:not(.mermaid-rendered)');
  if (blocks.length === 0) return;

  getMermaid().then((mermaid) => {
    blocks.forEach((el) => {
      const source = el.textContent?.trim();
      if (!source) return;
      const id = `mermaid-${++idCounter}`;
      mermaid
        .render(id, source)
        .then(({ svg }: { svg: string }) => {
          if (el.isConnected) {
            el.innerHTML = svg;
            el.classList.add('mermaid-rendered');
          }
        })
        .catch((err: unknown) => {
          console.warn('[mermaid] render failed:', err);
        });
    });
  });
}
