/**
 * Created by micku7zu on 1/27/2017.
 * MIT License.
 */
"use strict";
(function (undefined) {
    class VanillaTilt {

        constructor(element, settings = {}) {
            if (!(element instanceof Node)) {
                throw("Can't initialize VanillaTilt because " + element + " is not a Node.");
            }

            this.width = null;
            this.height = null;
            this.left = null;
            this.top = null;
            this.transitionTimeout = null;
            this.updateCall = null;

            this.updateBind = this.update.bind(this);

            this.element = element;
            this.settings = this.extendSettings(settings);

            this.addEventListeners();
        }

        addEventListeners() {
            this.onMouseEnterBind = this.onMouseEnter.bind(this);
            this.onMouseMoveBind = this.onMouseMove.bind(this);
            this.onMouseLeaveBind = this.onMouseLeave.bind(this);

            this.element.addEventListener("mouseenter", this.onMouseEnterBind);
            this.element.addEventListener("mousemove", this.onMouseMoveBind);
            this.element.addEventListener("mouseleave", this.onMouseLeaveBind);
        }

        removeEventListeners() {
            this.element.removeEventListener("mouseenter", this.onMouseEnterBind);
            this.element.removeEventListener("mousemove", this.onMouseMoveBind);
            this.element.removeEventListener("mouseleave", this.onMouseLeaveBind);
        }

        destroy() {
            this.removeEventListeners();
            this.element.vanillaTilt = null;
            this.element = null;
        }

        onMouseEnter(event) {
            this.width = this.element.offsetWidth;
            this.height = this.element.offsetHeight;
            this.left = this.element.offsetLeft;
            this.top = this.element.offsetTop;

            this.element.style.willChange = "transform";
            this.setTransition();
        }

        onMouseMove(event) {
            if (this.updateCall !== null) {
                cancelAnimationFrame(this.updateCall);
            }

            this.event = event;
            this.updateCall = requestAnimationFrame(this.updateBind);
        }

        onMouseLeave(event) {
            this.setTransition();

            if (this.settings.reset) {
                requestAnimationFrame(() => {
                    this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
                        "rotateX(0deg) " +
                        "rotateY(0deg) " +
                        "scale3d(1, 1, 1)";
                });
            }
        }

        update() {
            let x = (this.event.clientX - this.left) / this.width;
            let y = (this.event.clientY - this.top) / this.height;

            x = Math.min(Math.max(x, 0), 1);
            y = Math.min(Math.max(y, 0), 1);

            let tiltX = (this.settings.max / 2 - x * this.settings.max).toFixed(2);
            let tiltY = (y * this.settings.max - this.settings.max / 2).toFixed(2);

            this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
                "rotateX(" + (this.settings.axis === "x" ? 0 : tiltY) + "deg) " +
                "rotateY(" + (this.settings.axis === "y" ? 0 : tiltX) + "deg) " +
                "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

            this.updateCall = null;
        }

        setTransition() {
            clearTimeout(this.transitionTimeout);
            this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
            this.transitionTimeout = setTimeout(() => this.element.style.transition = "", this.settings.speed);
        }

        extendSettings(settings) {
            let defaultSettings = {
                max: 20,
                perspective: 1000,
                easing: "cubic-bezier(.03,.98,.52,.99)",
                scale: "1",
                speed: "300",
                transition: true,
                axis: null,
                reset: true
            };

            let newSettings = {};

            for (var property in defaultSettings) {
                newSettings[property] = settings[property] || this.element.getAttribute("data-tilt-" + property) || defaultSettings[property];
            }

            return newSettings;
        }

        static init(elements, settings) {
            if (elements instanceof Node) {
                elements = [elements];
            }

            if (elements instanceof NodeList) {
                elements = [].slice.call(elements);
            }

            if (!(elements instanceof Array)) {
                return;
            }

            elements.forEach((element) => {
                element.vanillaTilt = new VanillaTilt(element, settings);
            });
        }
    }

    /* expose the class to window */
    window.VanillaTilt = VanillaTilt;

    /**
     * Auto load
     */
    VanillaTilt.init(document.querySelectorAll(["data-tilt"]));
})();