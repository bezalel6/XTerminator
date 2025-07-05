export interface XTerminatorIconOptions {
  iconUrl: string;
  tooltipText: string;
  onClick: () => void;
  container?: HTMLElement;
}

export class XTerminatorIcon extends HTMLElement {
  private shadow: ShadowRoot;
  private observer: MutationObserver;

  static get observedAttributes() {
    return ['icon-url', 'tooltip-text'];
  }

  constructor(private options?: XTerminatorIconOptions) {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.observer = new MutationObserver(this.handleContainerChanges);
    this.render();
  }

  connectedCallback() {
    this.initStyles();
    this.setupEventListeners();
    this.options?.container && this.autoAttachToContainer();
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  private initStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :host {
          display: inline-block;
          position: relative;
          cursor: pointer;
          margin: 4px;
        }
  
        .icon {
          width: 24px;
          height: 24px;
          transition: opacity 0.2s ease;
        }
  
        .icon:hover {
          opacity: 0.9;
        }
  
        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
  
        :host(:hover) .tooltip {
          opacity: 1;
        }
  
        @media (prefers-reduced-motion: reduce) {
          .icon, .tooltip {
            transition: none;
          }
        }
      `;
    this.shadow.appendChild(style);
  }

  private render() {
    const template = document.createElement('template');
    template.innerHTML = `
        <img class="icon" alt="X-Terminator icon">
        <div class="tooltip"></div>
      `;
    this.shadow.appendChild(template.content.cloneNode(true));

    this.updateElements();
  }

  private updateElements() {
    const icon = this.shadow.querySelector('.icon') as HTMLImageElement;
    const tooltip = this.shadow.querySelector('.tooltip') as HTMLElement;

    if (icon) icon.src = this.options?.iconUrl || '';
    if (tooltip) tooltip.textContent = this.options?.tooltipText || '';
  }

  private setupEventListeners() {
    this.addEventListener('click', this.handleClick);
  }

  private handleClick = (e: Event) => {
    e.stopPropagation();
    this.options?.onClick?.();
  };

  private autoAttachToContainer() {
    if (!this.options?.container) return;

    if (document.body.contains(this.options.container)) {
      this.attachToContainer();
    } else {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private attachToContainer() {
    if (!this.isConnected && this.options?.container) {
      this.options.container.appendChild(this);
    }
  }

  private handleContainerChanges: MutationCallback = mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && this.options?.container?.isConnected) {
        this.attachToContainer();
        this.observer.disconnect();
      }
    }
  };

  // Public methods
  public updateOptions(options: Partial<XTerminatorIconOptions>) {
    this.options = { ...this.options, ...options };
    this.updateElements();
  }

  public remove() {
    this.observer.disconnect();
    this.removeEventListener('click', this.handleClick);
    super.remove();
  }
}

// Usage
export function injectIcon(options: Partial<XTerminatorIconOptions>) {
  if (!customElements.get('xterminate-icon')) {
    customElements.define('xterminate-icon', XTerminatorIcon);
  }

  const icon = new XTerminatorIcon({
    iconUrl: chrome.runtime.getURL('icons/icon.png'),
    tooltipText: 'Click to Xterminate',
    onClick: () => {
      // Add your termination logic here
      console.log('Xterminate action triggered');
    },
    ...options,
  });

  if (options.container) {
    options.container.appendChild(icon);
  }

  return icon;
}

// Cleanup utility
export function cleanupIcons() {
  document.querySelectorAll('xterminate-icon').forEach(icon => {
    (icon as XTerminatorIcon).remove();
  });
}
