/**
    * v0.0.1
    * (c) 2018 Baianat
    * @license MIT
    */
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
    setTimeout(function () {
      return callback();
    }, 1000 / 60);
  }

  function call(func) {
    if (callable(func)) {
      func();
    }
  }

  function callable(func) {
    return typeof func === 'function';
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Flow = function () {
    function Flow(selector, settings) {
      classCallCheck(this, Flow);


      this.el = select(selector);
      this.settings = Object.assign({}, Flow.defaults, settings);
      this.init(this.settings.plugin);
    }

    createClass(Flow, [{
      key: 'init',
      value: function init() {
        var plugin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
      }
    }, {
      key: 'indicatorsInit',
      value: function indicatorsInit() {
        var _this = this;

        var indicatorsList = document.createElement('ul');
        indicatorsList.classList.add('flow-dots');
        this.slides.forEach(function (slide, index) {
          var listItem = document.createElement('li');
          var indicator = _this.indicators[index] = document.createElement('a');
          indicator.classList.add('flow-dot');
          indicator.classList.toggle('is-active', index === _this.activeIndex);
          indicator.addEventListener('click', function () {
            return _this.updateSlide(index);
          });
          listItem.appendChild(indicator);
          indicatorsList.appendChild(listItem);
        });
        this.el.appendChild(indicatorsList);
      }
    }, {
      key: 'eventsInit',
      value: function eventsInit() {
        var _this2 = this;

        if (this.nextButton) {
          this.nextButton.addEventListener('click', this.slideNext.bind(this), false);
        }
        if (this.nextButton) {
          this.backButton.addEventListener('click', this.slideBack.bind(this), false);
        }
        this.el.addEventListener('mousedown', this.pointerDown.bind(this), false);
        this.el.addEventListener('touchstart', this.pointerDown.bind(this), false);
        window.addEventListener('resize', function () {
          _this2.sliderHeight = _this2.el.clientHeight;
          _this2.sliderWidth = _this2.el.clientWidth;
        }, false);
      }
    }, {
      key: 'imagesInit',
      value: function imagesInit() {
        var _this3 = this;

        this.slides.forEach(function (slide, index) {
          var image = slide.querySelector('.flow-image');
          if (image) {
            _this3.imagesSrc.push(image.getAttribute('src'));
          } else {
            _this3.imagesSrc.push('');
          }
          slide.style.backgroundImage = 'url(\'' + _this3.imagesSrc[index] + '\')';
        });
      }
    }, {
      key: 'slideNext',
      value: function slideNext() {
        if (this.activeIndex === this.slidesCount) {
          this.updateSlide(0, true);
          return;
        }
        this.updateSlide(this.activeIndex + 1, true);
        call(this.settings.events.slideNext);
      }
    }, {
      key: 'slideBack',
      value: function slideBack() {
        if (this.activeIndex === 0) {
          this.updateSlide(this.slidesCount, false);
          return;
        }
        this.updateSlide(this.activeIndex - 1, false);
        call(this.settings.events.slideBack);
      }
    }, {
      key: 'updateSlide',
      value: function updateSlide(slideNumber, forwards) {
        var _this4 = this;

        if (this.updating || slideNumber > this.slidesCount) {
          return;
        }
        if (this.loading) {
          this.loading = 0;
        }
        if (forwards === undefined) {
          forwards = slideNumber > this.slides.indexOf(this.activeSlide);
        }
        this.updating = true;

        var activeSlide = this.activeSlide;
        var nextSlide = this.slides[slideNumber];
        var fromClass = forwards ? 'is-entering' : 'is-leaving';
        var toClass = forwards ? 'is-leaving' : 'is-entering';
        var activeClass = 'is-active';

        if (this.indicators) {
          this.indicators[this.activeIndex].classList.remove(activeClass);
          this.indicators[slideNumber].classList.add(activeClass);
        }

        setTimeout(function () {
          _this4.loader.style.transition = '';
          _this4.loader.style.opacity = '';
          _this4.loader.style.width = '0';

          _this4.activeSlide = nextSlide;
          _this4.activeIndex = slideNumber;
        }, this.settings.transitionTime);

        call(this.settings.events.updating);

        // if using a plugin
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
          _this4.updating = false;
          _this4.loader.style.transition = _this4.settings.transitionTime / 1000 + 's';
          _this4.loader.style.opacity = '0';
          _this4.loader.style.width = '100%';
        });

        setTimeout(function () {
          activeSlide.classList.remove(toClass);
          call(_this4.settings.events.updated);
        }, this.settings.transitionTime);
      }
    }, {
      key: 'play',
      value: function play() {
        var _this5 = this;

        this.playingInterval = setInterval(function () {
          _this5.loading = _this5.loading > 1 ? 0 : _this5.loading + _this5.period;
          _this5.loader.style.width = _this5.loading * 100 + '%';
          if (!_this5.loading) _this5.slideNext();
        }, 1000 / 60);
      }
    }, {
      key: 'pause',
      value: function pause() {
        clearInterval(this.playingInterval);
      }
    }, {
      key: 'autoPlay',
      value: function autoPlay(value) {
        if (!value) return;
        this.period = 1000 / 60 / this.settings.playTime;
        this.loading = this.period;
        this.play();
        this.el.addEventListener('mouseover', this.pause.bind(this), false);
        this.el.addEventListener('mouseout', this.play.bind(this), false);
      }
    }, {
      key: 'slideMode',
      value: function slideMode() {
        var _this6 = this;

        if (typeof this.settings.slideMode === 'string') {
          this.slides.forEach(function (slide) {
            slide.classList.add('flow-' + _this6.settings.slideMode);
          });
          return;
        }
        this.slides.forEach(function (slide, index) {
          var className = _this6.settings.slideMode[index] || 'fading';
          slide.classList.add('flow-' + className);
        });
      }

      // mouse events

    }, {
      key: 'pointerDown',
      value: function pointerDown() {
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
    }, {
      key: 'pointerDrag',
      value: function pointerDrag() {
        // get drag change value
        var eventX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
        var eventY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
        var dragX = eventX - this.mouseX;
        var dragY = eventY - this.mouseY;

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
    }, {
      key: 'pointerRelease',
      value: function pointerRelease() {
        document.removeEventListener('mousemove', this.callbacks.onDrag);
        document.removeEventListener('mouseup', this.callbacks.onRelease);
        document.removeEventListener('touchmove', this.callbacks.onDrag);
        document.removeEventListener('touchend', this.callbacks.onRelease);
      }

      // eslint-disable-next-line

    }], [{
      key: 'create',
      value: function create(selector, settings) {
        return new Flow(selector, settings);
      }
    }]);
    return Flow;
  }();

  Flow.defaults = {
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
  };

  return Flow;

})));
