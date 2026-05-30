import { isProd } from '../lib/environment';
import { Selectors, Selector } from '../constants';
import Query from '../lib/query';

/**
 * Debug Visualizer - Highlights matched selector elements in development mode
 * Completely excluded from production builds via tree-shaking
 */

// Color palette for different selectors (for visual distinction)
const selectorColors: Record<string, string> = {
  userNameSelector: '#3498DB',
  userMenuSelector: '#2ECC71',
  upsaleSelectors: '#E74C3C',
  subscribeToButtonSelector: '#F39C12',
  confirmDialogSelector: '#9B59B6',
  confirmDialogConfirmSelector: '#1ABC9C',
  upsaleDialogSelector: '#E67E22',
  upsaleSelectorsInsertions: '#D35400',
};

const DEBUG_CLASS_PREFIX = 'debug-selector-highlight-';
const DEBUG_HIGHLIGHT_CLASS = 'debug-selector-highlight';
const DEBUG_BADGE_CLASS = 'debug-selector-badge';

/**
 * Get color for a specific selector
 */
function getColorForSelector(selectorName: string): string {
  return selectorColors[selectorName] || '#FF6B6B';
}

/**
 * Create CSS variables and inject styles for debug highlighting
 */
export function injectDebugStyles(): void {
  if (isProd) return;

  // Check if styles already injected
  if (document.getElementById('debug-visualizer-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'debug-visualizer-styles';

  let selectorCSS = '';
  Object.entries(selectorColors).forEach(([name, color]) => {
    const className = DEBUG_CLASS_PREFIX + name;
    selectorCSS += `
    .${className} {
      outline: 3px solid ${color} !important;
      outline-offset: 2px !important;
      background-color: ${color}15 !important;
      position: relative;
    }
    `;
  });

  style.textContent = `
    ${selectorCSS}
    
    .${DEBUG_BADGE_CLASS} {
      position: absolute;
      top: -20px;
      right: -20px;
      padding: 4px 8px;
      background-color: #333;
      color: #fff;
      font-size: 11px;
      border-radius: 3px;
      z-index: 99999;
      font-weight: bold;
      border: 1px solid #666;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: monospace;
    }
    
    .${DEBUG_HIGHLIGHT_CLASS}:hover .${DEBUG_BADGE_CLASS} {
      display: block !important;
    }
  `;

  document.head.appendChild(style);
  console.log('[DebugVisualizer] Styles injected');
}

/**
 * Remove debug styles from document
 */
export function removeDebugStyles(): void {
  if (isProd) return;

  const style = document.getElementById('debug-visualizer-styles');
  if (style) {
    style.remove();
  }
  console.log('[DebugVisualizer] Styles removed');
}

/**
 * Create highlight element with badge showing selector name
 */
function createBadgeElement(selectorName: string, selectorString: string): HTMLElement {
  const badge = document.createElement('div');
  badge.className = DEBUG_BADGE_CLASS;
  badge.title = selectorString;
  badge.textContent = selectorName;
  return badge;
}

/**
 * Add debug highlight to a single element
 */
export function highlightElement(
  element: HTMLElement,
  selectorName: string,
  selectorString: string
): void {
  if (isProd) return;

  const className = DEBUG_CLASS_PREFIX + selectorName;
  element.classList.add(className, DEBUG_HIGHLIGHT_CLASS);

  // Ensure position is relative if absolute positioning needed for badge
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  // Add badge if not already present
  const existingBadge = element.querySelector(`.${DEBUG_BADGE_CLASS}`);
  if (!existingBadge) {
    const badge = createBadgeElement(selectorName, selectorString);
    element.appendChild(badge);
  }
}

/**
 * Remove debug highlight from a single element
 */
export function removeHighlight(element: HTMLElement): void {
  if (isProd) return;

  element.classList.forEach(cls => {
    if (cls.startsWith(DEBUG_CLASS_PREFIX) || cls === DEBUG_HIGHLIGHT_CLASS) {
      element.classList.remove(cls);
    }
  });

  const badge = element.querySelector(`.${DEBUG_BADGE_CLASS}`);
  if (badge) {
    badge.remove();
  }
}

/**
 * Scan DOM and highlight all elements matching a selector
 */
export function scanAndHighlight(selector: Selector, selectorName: string): number {
  if (isProd) return 0;

  let count = 0;
  const selectorString = typeof selector === 'string' ? selector : selector[0];

  try {
    // Use Query library for matching if it's a complex selector
    if (typeof selector === 'string' && selector.includes('advanced-selector-')) {
      // Complex pseudo-selector - use Query
      const elements = Query.$().queryAll(selector as any);
      elements.forEach(el => {
        highlightElement(el, selectorName, selectorString);
        count++;
      });
    } else {
      // Simple CSS selector - use native querySelectorAll
      const elements = document.querySelectorAll(selectorString);
      elements.forEach(el => {
        highlightElement(el as HTMLElement, selectorName, selectorString);
        count++;
      });
    }
  } catch (error) {
    console.error(`[DebugVisualizer] Error scanning selector "${selectorName}":`, error);
  }

  console.log(`[DebugVisualizer] Found ${count} elements matching "${selectorName}"`);
  return count;
}

/**
 * Highlight multiple selectors from a selectors object
 */
export function highlightSelectors(
  selectors: Partial<Selectors>,
  selectorNames: (keyof Selectors)[]
): Record<string, number> {
  if (isProd) return {};

  const results: Record<string, number> = {};

  selectorNames.forEach(selectorName => {
    const selector = selectors[selectorName];
    if (selector) {
      results[String(selectorName)] = scanAndHighlight(selector, String(selectorName));
    }
  });

  console.log('[DebugVisualizer] Highlighting complete:', results);
  return results;
}

/**
 * Clear all debug highlights from DOM
 */
export function clearAllHighlights(): void {
  if (isProd) return;

  document.querySelectorAll(`.${DEBUG_HIGHLIGHT_CLASS}`).forEach(el => {
    removeHighlight(el as HTMLElement);
  });

  console.log('[DebugVisualizer] All highlights cleared');
}

/**
 * Set up mutation observer to automatically highlight new elements
 */
export function setupDebugMutationObserver(
  selectors: Partial<Selectors>,
  visibleSelectorNames: (keyof Selectors)[]
): MutationObserver | null {
  if (isProd) return null;

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // Check if this element matches any of our debug selectors
            visibleSelectorNames.forEach(selectorName => {
              const selector = selectors[selectorName];
              if (selector) {
                const selectorString = typeof selector === 'string' ? selector : selector[0];
                try {
                  if (element.matches(selectorString)) {
                    highlightElement(element, String(selectorName), selectorString);
                  }
                } catch (e) {
                  // Selector might be too complex for matches()
                }
              }
            });

            // Also check children
            visibleSelectorNames.forEach(selectorName => {
              const selector = selectors[selectorName];
              if (selector) {
                const selectorString = typeof selector === 'string' ? selector : selector[0];
                try {
                  const matches = element.querySelectorAll(selectorString);
                  matches.forEach(match => {
                    highlightElement(match as HTMLElement, String(selectorName), selectorString);
                  });
                } catch (e) {
                  // Selector error
                }
              }
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[DebugVisualizer] Mutation observer set up');
  return observer;
}

/**
 * Disconnect debug mutation observer
 */
export function disconnectDebugMutationObserver(observer: MutationObserver | null): void {
  if (!observer) return;
  observer.disconnect();
  console.log('[DebugVisualizer] Mutation observer disconnected');
}
