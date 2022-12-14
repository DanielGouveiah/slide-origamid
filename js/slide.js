import debounce from "./debounce.js";

export default class Slide {
  constructor(slide, wrapper, activeClass) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);

    this.dist = { finalPosition: 0, startX: 0, movement: 0 };
    this.activeClass = activeClass;
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onMove(event) {
    const movePosition =
      event.type === "mousemove" ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(movePosition);
    this.moveSlide(finalPosition);
    this.transition(false);
  }

  onStart(event) {
    event.preventDefault();
    let movetype;
    if (event.type === "mousedown") {
      this.dist.startX = event.clientX;
      movetype = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }
    this.wrapper.addEventListener(movetype, this.onMove);
  }

  onEnd(event) {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.changeSlideOnEnd();
    this.transition(true);
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next != undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev != undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  addSlideEvents(event) {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  bindEvents(event) {
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onMove = this.onMove.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 500);
  }

  // slides config

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slidesArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return {
        element,
        position,
      };
    });
  }

  slidesIndexNav(index) {
    const last = this.slidesArray.length - 1;
    return (this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    });
  }

  changeSlide(index) {
    const activeSlide = this.slidesArray[index];
    this.slidesIndexNav(index);
    this.changeActiveSlide();
    this.moveSlide(activeSlide.position);
    this.dist.finalPosition = activeSlide.position;

    this.wrapper.dispatchEvent(this.changeEvent);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  changeActiveSlide() {
    this.slidesArray.forEach((item) => item.element.classList.remove(this.activeClass));
    this.slidesArray[this.index.active].element.classList.add(this.activeClass);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    this.changeSlide(0);
    this.addResizeEvent();
    this.transition(false);
    return this;
  }
}

export class SlideNav extends Slide {
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvents();
  }

  addArrowEvents() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement("ul");
    this.slidesArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });

    this.wrapper.appendChild(control);

    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
      this.activeItemControl();
    });
    this.wrapper.addEventListener("changeEvent", this.activeItemControl);
  }

  activeItemControl() {
    this.controlArray.forEach((item) => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
    this.transition(true);
  }

  addControl(customControl) {
    this.bindControl();
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeItemControl();

    this.controlArray.forEach(this.eventControl);
    this.control.dataset.control = "slide";
  }

  bindControl() {
    this.createControl = this.createControl.bind(this);
    this.eventControl = this.eventControl.bind(this);
    this.activeItemControl = this.activeItemControl.bind(this);
  }
}
