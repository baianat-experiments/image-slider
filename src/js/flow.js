import { select, async, call, callable } from './utils';

class Flow {
  constructor (selector, settings) {

    this.el = select(selector);
    this.settings = {
      ...Flow.defaults,
      ...settings
    };
    this.init(this.settings.plugin);
  }

  static create (selector, settings) {
    return new Flow(selector, settings);
  }

  init (plugin = null) {
    this.slides = Array.from(this.el.querySelectorAll('.flow-slide'));
    this.activeIndex = this.slides.indexOf(this.el.querySelector('.flow-slide.is-active'));
    this.nextButton = this.el.querySelector('.flow-next');
    this.backButton = this.el.querySelector('.flow-back');
    this.sliderHeight = this.el.clientHeight;
    this.sliderWidth = this.el.clientWidth;
    this.slidesCount = this.slides.length - 1;
    this.updating = false;
    this.callbacks = {};
    this.imagesSrc = [];
    this.indicators = [];

    this.indicatorsInit();
    this.eventsInit();
    this.imagesInit();
    this.slideMode();

    if (this.settings.autoPlay) {
      this.loader = document.createElement('div');
      this.loader.classList.add('flow-loader');
      this.el.appendChild(this.loader);
      this.autoPlay();
    }
    call(this.settings.events.init);
    if (plugin) {
      this.plugin = new plugin(this, this.settings);
    }
    if (this.plugin && callable(this.plugin.init)) {
      this.plugin.init();
    }
  }

  indicatorsInit () {
    const indicatorsList = document.createElement('ul');
    indicatorsList.classList.add('flow-dots');
    this.slides.forEach((slide, index) => {
      const listItem = document.createElement('li');
      const indicator = this.indicators[index] = document.createElement('a');
      indicator.classList.add('flow-dot');
      indicator.classList.toggle('is-active', index === this.activeIndex);
      indicator.addEventListener('click', () => this.updateSlide(index));
      indicator.addEventListener('touchstart', () => this.updateSlide(index));
      listItem.appendChild(indicator);
      indicatorsList.appendChild(listItem);
    })
    this.el.appendChild(indicatorsList);
  }

  eventsInit () {
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.slideNext.bind(this), false);
      this.nextButton.addEventListener('touchstart', this.slideNext.bind(this), false);
    }
    if (this.nextButton) {
      this.backButton.addEventListener('click', this.slideBack.bind(this), false);
      this.backButton.addEventListener('touchstart', this.slideBack.bind(this), false);
    }
    this.el.addEventListener('mousedown', (e) => this.pointerDown(e), false);
    this.el.addEventListener('touchstart', (e) => this.pointerDown(e), false);
    window.addEventListener('resize', () => {
      this.sliderHeight = this.el.clientHeight;
      this.sliderWidth = this.el.clientWidth;
    }, false);
  }

  imagesInit () {
    this.slides.forEach((slide, index) => {
      const image = slide.querySelector('.flow-image');
      if (image) {
        this.imagesSrc.push(image.getAttribute('src'));
      } else {
        this.imagesSrc.push('');
      }
      slide.style.backgroundImage = `url('${this.imagesSrc[index]}')`;
    });
  }

  slideNext () {
    if (this.activeIndex === this.slidesCount) {
      this.updateSlide(0, true);
      return;
    }
    this.updateSlide(this.activeIndex + 1, true);
    call(this.settings.events.slideNext);
  }

  slideBack () {
    if (this.activeIndex === 0) {
      this.updateSlide(this.slidesCount, false);
      return;
    }
    this.updateSlide(this.activeIndex - 1, false);
    call(this.settings.events.slideBack);
  }

  updateSlide (slideNumber, forwards) {
    if (
      this.updating ||
      slideNumber > this.slidesCount ||
      slideNumber === this.activeIndex
    ) {
      return;
    }
    forwards = forwards || slideNumber > this.activeIndex;
    this.updating = true;
    this.updateIndicators(slideNumber);
    call(this.settings.events.updating);

    // if using a plugin
    if (this.plugin && callable(this.plugin.updateSlide)) {
      this.plugin.updateSlide(slideNumber);
      return;
    }

    const activeSlide = this.slides[this.activeIndex];
    const nextSlide = this.slides[slideNumber];
    const fromClass = forwards ? 'is-entering' : 'is-leaving';
    const toClass = forwards ? 'is-leaving' : 'is-entering';
    const activeClass = 'is-active';

    setTimeout(() => {
      this.activeIndex = slideNumber;
    }, this.settings.transitionTime);

    activeSlide.classList.add(toClass);
    nextSlide.classList.add(fromClass);

    async(() => {
      activeSlide.classList.remove(activeClass);
      nextSlide.classList.remove(fromClass);
      nextSlide.classList.add(activeClass);
      this.updating = false;
    });

    setTimeout(() => {
      activeSlide.classList.remove(toClass);
      call(this.settings.events.updated);
    }, this.settings.transitionTime);
  }

  updateIndicators(slideNumber) {
    if (!this.indicators) {
      return;
    }
    const activeClass = 'is-active';
    this.indicators[this.activeIndex].classList.remove(activeClass);
    this.indicators[slideNumber].classList.add(activeClass);
  }

  play () {
    this.period = 16 / this.settings.playTime;
    this.playingInterval = setInterval(() => {
      if (this.loading >= 1) {
        this.loading = 0;
        this.loader.style.transform = 'scaleX(0)';
        this.slideNext();
      }
      window.requestAnimationFrame(() => {
        this.loading += this.period;
        this.loader.style.transform = `scaleX(${this.loading})`;
      })
    }, 16);
  }

  pause () {
    clearInterval(this.playingInterval);
  }

  autoPlay () {
    this.loading = 0;
    this.play();
    this.el.addEventListener('mouseover', this.pause.bind(this), false);
    this.el.addEventListener('mouseout', this.play.bind(this), false);
  }

  slideMode () {
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
  pointerDown (event) {
    this.sledded = false;
    this.mouseX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
    this.mouseY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;

    // add events listener
    this.callbacks.onDrag = this.pointerDrag.bind(this);
    this.callbacks.onRelease = this.pointerRelease.bind(this);
    document.addEventListener('mousemove', this.callbacks.onDrag, false);
    document.addEventListener('mouseup', this.callbacks.onRelease, false);
    document.addEventListener('touchmove', this.callbacks.onDrag, false);
    document.addEventListener('touchend', this.callbacks.onRelease, false);
  }

  pointerDrag () {
    // get drag change value
    const eventX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
    const eventY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
    const dragX = (eventX - this.mouseX);
    const dragY = (eventY - this.mouseY);

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

  pointerRelease () {
    document.removeEventListener('mousemove', this.callbacks.onDrag);
    document.removeEventListener('mouseup', this.callbacks.onRelease);
    document.removeEventListener('touchmove', this.callbacks.onDrag);
    document.removeEventListener('touchend', this.callbacks.onRelease);
  }
  
  // eslint-disable-next-line
  static defaults = {
    playTime: 5000,
    slideMode: 'fading',
    transitionTime: 600,
    autoPlay: true,
    plugin: null,
    active3D: false,
    mode3D: 1,
    slicesCount: 4,
    events: {
      // init(){},
      // slideNext(){},
      // slideBack(){},
      // updating(){},
      // updated(){}
    }
  }
}

export default Flow;