const config = {
    mi: 1,
    sm: 768,
    md: 1024,
    lg: 1200
};

class OnlyLayout extends HTMLElement {
    static get observedAttributes() {
        return ["for", "from", "to", "except"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.mql = null;
        this.onChange = this.onChange.bind(this);
    }

    show() {
        this.shadowRoot.innerHTML = `<slot></slot>`;
    }

    hide() {
        this.shadowRoot.innerHTML = ``;
    }

    createMediaQuery() {
        const mq = [];
        let from = this.getAttribute("from");
        let to = this.getAttribute("to");
        const forAttr = this.getAttribute("for");

        if (forAttr && config[forAttr]) {
            from = forAttr;
            const configKeys = Object.keys(config);
            const fromIndex = configKeys.indexOf(forAttr);
            to = configKeys[fromIndex + 1];
        }

        if (from) {
            const fromValue = config[from] ? config[from] + "px" : from;
            mq.push(`(min-width: ${fromValue})`);
        }
        if (to) {
            const toValue = config[to] ? config[to] + "px" : to;
            mq.push(`(max-width: ${toValue})`);
        }
        return mq.join(" and ");
    }

    setupMQL() {
        // craete media query
        const mq = this.createMediaQuery();

        // remove listneer in case, attributes have been updated
        if (this.mql) {
            this.mql.removeListener(this.onChange);
        }
        this.mql = window.matchMedia(mq);

        // match initical value
        this.toggle(this.mql.matches);

        // listen for changes
        this.mql.addListener(this.onChange);
    }

    onChange(e) {
        this.toggle(e.matches);
    }

    toggle(matches) {
        const except = this.getAttribute("except");
        if (except) {
            !matches ? this.show() : this.hide();
        } else {
            matches ? this.show() : this.hide();
        }
    }

    connectedCallback() {
        this.setupMQL();
    }

    disconnectedCallback() {
        if (this.mql) {
            this.mql.removeListener(this.onChange);
        }
    }
}

customElements.define("only-layout", OnlyLayout);
