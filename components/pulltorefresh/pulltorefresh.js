const MAX_SIZE = 100;

class PullRefresh extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.el = null;
    this._startY = 0;
    this._currentY = 0;
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.$refresher = null;
    this.$container = null;
    this.$loading = null;
  }

  get observedAttributes() {
    return ["loading"];
  }

  set startY(value) {
    this._startY = value;
  }

  get startY() {
    return this._startY;
  }

  set currentY(value) {
    this._currentY = value;
    this.setStyle();
  }

  get currentY() {
    return this._currentY;
  }

  connectedCallback() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = `
        <style>
          .refresher {
            --refresh-width: 60px;
            pointer-events: none;
            width: var(--refresh-width);
            height: var(--refresh-width);
            border-radius: 50%;
            position: absolute;
            transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
            will-change: transform, opacity;
            background: var(--color-border);
            will-change: transform, opacity;
            left: calc(50% - var(--refresh-width) / 2);
            z-index: 0;
            transform: scale(0);
            transform-origin: top center;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
          }

          .refresh-content {
            will-change: transform;
          }
  
          .loading {
            background: blue;
          }
        </style>
        <div class="refresher">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z"/>
            <path fill="currentColor" d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
        </svg>
        </div>
        <div class="refresh-content">
          <div class="loading" hidden>Loading...</div>
          <slot></slot>
        </div>
      `;

    this.el = document;
    this.el.addEventListener("touchstart", this.touchStart, { passive: true });
    this.el.addEventListener("touchmove", this.touchMove, { passive: true });
    this.el.addEventListener("touchend", this.touchEnd, { passive: true });
    this.el.addEventListener("touchcancel", this.touchEnd, { passive: true });

    this.$refresher = shadowRoot.querySelector(".refresher");
    this.$container = shadowRoot.querySelector(".refresh-content");
    this.$loading = shadowRoot.querySelector(".loading");
  }

  disconnectedCallback() {
    this.el.removeEventListener("touchstart", this.touchStart);
    this.el.removeEventListener("touchmove", this.touchMove);
    this.el.removeEventListener("touchend", this.touchEnd);
    this.el.removeEventListener("touchcancel", this.touchEnd);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      switch (attrName) {
        case "loading":
          this.setLoading(newValue);
          break;
      }
    }
  }

  touchStart(e) {
    this.startY = e.touches[0].pageY;
  }

  touchMove(e) {
    const y = e.touches[0].pageY;
    if (document.scrollingElement.scrollTop === 0) {
      const currentY = Math.min(MAX_SIZE, y - this.startY);
      this.currentY = currentY < 0 ? 0 : currentY;
    }
  }

  touchEnd(e) {
    if (
      this.currentY > 0 &&
      document.scrollingElement.scrollTop <= 0 &&
      this.currentY > MAX_SIZE * 0.4
    ) {
      const refreshEvent = new CustomEvent("refresh");
      this.dispatchEvent(refreshEvent);
    }

    this.currentY = 0;
  }

  setStyle() {
    const scale = ((MAX_SIZE / 100) * this.currentY) / 100;
    this.$refresher.style.transform = `scale(${scale})`;
    this.$refresher.style.opacity = (scale * 2).toString();
    this.$container.style.transform = `translateY(${this.currentY}px)`;
  }

  setLoading(loading) {
    if (loading) {
      this.$loading.removeAttribute("hidden");
    } else {
      this.$loading.setAttribute("hidden", "true");
    }
  }
}

customElements.define("pull-refresh", PullRefresh);
