class TimeDisplay extends HTMLElement {
  constructor() {
    super();

    this.root = this.attachShadow({ mode: "open" });
    this.onSlotChangeBound = this.onSlotChange.bind(this);

    this.root.innerHTML = `
      <div id="slotted-value">
        <slot></slot>
      </div>
      <div id="output"></div>
    `;

    this.slottedValue = this.root.querySelector("#slotted-value");
    this.output = this.root.querySelector("#output");
    this.timeSlot = this.root.querySelector("slot");
  }

  connectedCallback() {
    this.timeSlot.addEventListener("slotchange", this.onSlotChangeBound);
    this.onSlotChange();
  }

  disconnectedCallback() {
    this.timeSlot.removeEventListener("slotchange", this.onSlotChangeBound);
  }

  async onSlotChange() {
    const textValue = this.getAttribute("value") || this.textContent || "";
    const dateTime = Date.parse(textValue.trim());
    if (Number.isNaN(dateTime)) {
      // Invalid date.
      return;
    }

    const value = new Date(dateTime);
    const supportsRelativeTimeFormat = "RelativeTimeFormat" in Intl;
    const supportsDateTimeFormat = "DateTimeFormat" in Intl;

    if (!supportsDateTimeFormat && !supportsRelativeTimeFormat) {
      return;
    }

    this.slottedValue.style.display = "none";
    this.output.textContent = dateTime;

    if (supportsRelativeTimeFormat) {
      const formatter = new Intl.RelativeTimeFormat(navigator.language);
      const relative = this.relativeValue(value);
      this.output.textContent = formatter.format(
        Math.floor(relative.value),
        relative.unit
      );
    } else if (supportsDateTimeFormat) {
      const formatter = new Intl.DateTimeFormat(navigator.language);
      this.output.textContent = formatter.format(value);
    }
  }

  relativeValue(start) {
    const now = new Date();
    const timeDiffInMilliseconds = start.getTime() - now.getTime();

    let unit = "second";
    let value = timeDiffInMilliseconds / 1000;
    const absValue = Math.abs(value);

    // Convert to minutes if more than 60sec.
    if (absValue > 60) {
      value /= 60;
      unit = "minute";

      // Convert to hours if more than 60min.
      if (absValue > 60) {
        value /= 60;
        unit = "hour";

        // Convert to days if more than 24hr.
        if (absValue > 24) {
          const days = value / 24;
          const absDays = Math.abs(days);
          unit = "day";
          value /= 24;

          if (absDays > 7 && absDays < 30) {
            value = days / 7;
            unit = "week";
          } else if (absDays > 30 && absDays < 365) {
            value = days / 30;
            unit = "month";
          } else if (absDays > 365) {
            value = days / 365;
            unit = "year";
          }
        }
      }
    }

    return {
      value,
      unit
    };
  }
}

customElements.define("time-display", TimeDisplay);
