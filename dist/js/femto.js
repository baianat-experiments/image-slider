(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Femto = factory());
}(this, (function () { 'use strict';

/**
 * Utilities
 */
function select(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }
  return element;
}

function sync(callback) {
  setTimeout(function () { return callback(); }, 1000 / 60);
}

function call(func) {
  if (callable(func)) {
    func();
  }
}

function callable(func) {
  return typeof func === 'function';
}

var Femto = function Femto(selector, ref) {
  if ( ref === void 0 ) ref = {};
  var playTime = ref.playTime; if ( playTime === void 0 ) playTime = 5000;
  var slideMode = ref.slideMode; if ( slideMode === void 0 ) slideMode = 'fading';
  var transitionTime = ref.transitionTime; if ( transitionTime === void 0 ) transitionTime = 600;
  var autoPlay = ref.autoPlay; if ( autoPlay === void 0 ) autoPlay = true;
  var plugin = ref.plugin; if ( plugin === void 0 ) plugin = null;
  var active3D = ref.active3D; if ( active3D === void 0 ) active3D = false;
  var mode3D = ref.mode3D; if ( mode3D === void 0 ) mode3D = 1;
  var slicesCount = ref.slicesCount; if ( slicesCount === void 0 ) slicesCount = 4;
  var events = ref.events; if ( events === void 0 ) events = {
    // init(){},
    // slideNext(){},
    // slideBack(){},
    // updating(){},
    // updated(){}
  };


  this.el      = select(selector);
  this.settings= {
    playTime: playTime,
    slideMode: slideMode,
    transitionTime: transitionTime,
    autoPlay: autoPlay,
    plugin: plugin,
    active3D: active3D,
    slicesCount: slicesCount,
    mode3D: mode3D,
    events: events,
  };
  this.init(this.settings.plugin);
};

Femto.create = function create (selector, settings) {
  return new Femto(selector, settings);
};

Femto.prototype.init = function init (plugin) {
    if ( plugin === void 0 ) plugin = null;

  this.slides     = Array.from(this.el.querySelectorAll('.femto-slide'));
  this.dots       = Array.from(this.el.querySelectorAll('.femto-dot'));
  this.activeSlide= this.el.querySelector('.femto-slide.is-active');
  this.activeDot  = this.el.querySelector('.femto-dot.is-active');
  this.loader     = this.el.querySelector('.femto-loader');
  this.nextButton = this.el.querySelector('.femto-next');
  this.backButton = this.el.querySelector('.femto-back');
  this.sliderHeight = this.el.clientHeight;
  this.sliderWidth= this.el.clientWidth;
  this.slidesCount= this.slides.length - 1;
  this.updating   = false;
  this.callbacks  = {};
  this.imagesSrc  = [];

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
};

Femto.prototype.dotsInit = function dotsInit () {
    var this$1 = this;

  this.dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      this$1.updateSlide(index);
    }, false);
  });
};

Femto.prototype.eventsInit = function eventsInit () {
    var this$1 = this;

  if (this.nextButton) {
    this.nextButton.addEventListener('click', this.slideNext.bind(this), false);
  }
  if (this.nextButton) {
    this.backButton.addEventListener('click', this.slideBack.bind(this), false);
  }
  this.el.addEventListener('mousedown', this.pointerDown.bind(this) ,false);
  this.el.addEventListener('touchstart', this.pointerDown.bind(this) ,false);
  window.addEventListener('resize', function () {
    this$1.sliderHeight = this$1.el.clientHeight;
    this$1.sliderWidth= this$1.el.clientWidth;
  }, false);
};

Femto.prototype.imagesInit = function imagesInit () {
    var this$1 = this;

  this.slides.forEach(function (slide, index) {
    var image = slide.querySelector('.femto-image') || '';
    if (image) {
      this$1.imagesSrc.push(image.getAttribute('src'));
    } else {
      this$1.imagesSrc.push('');
    }
    slide.style.backgroundImage = "url('" + (this$1.imagesSrc[index]) + "')";
  });
};

Femto.prototype.slideNext = function slideNext () {
  var activeIndex = this.slides.indexOf(this.activeSlide);
  if (activeIndex === this.slidesCount) {
    this.updateSlide(0, true);
    return;
  }
  this.updateSlide(activeIndex + 1, true);
  call(this.settings.events.slideNext);
};

Femto.prototype.slideBack = function slideBack () {
  var activeIndex = this.slides.indexOf(this.activeSlide);
  if (activeIndex === 0) {
    this.updateSlide(this.slidesCount, false);
    return;
  }
  this.updateSlide(activeIndex - 1, false);
  call(this.settings.events.slideBack);
};

Femto.prototype.updateSlide = function updateSlide (slideNumber, forwards) {
    var this$1 = this;

  if (this.updating || slideNumber > this.slidesCount) return;
  if (this.loading) this.loading = 0;
  if (forwards === undefined) forwards = slideNumber > this.slides.indexOf(this.activeSlide);
  this.updating = true;


  var activeSlide = this.activeSlide;
  var nextSlide = this.slides[slideNumber];
  var fromClass = forwards ? 'is-entering' : 'is-leaving';
  var toClass   = forwards ? 'is-leaving' : 'is-entering';
  var activeClass = 'is-active';

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

  sync(function () {
    activeSlide.classList.remove(activeClass);
    nextSlide.classList.remove(fromClass);
    nextSlide.classList.add(activeClass);
  });

  setTimeout(function () {
    activeSlide.classList.remove(toClass);
    this$1.activeSlide = nextSlide;
    this$1.updating = false;
    call(this$1.settings.events.updated);
  }, this.settings.transitionTime);
};

Femto.prototype.play = function play () {
    var this$1 = this;

  this.playingInterval = setInterval(function () {
    this$1.loading = this$1.loading > 1 ? 0 : this$1.loading + this$1.period;
    this$1.loader.style.width = (this$1.loading * 100) + "%";
    if (! this$1.loading) this$1.slideNext();
  }, (1000 / 60));
};

Femto.prototype.pause = function pause () {
  clearInterval(this.playingInterval);
};

Femto.prototype.autoPlay = function autoPlay (value) {
  if (! value) return;
  this.period = (1000 / 60) / this.settings.playTime;
  this.loading = this.period;
  this.play();
  this.el.addEventListener('mouseover', this.pause.bind(this), false);
  this.el.addEventListener('mouseout', this.play.bind(this), false);
};

Femto.prototype.slideMode = function slideMode () {
    var this$1 = this;

  if (typeof this.settings.slideMode === 'string') {
    this.slides.forEach(function (slide) {
      slide.classList.add(("femto-" + (this$1.settings.slideMode)));
    });
    return;
  }
  this.slides.forEach(function (slide, index) {
    var className = this$1.settings.slideMode[index] || 'fading';
    slide.classList.add(("femto-" + className));
  });
};

// mouse events
Femto.prototype.pointerDown = function pointerDown () {
  this.sledded = false;
  this.mouseX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
  this.mouseY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;

  // add events listener
  this.callbacks.onDrag  = this.pointerDrag.bind(this);
  this.callbacks.onRelease = this.pointerRelease.bind(this);
  document.addEventListener('mousemove', this.callbacks.onDrag, false);
  document.addEventListener('mouseup', this.callbacks.onRelease, false);
  document.addEventListener('touchmove', this.callbacks.onDrag, false);
  document.addEventListener('touchend', this.callbacks.onRelease, false);
};

Femto.prototype.pointerDrag = function pointerDrag () {
  // get drag change value
  var eventX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
  var eventY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
  var dragX= (eventX - this.mouseX);
  var dragY= (eventY - this.mouseY);

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
};

Femto.prototype.pointerRelease = function pointerRelease () {
  document.removeEventListener('mousemove', this.callbacks.onDrag);
  document.removeEventListener('mouseup', this.callbacks.onRelease);
  document.removeEventListener('touchmove', this.callbacks.onDrag);
  document.removeEventListener('touchend',this.callbacks.onRelease);
};

return Femto;

})));
