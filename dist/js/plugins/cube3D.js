/**
    * v0.0.1
    * (c) 2018 Baianat
    * @license MIT
    */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Cube3D = factory());
}(this, (function () { 'use strict';

  /**
   * Utilities
   */
  function css(element, styles) {
    Object.keys(styles).forEach(function (key) {
      element.style[key] = styles[key];
    });
  }
  function async(callback) {
    setTimeout(callback, 16);
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  var Cube3D = function () {
    function Cube3D(flow, settings) {
      classCallCheck(this, Cube3D);

      this.flow = flow;
      this.settings = settings;
    }

    createClass(Cube3D, [{
      key: 'init',
      value: function init() {
        var _this = this;

        this.fragment = document.createDocumentFragment();
        var cubeContainer = document.createElement('div');
        cubeContainer.classList.add('animation-3d');
        cubeContainer.insertAdjacentHTML('afterbegin', ('<div class="cube">\n       ' + '<div class="cube-face"></div>'.repeat(6) + '\n     </div>').repeat(this.settings.slicesCount));
        this.fragment.appendChild(cubeContainer);
        this.flow.el.appendChild(this.fragment);
        this.cubes = Array.from(this.flow.el.querySelectorAll('.cube'));
        this.initMode(this.settings.mode3D);
        this.flow.slides.forEach(function (slide) {
          slide.style.backgroundPosition = _this.settings.isVertical ? 'left center' : 'center top';
        });
      }
    }, {
      key: 'initMode',
      value: function initMode(mode) {
        switch (mode) {
          case 1:
            this.settings.isVertical = true;
            this.settings.rotateAxis = 'X';
            this.settings.rotateDegree = 90;
            break;
          case 2:
            this.settings.isVertical = true;
            this.settings.rotateAxis = 'X';
            this.settings.rotateDegree = 180;
            break;
          case 3:
            this.settings.isVertical = false;
            this.settings.rotateAxis = 'X';
            this.settings.rotateDegree = 90;
            break;
          case 4:
            this.settings.isVertical = false;
            this.settings.rotateAxis = 'X';
            this.settings.rotateDegree = 180;
            break;
          case 5:
            this.settings.isVertical = false;
            this.settings.rotateAxis = 'Y';
            this.settings.rotateDegree = 180;
            break;
          case 'random':
            this.initMode(getRandomInt(0, 5));
            break;
          default:
            this.settings.isVertical = true;
            this.settings.rotateAxis = 'X';
            this.settings.rotateDegree = 90;
            break;
        }
      }
    }, {
      key: 'updateSlide',
      value: function updateSlide(slideNumber) {
        var _this2 = this;

        // give cubes style
        this.styleCubes(this.flow.imagesSrc[this.flow.activeIndex], this.flow.imagesSrc[slideNumber]);
        var activeSlide = this.flow.slides[this.flow.activeIndex];
        var lastCube = this.cubes[this.cubes.length - 1];
        var animation = this.flow.el.querySelector('.animation-3d');

        animation.style.display = 'block';
        this.flow.el.style.overflow = 'visible';
        activeSlide.classList.remove('is-active');
        activeSlide.style.display = 'none';
        async(function () {
          _this2.cubes.forEach(function (cube, index) {
            setTimeout(function () {
              cube.style.transform = _this2.getCubesModeTransform();
            }, (index + 1) * 100);
          });
        });

        // reset animation
        var transitionEndCallback = function transitionEndCallback() {
          animation.style.display = 'none';
          _this2.flow.el.style.overflow = 'hidden';
          _this2.flow.slides[slideNumber].style.display = 'block';
          _this2.flow.slides[slideNumber].classList.add('is-active');
          _this2.flow.updating = false;
          _this2.flow.activeIndex = slideNumber;
          lastCube.removeEventListener('transitionend', transitionEndCallback);
        };
        lastCube.addEventListener('transitionend', transitionEndCallback);
      }
    }, {
      key: 'getCubesModeTransform',
      value: function getCubesModeTransform() {
        var zIndex = this.settings.isVertical ? this.flow.sliderHeight / 2 : this.flow.sliderHeight / this.settings.slicesCount / 2;
        var rotateAxis = this.settings.rotateAxis.toUpperCase() === 'Y' ? 'Y' : 'X';
        switch (this.settings.rotateDegree) {
          case 90:
            return 'translate3d(0, 0, -' + zIndex + 'px) rotate' + rotateAxis + '(-90deg)';
          case 180:
            return 'translate3d(0, 0, -' + zIndex + 'px) rotate' + rotateAxis + '(180deg)';
          default:
            return 'translate3d(0, 0, -' + zIndex + 'px) rotateX(-90deg)';
        }
      }
    }, {
      key: 'setImagesSrc',
      value: function setImagesSrc(facesStyle, current, next) {
        switch (this.settings.rotateDegree) {
          case 90:
            facesStyle[0].backgroundImage = 'url(' + current + ')';
            facesStyle[1].backgroundImage = 'url(' + next + ')';
            break;
          case 180:
            facesStyle[0].backgroundImage = 'url(' + current + ')';
            facesStyle[2].backgroundImage = 'url(' + next + ')';
            break;
          default:
            facesStyle[0].backgroundImage = 'url(' + current + ')';
            facesStyle[1].backgroundImage = 'url(' + next + ')';
            break;
        }
        return facesStyle;
      }
    }, {
      key: 'styleCubes',
      value: function styleCubes(current, next) {
        var _this3 = this;

        var midd = Math.ceil(this.settings.slicesCount / 2);
        var height = this.flow.sliderHeight;
        var width = this.flow.sliderWidth;
        var slicesCount = this.settings.slicesCount;
        var halfHeight = this.flow.sliderHeight / 2;
        var widthRatio = this.flow.sliderWidth / this.settings.slicesCount;
        var heightRatio = this.flow.sliderHeight / this.settings.slicesCount;

        // get the image height after it resized to the slider width
        var currentImage = new Image();
        var nextImage = new Image();
        currentImage.src = current;
        nextImage.src = next;
        var currentImageHeight = this.flow.sliderWidth / currentImage.width * currentImage.height;
        var nextImageHeight = this.flow.sliderWidth / nextImage.width * nextImage.height;

        // cube faces styling
        var facesStyle = this.settings.isVertical ? [{
          transform: 'translate3d(0, 0, ' + halfHeight + 'px) rotateY(0)',
          backgroundSize: currentImageHeight > this.flow.sliderHeight ? 100 * slicesCount + '% auto' : 'auto 100%'
        }, {
          transform: 'translate3d(0, -50%, 0) rotateX(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? 100 * slicesCount + '% auto' : 'auto 100%'
        }, {
          transform: this.settings.rotateAxis === 'Y' ? 'translate3d(0, 0, -' + halfHeight + 'px) scaleX(-1)' : 'translate3d(0, 0, -' + halfHeight + 'px) rotateX(180deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? 100 * slicesCount + '% auto' : 'auto 100%'
        }, {
          transform: 'translate3d(0, 50%, 0) rotateX(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? 100 * slicesCount + '% auto' : 'auto 100%'
        }, {
          width: height + 'px',
          transform: 'translate3d(-50%, 0, 0) rotateY(90deg)'
        }, {
          width: height + 'px',
          transform: 'translate3d(calc(' + widthRatio + 'px - 50%), 0, 0) rotateY(90deg)'
        }] : [{
          transform: 'translate3d(0, 0, ' + heightRatio / 2 + 'px) rotateY(0)',
          backgroundSize: currentImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }, {
          transform: 'translate3d(0, -50%, 0) rotateX(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }, {
          transform: this.settings.rotateAxis === 'Y' ? 'translate3d(0, 0, -' + heightRatio / 2 + 'px) scaleX(-1)' : 'translate3d(0, 0, -' + heightRatio / 2 + 'px) rotateX(180deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }, {
          transform: 'translate3d(0, 50%, 0) rotateX(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }, {
          width: heightRatio + 'px',
          transform: 'translate3d(-50%, 0, 0) rotateY(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }, {
          width: heightRatio + 'px',
          transform: 'translate3d(calc(' + width + 'px - 50%), 0, 0) rotateY(90deg)',
          backgroundSize: nextImageHeight > this.flow.sliderHeight ? '100% auto' : 'auto ' + 100 * slicesCount + '%'
        }];

        facesStyle = this.setImagesSrc(facesStyle, current, next);

        // each cube style
        this.cubes.forEach(function (cube, index) {
          var styles = _this3.settings.isVertical ? {
            top: 0,
            left: 100 / slicesCount * index + '%',
            width: 100 / slicesCount + '%',
            height: '100%',
            zIndex: index < midd ? (index + 1) * 10 : (slicesCount - index) * 10,
            transform: 'translate3d(0, 0, -' + halfHeight + 'px) rotateX(0deg) rotateY(0deg)',
            backgroundPosition: index * -widthRatio + 'px center'
          } : {
            top: 100 / slicesCount * index + '%',
            left: 0,
            width: '100%',
            height: 100 / slicesCount + '%',
            zIndex: index < midd ? (index + 1) * 10 : (slicesCount - index) * 10,
            transform: 'translate3d(0, 0, -' + heightRatio / 2 + 'px) rotateX(0deg) rotateY(0deg)',
            backgroundPosition: ' center ' + index * -heightRatio + 'px'
          };
          css(cube, styles);
          Array.from(cube.querySelectorAll('.cube-face')).forEach(function (face, index) {
            css(face, facesStyle[index]);
          });
        });
      }
    }]);
    return Cube3D;
  }();

  return Cube3D;

})));
