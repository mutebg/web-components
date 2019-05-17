let LAZY_IMAGE_OBSERVER = null;
const IMAGE_PROPS = ["src", "sizes", "srcset"];
const SPEC_PROPS = ["placeholder"];
const PROP_MAPPER = {
  classname: "className"
};

const createObserver = () => {
  function intersectionCallback(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.setAttribute("show", true);
      }
    });
  }
  return new IntersectionObserver(intersectionCallback, {
    threshold: 0
  });
};

const observe = image => {
  if ("IntersectionObserver" in window) {
    if (LAZY_IMAGE_OBSERVER === null) {
      LAZY_IMAGE_OBSERVER = createObserver();
    }
    LAZY_IMAGE_OBSERVER.observe(image);
  } else {
    image.setAttribute("show", true);
  }
};

const unobserve = image => {
  if (LAZY_IMAGE_OBSERVER) {
    LAZY_IMAGE_OBSERVER.unobserve(image);
  }
};

const getProperties = el => {
  const props = {};
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < el.attributes.length; i++) {
    const { name, value } = el.attributes[i];
    const propName = PROP_MAPPER[name] || name;
    props[propName] = value;
  }
  return props;
};

const getListOfProps = wanted => all =>
  wanted.reduce((prev, propName) => {
    if (all[propName]) {
      prev[propName] = all[propName];
    }
    return prev;
  }, {});

const getImageProps = getListOfProps(IMAGE_PROPS);

// const getSpecProps = getListOfProps(SPEC_PROPS);

const getRestProps = props =>
  Object.keys(props).reduce((prev, current) => {
    if (
      IMAGE_PROPS.indexOf(current) === -1 &&
      SPEC_PROPS.indexOf(current) === -1
    ) {
      prev[current] = props[current];
    }
    return prev;
  }, {});

const applyProps = (el, props) => {
  Object.keys(props).forEach(propName => {
    if (props[propName]) {
      el[propName] = props[propName];
    }
  });
};

class LazyImage extends HTMLElement {
  static get observedAttributes() {
    return ["show", "src"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.elProps = getProperties(this);
    this.innerHTML = `<img />`;
    this.$img = this.querySelector("img");
    applyProps(this.$img, getRestProps(this.elProps));
    observe(this);
    this.setPlaceholder();
  }

  disconnectedCallback() {
    unobserve(this);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      switch (attrName) {
        case "show":
          this.loadImage();
          unobserve(this);
          break;
        case "src":
          if (this.$img && newValue) {
            applyProps(this.$img, { src: newValue });
          }
          break;
      }
    }
  }

  loadImage() {
    const visibleEvent = new CustomEvent("visible");
    this.dispatchEvent(visibleEvent);

    const imgProps = getImageProps(this.elProps);
    const tempImg = new Image();
    applyProps(tempImg, imgProps);
    tempImg.onload = () => {
      applyProps(this.$img, imgProps);
    };
    tempImg.onerror = e => {
      // console.log("error", e);
    };
  }

  setPlaceholder() {
    // @ts-ignore
    const { placeholder } = this.elProps;
    if (placeholder) {
      this.$img.src = placeholder;
    }
  }
}

customElements.define("lazy-image", LazyImage);
