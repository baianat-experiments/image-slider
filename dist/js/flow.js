(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Flow = factory());
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

var Flow = function Flow(selector, ref) {
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

Flow.create = function create (selector, settings) {
  return new Flow(selector, settings);
};

Flow.prototype.init = function init (plugin) {
    if ( plugin === void 0 ) plugin = null;

  this.slides = Array.from(this.el.querySelectorAll('.flow-slide'));
  this.activeSlide = this.el.querySelector('.flow-slide.is-active');
  this.activeIndex = this.slides.indexOf(this.activeSlide);
  this.loader = this.el.querySelector('.flow-loader');
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

  this.autoPlay(this.settings.autoPlay);
  call(this.settings.events.init);
  if (plugin) {
    this.plugin = new plugin(this, this.settings);
  }
  if (this.plugin && callable(this.plugin.init)) {
    this.plugin.init();
  }
};

Flow.prototype.indicatorsInit = function indicatorsInit () {
    var this$1 = this;

  var indicatorsList = document.createElement('ul');
  indicatorsList.classList.add('flow-dots');
  this.slides.forEach(function (slide, index) {
    var listItem = document.createElement('li');
    var indicator = this$1.indicators[index] = document.createElement('a');
    indicator.classList.add('flow-dot');
    indicator.classList.toggle('is-active', index === this$1.activeIndex);
    indicator.addEventListener('click', function () { return this$1.updateSlide(index); });
    listItem.appendChild(indicator);
    indicatorsList.appendChild(listItem);
  });
  this.el.appendChild(indicatorsList);
};

Flow.prototype.eventsInit = function eventsInit () {
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

Flow.prototype.imagesInit = function imagesInit () {
    var this$1 = this;

  this.slides.forEach(function (slide, index) {
    var image = slide.querySelector('.flow-image');
    if (image) {
      this$1.imagesSrc.push(image.getAttribute('src'));
    } else {
      this$1.imagesSrc.push('');
    }
    slide.style.backgroundImage = "url('" + (this$1.imagesSrc[index]) + "')";
  });
};

Flow.prototype.slideNext = function slideNext () {
  if (this.activeIndex === this.slidesCount) {
    this.updateSlide(0, true);
    return;
  }
  this.updateSlide(this.activeIndex + 1, true);
  call(this.settings.events.slideNext);
};

Flow.prototype.slideBack = function slideBack () {
  if (this.activeIndex === 0) {
    this.updateSlide(this.slidesCount, false);
    return;
  }
  this.updateSlide(this.activeIndex - 1, false);
  call(this.settings.events.slideBack);
};

Flow.prototype.updateSlide = function updateSlide (slideNumber, forwards) {
    var this$1 = this;

  if (this.updating || slideNumber > this.slidesCount) return;
  console.log(this.updating);
  if (this.loading) this.loading = 0;
  if (forwards === undefined) forwards = slideNumber > this.slides.indexOf(this.activeSlide);
  this.updating = true;

  console.log(slideNumber, this.activeIndex);

  var activeSlide = this.activeSlide;
  var nextSlide = this.slides[slideNumber];
  var fromClass = forwards ? 'is-entering' : 'is-leaving';
  var toClass   = forwards ? 'is-leaving' : 'is-entering';
  var activeClass = 'is-active';

  if (this.indicators) {
    this.indicators[this.activeIndex].classList.remove(activeClass);
    this.indicators[slideNumber].classList.add(activeClass);
  }

  setTimeout(function () {
    this$1.loader.style.transition = '';
    this$1.loader.style.opacity = '';
    this$1.loader.style.width = '0';
      
    this$1.activeSlide = nextSlide;
    this$1.activeIndex = slideNumber;
  }, this.settings.transitionTime);
    
  call(this.settings.events.updating);
    
  // if using 3d plugin
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
    this$1.updating = false;
    this$1.loader.style.transition = (this$1.settings.transitionTime / 1000) + "s";
    this$1.loader.style.opacity = '0';
    this$1.loader.style.width = '100%';
  });

  setTimeout(function () {
    activeSlide.classList.remove(toClass);
    call(this$1.settings.events.updated);
  }, this.settings.transitionTime);
};

Flow.prototype.play = function play () {
    var this$1 = this;

  this.playingInterval = setInterval(function () {
    this$1.loading = this$1.loading > 1 ? 0 : this$1.loading + this$1.period;
    this$1.loader.style.width = (this$1.loading * 100) + "%";
    if (! this$1.loading) this$1.slideNext();
  }, (1000 / 60));
};

Flow.prototype.pause = function pause () {
  clearInterval(this.playingInterval);
};

Flow.prototype.autoPlay = function autoPlay (value) {
  if (! value) return;
  this.period = (1000 / 60) / this.settings.playTime;
  this.loading = this.period;
  this.play();
  this.el.addEventListener('mouseover', this.pause.bind(this), false);
  this.el.addEventListener('mouseout', this.play.bind(this), false);
};

Flow.prototype.slideMode = function slideMode () {
    var this$1 = this;

  if (typeof this.settings.slideMode === 'string') {
    this.slides.forEach(function (slide) {
      slide.classList.add(("flow-" + (this$1.settings.slideMode)));
    });
    return;
  }
  this.slides.forEach(function (slide, index) {
    var className = this$1.settings.slideMode[index] || 'fading';
    slide.classList.add(("flow-" + className));
  });
};

// mouse events
Flow.prototype.pointerDown = function pointerDown () {
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

Flow.prototype.pointerDrag = function pointerDrag () {
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

Flow.prototype.pointerRelease = function pointerRelease () {
  document.removeEventListener('mousemove', this.callbacks.onDrag);
  document.removeEventListener('mouseup', this.callbacks.onRelease);
  document.removeEventListener('touchmove', this.callbacks.onDrag);
  document.removeEventListener('touchend',this.callbacks.onRelease);
};

return Flow;

})));
