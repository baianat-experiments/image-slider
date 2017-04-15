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
function sync(callback) {
  setTimeout(function () { return callback(); }, 1000 / 60);
}





function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Cube3D = function Cube3D(slider, settings) {
  this.slider = slider;
  this.settings = settings;
};

Cube3D.prototype.init = function init () {
    var this$1 = this;

  this.fragment = document.createDocumentFragment();
  var cubeContainer = document.createElement('div');
  cubeContainer.classList.add('animation-3d');
  cubeContainer.insertAdjacentHTML('afterbegin',
   ("<div class=\"cube\">\n       " + ('<div class="cube-face"></div>'.repeat(6)) + "\n     </div>").repeat(this.settings.slicesCount)
  );
  this.fragment.appendChild(cubeContainer);
  this.slider.el.appendChild(this.fragment);
  this.initMode(this.settings.mode3D);
  this.slider.slides.forEach(function (slide) {
    slide.style.backgroundPosition = this$1.settings.isVertical ? 'left center' : 'center top';
  });
};

Cube3D.prototype.initMode = function initMode (mode) {
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
};

Cube3D.prototype.updateSlide = function updateSlide (slideNumber) {
    var this$1 = this;

  // give cubes style
  var cubes = this.styleCubes(
      this.slider.imagesSrc[this.slider.slides.indexOf(this.slider.activeSlide)],
    this.slider.imagesSrc[slideNumber]
  );

    // start animation
  var animation = this.slider.el.querySelector('.animation-3d');
  animation.style.display = 'block';
  this.slider.el.style.overflow= 'visible';
  this.slider.activeSlide.classList.remove('is-active');
  this.slider.activeSlide.style.display = 'none';
  sync(function () {
    cubes.forEach(function (cube, index) {
      setTimeout(function () {
        cube.style.transform = this$1.getCubesModeTransform();
      }, (index + 1) * 100);
    });
  });

  // reset animation
  setTimeout(function () {
    animation.style.display = 'none';
    this$1.slider.el.style.overflow = 'hidden';
    this$1.slider.slides[slideNumber].style.display = 'block';
    this$1.slider.slides[slideNumber].classList.add('is-active');
    this$1.slider.activeSlide = this$1.slider.slides[slideNumber];
    this$1.slider.updating = false;
  },(this.settings.slicesCount * 100) + 600);
};

Cube3D.prototype.getCubesModeTransform = function getCubesModeTransform () {
  var zIndex = this.settings.isVertical ?
    this.slider.sliderHeight / 2 : (this.slider.sliderHeight / this.settings.slicesCount) / 2;
  var rotateAxis = this.settings.rotateAxis.toUpperCase() === 'Y' ? 'Y' : 'X';
  switch (this.settings.rotateDegree) {
  case 90:
    return ("translate3d(0, 0, -" + zIndex + "px) rotate" + rotateAxis + "(-90deg)");
  case 180:
    return ("translate3d(0, 0, -" + zIndex + "px) rotate" + rotateAxis + "(180deg)");
  default:
    return ("translate3d(0, 0, -" + zIndex + "px) rotateX(-90deg)");
  }
};

Cube3D.prototype.setImagesSrc = function setImagesSrc (facesStyle, current, next) {
  switch (this.settings.rotateDegree) {
  case 90:
    facesStyle[0].backgroundImage = "url(" + current + ")";
    facesStyle[1].backgroundImage = "url(" + next + ")";
    break;
  case 180:
    facesStyle[0].backgroundImage = "url(" + current + ")";
    facesStyle[2].backgroundImage = "url(" + next + ")";
    break;
  default:
    facesStyle[0].backgroundImage = "url(" + current + ")";
    facesStyle[1].backgroundImage = "url(" + next + ")";
    break;
  }
  return facesStyle;
};

Cube3D.prototype.styleCubes = function styleCubes (current, next) {
    var this$1 = this;

  var midd       = Math.ceil(this.settings.slicesCount / 2 );
  var cubes      = Array.from(this.slider.el.querySelectorAll('.cube'));
  var height     = this.slider.sliderHeight;
  var width      = this.slider.sliderWidth;
  var slicesCount= this.settings.slicesCount;
  var halfHeight = this.slider.sliderHeight / 2;
  var widthRatio = this.slider.sliderWidth / this.settings.slicesCount;
  var heightRatio= this.slider.sliderHeight / this.settings.slicesCount;

  // get the image height after it resized to the slider width
  var currentImage = new Image();
  var nextImage  = new Image();
  currentImage.src = current;
  nextImage.src = next;
  var currentImageHeight = (this.slider.sliderWidth / currentImage.width) * currentImage.height;
  var nextImageHeight = (this.slider.sliderWidth / nextImage.width) * nextImage.height;

  // cube faces styling
  var facesStyle = this.settings.isVertical ? [
    {
      transform: ("translate3d(0, 0, " + halfHeight + "px) rotateY(0)"),
      backgroundSize: currentImageHeight > this.slider.sliderHeight ? ((100 * slicesCount) + "% auto") : 'auto 100%',
    }, {
      transform: 'translate3d(0, -50%, 0) rotateX(90deg)',
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? ((100 * slicesCount) + "% auto") : 'auto 100%',
    }, {
      transform: this.settings.rotateAxis === 'Y' ? ("translate3d(0, 0, -" + halfHeight + "px) scaleX(-1)") : ("translate3d(0, 0, -" + halfHeight + "px) rotateX(180deg)"),
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? ((100 * slicesCount) + "% auto") : 'auto 100%',
    }, {
      transform: 'translate3d(0, 50%, 0) rotateX(90deg)',
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? ((100 * slicesCount) + "% auto") : 'auto 100%',
    }, {
      width: (height + "px"),
      transform: 'translate3d(-50%, 0, 0) rotateY(90deg)'
    }, {
      width: (height + "px"),
      transform: ("translate3d(calc(" + widthRatio + "px - 50%), 0, 0) rotateY(90deg)")
    }
  ] : [
    {
      transform: ("translate3d(0, 0, " + (heightRatio / 2) + "px) rotateY(0)"),
      backgroundSize: currentImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%"),
    }, {
      transform: 'translate3d(0, -50%, 0) rotateX(90deg)',
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%")
    }, {
      transform: this.settings.rotateAxis === 'Y' ? ("translate3d(0, 0, -" + (heightRatio / 2) + "px) scaleX(-1)") : ("translate3d(0, 0, -" + (heightRatio / 2) + "px) rotateX(180deg)"),
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%")
    }, {
      transform: 'translate3d(0, 50%, 0) rotateX(90deg)',
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%")
    }, {
      width: (heightRatio + "px"),
      transform: 'translate3d(-50%, 0, 0) rotateY(90deg)',
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%")
    }, {
      width: (heightRatio + "px"),
      transform: ("translate3d(calc(" + width + "px - 50%), 0, 0) rotateY(90deg)"),
      backgroundSize: nextImageHeight > this.slider.sliderHeight ? '100% auto' : ("auto " + (100 * slicesCount) + "%")
    }
  ];

  facesStyle = this.setImagesSrc(facesStyle, current, next);

  // each cube style
  cubes.forEach(function (cube, index) {
    var styles = this$1.settings.isVertical ? {
      top: 0,
      left: (((100 / slicesCount) * index) + "%"),
      width: ((100 / slicesCount) + "%"),
      height: '100%',
      zIndex: (index < midd) ? (index + 1) * 10 : (slicesCount - index) * 10,
        transform: ("translate3d(0, 0, -" + halfHeight + "px) rotateX(0deg) rotateY(0deg)"),
      backgroundPosition: ((index * -widthRatio) + "px center")
    } : {
      top: (((100 / slicesCount) * index) + "%"),
      left: 0,
      width: '100%',
      height: ((100 / slicesCount) + "%"),
      zIndex: (index < midd) ? (index + 1) * 10 : (slicesCount - index) * 10,
      transform: ("translate3d(0, 0, -" + (heightRatio / 2) + "px) rotateX(0deg) rotateY(0deg)"),
      backgroundPosition: (" center " + (index * - heightRatio) + "px")
    };
    css(cube, styles);
    Array.from(cube.querySelectorAll('.cube-face')).forEach(function (face, index) {
      css(face, facesStyle[index]);
    });
  });
  return cubes;
};

return Cube3D;

})));
