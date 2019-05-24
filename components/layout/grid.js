const config = {
  sm: 768,
  md: 1024,
  lg: 1200
};

const attrs = ["columns", "gap"].concat(
  Object.keys(config).reduce((prev, current) => {
    prev.push("columns-" + current);
    prev.push("gap-" + current);
    return prev;
  }, [])
);

class GridLayout extends HTMLElement {
  static get observedAttributes() {
    return attrs;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const mediaQueries = () => {
      let css = ``;
      for (const [key, value] of Object.entries(config)) {
        css += `
          @media only screen and (min-width: ${value}px) {
            .grid {
              grid-column-gap: var(--grid-gap-${key}, 0);
              grid-template-columns: repeat(var(--grid-columns-${key}), 1fr);
            }
          }
        `;
      }
      return css;
    };

    const defaults = () => {
      let css = ``;
      const keys = Object.keys(config);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const prevKey = keys[i - 1];
        const value = prevKey ? `-${prevKey}` : "";
        css += `
        --grid-columns-${key}: var(--grid-columns${value});
        --grid-gap-${key}: var(--grid-gap${value});
        `;
      }
      return css;
    };

    this.shadowRoot.innerHTML = `
        <style>
        .grid {
          --grid-columns: 1;
          --grid-gap: 30px;
          ${defaults()}
          display: grid;
          grid-template-columns: repeat(var(--grid-columns), 1fr);
          grid-column-gap: var(--grid-gap);
        }
        ${mediaQueries()}
        </style>
        <div class="grid" id="grid">
          <slot></slot>
        </div>`;

    this.applyVariables();
  }

  disconnectedCallback() {}

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      this.applyVariables();
    }
  }

  applyVariables() {
    const gridEl = this.shadowRoot.getElementById("grid");
    const cssVars = [];
    attrs.forEach(attrName => {
      const attrValue = this.getAttribute(attrName);
      if (attrValue) {
        cssVars.push(`--grid-${attrName}: ${attrValue}`);
      }
    });
    gridEl.style = cssVars.join(";");
  }
}

customElements.define("grid-layout", GridLayout);
