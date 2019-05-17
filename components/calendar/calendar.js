const monthsNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

class ICalendar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._month = null;
        this._year = null;
        this.selectedDate = null;
        this.onDayClick = this.onDayClick.bind(this);
        this.onNext = this.onNext.bind(this);
        this.onPrev = this.onPrev.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    get month() {
        return this._month;
    }

    set month(month) {
        this._month = month;
        this.createBody();
    }

    get year() {
        return this._year;
    }

    set year(year) {
        this._year = year;
    }

    connectedCallback() {
        const { shadowRoot } = this;
        shadowRoot.innerHTML = `
        <style>
        :host {
          display: block;
          --color-accent: green;
        }
        button {
          background: none;
          border: none;
        }
        .Calendar {
          text-align: center;
        }

        .Calendar__header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .Calendar__btn {
          color: var(--color-accent);
          margin: 0 10px;
        }
        
        .Calendar__body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .Calendar__day {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          line-height: 32px;
          font-weight: bold;
        }
      
        .Calendar__day--selected {
            background-color: var(--color-accent);
            color: #fff;
        }
        </style>
        <div class="Calendar">
          <div class="Calendar__header">
            <button id="prev" class="Calendar__btn">
              < prev
            </button>
            <p id="label">-</p>
            <button id="next" class="Calendar__btn">
              next >
            </button>
          </div>
          <div class="Calendar__body" id="body">
          </div>
        </div>
        `;

        this.$body = shadowRoot.querySelector("#body");
        this.$nextBtn = shadowRoot.querySelector("#next");
        this.$prevBtn = shadowRoot.querySelector("#prev");
        this.$label = shadowRoot.querySelector("#label");

        this.selectedDate = this.getInitSelectedDate();

        const initDate = this.getInitDate();
        this.year = initDate.getFullYear();
        this.month = initDate.getMonth();

        this.$body.addEventListener("click", this.onDayClick);
        this.$nextBtn.addEventListener("click", this.onNext);
        this.$prevBtn.addEventListener("click", this.onPrev);
        this.$body.addEventListener("keydown", this.onKeyDown);
    }

    disconnectedCallback() {
        this.$body.removeEventListener("click", this.onDayClick);
        this.$nextBtn.removeEventListener("click", this.onNext);
        this.$prevBtn.removeEventListener("click", this.onPrev);
        this.$body.removeEventListener("keydown", this.onKeyDown);
    }

    getDateAttr(attrName) {
        const dateAttr = this.getAttribute(attrName);
        const parsedDate = Date.parse(dateAttr);
        if (!isNaN(parsedDate)) {
            return new Date(parsedDate);
        }
        return null;
    }

    getInitDate() {
        const initDate = this.getDateAttr("initDate");
        return initDate || new Date();
    }

    getInitSelectedDate() {
        return this.getDateAttr("selectedDate");
    }

    createBody() {
        while (this.$body.firstChild) {
            this.$body.firstChild.remove();
        }

        var fragment = document.createDocumentFragment();

        // create days labels
        ["M", "T", "W", "T", "F", "S", "S"].forEach(d => {
            const el = document.createElement("div");
            el.textContent = d;
            fragment.appendChild(el);
        });

        // create month dates
        const startDate = new Date(this.year, this.month, 1);
        const now = new Date();
        const daysInMonth = this.getDaysInMonth(this.month, this.year);
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(
                new Date(
                    this.year,
                    this.month,
                    i,
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds()
                )
            );
        }

        const startWeekDay = startDate.getDay();
        const offset = 7 - (8 - startWeekDay);

        for (let i = 0; i < offset; i++) {
            days.unshift(null);
        }

        days.forEach(day => {
            const el = document.createElement("div");
            if (day) {
                const btn = document.createElement("button");
                const isSelected = this.isSameDate(day, this.selectedDate);
                btn.textContent = day ? day.getDate() : "";
                btn.classList.add("Calendar__day");
                btn.classList.toggle("Calendar__day--selected", isSelected);
                el.appendChild(btn);
            }
            fragment.appendChild(el);
        });
        this.$body.appendChild(fragment);

        // change label
        const label = monthsNames[this.month] + " " + this.year;
        this.$label.textContent = label;
    }

    onDayClick(event) {
        if (event.target.matches("button")) {
            const day = parseInt(event.target.innerHTML);
            this.shadowRoot.querySelector(".Calendar__day--selected");

            const prevSelected = this.shadowRoot.querySelector(
                ".Calendar__day--selected"
            );
            if (prevSelected) {
                prevSelected.classList.remove("Calendar__day--selected");
            }

            event.target.classList.add("Calendar__day--selected");

            this.selectedDate = new Date(this.year, this.month, day, 0, 0, 0);
            const selectedChange = new CustomEvent("selectedChange", {
                detail: this.selectedDate
            });
            this.dispatchEvent(selectedChange);
        }
    }

    onNext() {
        if (this.month === 11) {
            this.year = this.year + 1;
            this.month = 0;
        } else {
            this.month = this.month + 1;
        }
    }

    onPrev() {
        if (this.month === 0) {
            this.year = this.year - 1;
            this.month = 11;
        } else {
            this.month = this.month - 1;
        }
    }

    onKeyDown(e) {
        const focusedElement = this.shadowRoot.activeElement;
        if (focusedElement.classList.contains("Calendar__day")) {
            let cell = null;
            switch (e.keyCode) {
                case 37: // move left
                    cell = focusedElement.parentNode.previousElementSibling;
                    break;
                case 38: // move up
                    cell = this.getSubNthElement(focusedElement.parentNode, "prev");
                    break;
                case 39: // move right
                    cell = focusedElement.parentNode.nextElementSibling;
                    break;
                case 40: // move down
                    cell = this.getSubNthElement(focusedElement.parentNode, "next");
                    break;
            }
            if (cell) {
                cell.querySelector("button").focus();
            }
        }
    }

    getDaysInMonth(month, year) {
        // Here January is 0 based
        return new Date(year, month + 1, 0).getDate();
    }

    isSameDate(dateA, dateB) {
        if (!dateA || !dateB) {
            return false;
        }
        return (
            dateA.getMonth() === dateB.getMonth() &&
            dateA.getFullYear() === dateB.getFullYear() &&
            dateA.getDate() === dateB.getDate()
        );
    }

    getSubNthElement(el, dir = "next", nth = 7) {
        const propName =
            dir === "next" ? "nextElementSibling" : "previousElementSibling";
        let currentElement = el;
        for (let i = nth; i > 0; i--) {
            if (currentElement[propName]) {
                currentElement = currentElement[propName];
            } else {
                return currentElement;
            }
        }
        return currentElement;
    }
}

customElements.define("i-calendar", ICalendar);