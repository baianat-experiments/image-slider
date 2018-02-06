import { select, sync, call, callable } from './utilities';

class Flow {
  constructor(selector, {
    playTime       = 5000,
    slideMode      = 'fading',
    transitionTime = 600,
    autoPlay       = true,
    plugin         = null,
    active3D       = false,
    mode3D         = 1,
    slicesCount    = 4,
    events         = {
      // init(){},
      // slideNext(){},
      // slideBack(){},
      // updating(){},
      // updated(){}
    }
  } = {}) {

    this.el        = select(selector);
    this.settings  = {
      playTime,
      slideMode,
      transitionTime,
      autoPlay,
      plugin,
      active3D,
      slicesCount,
      mode3D,
      events,
    };
    this.init(this.settings.plugin);
  }

  static create(selector, settings) {
    return new Flow(selector, settings);
  }

  init(plugin = null) {
    this.slides       = Array.from(this.el.querySelectorAll('.flow-slide'));
    this.dots         = Array.from(this.el.querySelectorAll('.flow-dot'));
    this.activeSlide  = this.el.querySelector('.flow-slide.is-active');
    this.activeDot    = this.el.querySelector('.flow-dot.is-active');
    this.loader       = this.el.querySelector('.flow-loader');
    this.nextButton   = this.el.querySelector('.flow-next');
    this.backButton   = this.el.querySelector('.flow-back');
    this.sliderHeight = this.el.clientHeight;
    this.sliderWidth  = this.el.clientWidth;
    this.slidesCount  = this.slides.length - 1;
    this.updating     = false;
    this.callbacks    = {};
    this.imagesSrc    = [];

    this.dotsInit();
    this.eventsInit();
    this.imagesInit();
    this.slideMode();

    this.autoPlay(this.settings.autoPlay);
    call(this.settings.events.init);
    if (plugin) {
      this.plugin = new plugin(this, this.settings);
    }
    if (this.plugin && callable(this.plugin.init)) {
      this.plugin.init();
    }
  }

  dotsInit() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.updateSlide(index);
      }, false);
    });
  }

  eventsInit() {
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.slideNext.bind(this), false);
    }
    if (this.nextButton) {
      this.backButton.addEventListener('click', this.slideBack.bind(this), false);
    }
    this.el.addEventListener('mousedown', this.pointerDown.bind(this) ,false);
    this.el.addEventListener('touchstart', this.pointerDown.bind(this) ,false);
    window.addEventListener('resize', () => {
      this.sliderHeight = this.el.clientHeight;
      this.sliderWidth  = this.el.clientWidth;
    }, false);
  }

  imagesInit() {
    this.slides.forEach((slide, index) => {
      const image = slide.querySelector('.flow-image') || '';
      if (image) {
        this.imagesSrc.push(image.getAttribute('src'));
      } else {
        this.imagesSrc.push('');
      }
      slide.style.backgroundImage = `url('${this.imagesSrc[index]}')`;
    });
  }

  slideNext() {
    const activeIndex = this.slides.indexOf(this.activeSlide);
    if (activeIndex === this.slidesCount) {
      this.updateSlide(0, true);
      return;
    }
    this.updateSlide(activeIndex + 1, true);
    call(this.settings.events.slideNext);
  }

  slideBack() {
    const activeIndex = this.slides.indexOf(this.activeSlide);
    if (activeIndex === 0) {
      this.updateSlide(this.slidesCount, false);
      return;
    }
    this.updateSlide(activeIndex - 1, false);
    call(this.settings.events.slideBack);
  }

  updateSlide(slideNumber, forwards) {
    if (this.updating || slideNumber > this.slidesCount) return;
    if (this.loading) this.loading = 0;
    if (forwards === undefined) forwards = slideNumber > this.slides.indexOf(this.activeSlide);
    this.updating = true;


    const activeSlide = this.activeSlide;
    const nextSlide   = this.slides[slideNumber];
    const fromClass   = forwards ? 'is-entering' : 'is-leaving';
    const toClass     = forwards ? 'is-leaving' : 'is-entering';
    const activeClass = 'is-active';

    if (this.dots[slideNumber]) {
      this.activeDot.classList.remove(activeClass);
      this.dots[slideNumber].classList.add(activeClass);
      this.activeDot = this.dots[slideNumber];
    } else if (this.activeDot) {
      this.activeDot.classList.remove(activeClass);
    }

    call(this.settings.events.updating);
    if (this.plugin && callable(this.plugin.updateSlide)) {
      this.plugin.updateSlide(slideNumber);
      return;
    }

    activeSlide.classList.add(toClass);
    nextSlide.classList.add(fromClass);

    sync(() => {
      activeSlide.classList.remove(activeClass);
      nextSlide.classList.remove(fromClass);
      nextSlide.classList.add(activeClass);
    });

    setTimeout(() => {
      activeSlide.classList.remove(toClass);
      this.activeSlide = nextSlide;
      this.updating = false;
      call(this.settings.events.updated);
    }, this.settings.transitionTime);
  }

  play() {
    this.playingInterval = setInterval(() => {
      this.loading = this.loading > 1 ? 0 : this.loading + this.period;
      this.loader.style.width = `${this.loading * 100}%`;
      if (! this.loading) this.slideNext();
    }, (1000 / 60));
  }

  pause() {
    clearInterval(this.playingInterval);
  }

  autoPlay(value) {
    if (! value) return;
    this.period = (1000 / 60) / this.settings.playTime;
    this.loading = this.period;
    this.play();
    this.el.addEventListener('mouseover', this.pause.bind(this), false);
    this.el.addEventListener('mouseout', this.play.bind(this), false);
  }

  slideMode() {
    if (typeof this.settings.slideMode === 'string') {
      this.slides.forEach((slide) => {
        slide.classList.add(`flow-${this.settings.slideMode}`);
      });
      return;
    }
    this.slides.forEach((slide, index) => {
      const className = this.settings.slideMode[index] || 'fading';
      slide.classList.add(`flow-${className}`);
    });
  }

  // mouse events
  pointerDown() {
    this.sledded = false;
    this.mouseX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
    this.mouseY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;

    // add events listener
    this.callbacks.onDrag    = this.pointerDrag.bind(this);
    this.callbacks.onRelease = this.pointerRelease.bind(this);
    document.addEventListener('mousemove', this.callbacks.onDrag, false);
    document.addEventListener('mouseup', this.callbacks.onRelease, false);
    document.addEventListener('touchmove', this.callbacks.onDrag, false);
    document.addEventListener('touchend', this.callbacks.onRelease, false);
  }

  pointerDrag() {
    // get drag change value
    const eventX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
    const eventY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
    const dragX  = (eventX - this.mouseX);
    const dragY  = (eventY - this.mouseY);

    // check if left mouse is clicked
    if (event.buttons !== 1 && event.type === 'mousemove' || this.sledded) return;
    if (dragX + dragY > 50) {
      this.slideNext();
      this.sledded = true;
    }
    if (dragX + dragY < -50) {
      this.slideBack();
      this.sledded = true;
    }
  }

  pointerRelease() {
    document.removeEventListener('mousemove', this.callbacks.onDrag);
    document.removeEventListener('mouseup',   this.callbacks.onRelease);
    document.removeEventListener('touchmove', this.callbacks.onDrag);
    document.removeEventListener('touchend',  this.callbacks.onRelease);
  }
}

export default Flow;