/**
 * Intro.js v0.3.0
 * https://github.com/usablica/intro.js
 * MIT licensed
 *
 * Copyright (C) 2013 usabli.ca - A weekend project by Afshin Mehrabani (@afshinmeh), Burak Emre Kabakc� (@bu7emba)
 */

(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports'], factory);
  } else {
    // Browser globals
    factory(root);
  }
} (this, function (exports) {
  //Default config/variables
  var VERSION = '0.3.0';

  /**
   * IntroJs main class
   *
   * @class IntroJs
   */
  function IntroJs(obj, target) {
    this.data = obj;
    this.target = target || document.body;
    this._options = {
      nextLabel: 'Next &rarr;',
      prevLabel: '&larr; Back',
      skipLabel: 'Skip',
      doneLabel: 'Done',
      tooltipPosition: 'bottom'
    };
  }

  /**
   * Initiate a new introduction/guide from an element in the page
   *
   * @api private
   * @method _introForElement
   * @returns {Boolean} Success or not?
   */
  function _introForElement() {
        introItems = [],
        self = this;
    //if there's no element to intro
    if(this.data.length < 1) {
      return false;
    }
    for (var i = 0, elmsLength = this.data.length; i < elmsLength; i++) {
      introItems.push({
        element: this.data[i].element,
        intro: this.data[i].message,
        step: i,
        position: this.data[i].position || this._options.tooltipPosition,
        load: this.data[i].load
      });
    }

    //Ok, sort all items with given steps
    introItems.sort(function (a, b) {
      return a.step - b.step;
    });

    //set it to the introJs object
    self._introItems = introItems;

    //add overlay layer to the page
    if(_addOverlayLayer.call(self,  this.target)) {
      //then, start the show
      _nextStep.call(self);

      var skipButton =  this.target.querySelector('.introjs-skipbutton'),
          nextStepButton =  this.target.querySelector('.introjs-nextbutton');

      self._onKeyDown = function(e) {
        return;
        if (e.keyCode === 27) {
          //escape key pressed, exit the intro
          _exitIntro.call(self,  this.target);
        } else if(e.keyCode === 37) {
          //left arrow
          _previousStep.call(self);
        } else if (e.keyCode === 39) {
          //right arrow or enter
          _nextStep.call(self);
        }
      };

      if (window.addEventListener) {
        window.addEventListener('keydown', self._onKeyDown, true);
      } else if (document.attachEvent) { //IE
        document.attachEvent('onkeydown', self._onKeyDown);
      }
    }
    return false;
  }

  /**
   * Go to specific step of introduction
   *
   * @api private
   * @method _goToStep
   */
  function _goToStep(step) {
    //because steps starts with zero
    this._currentStep = step - 2;

    if(typeof (this._introItems) !== 'undefined') {
      _nextStep.call(this);
    }
  }

  /**
   * Go to next step on intro
   *
   * @api private
   * @method _nextStep
   */
  function _nextStep() {
    if (typeof (this._currentStep) === 'undefined') {
      this._currentStep = 0;
    } else {
      ++this._currentStep;
    }
   
    if((this._introItems.length) <= this._currentStep) {
      //end of the intro
      //check if any callback is defined
      if (typeof (this._completeEvent) === 'function') {
        this._completeEvent.call(this);
      }
      _exitIntro.call(this, this.data);
      return;
    }
    _showElement.call(this, typeof(this._introItems[this._currentStep].element)==="function" ? this._introItems[this._currentStep].element() : this._introItems[this._currentStep].element);
  }

  /**
   * Go to previous step on intro
   *
   * @api private
   * @method _nextStep
   */
  function _previousStep() {
    if (this._currentStep === 0) {
      return false;
    }

    _showElement.call(this, this._introItems[--this._currentStep].element);
  }

  /**
   * Exit from intro
   *
   * @api private
   * @method _exitIntro
   * @param {Object} targetElement
   */
  function _exitIntro() {
    //remove overlay layer from the page
    var overlayLayer = this.target.querySelector('.introjs-overlay');
    //for fade-out animation
    overlayLayer.style.opacity = 0;
    setTimeout(function () {
      if (overlayLayer.parentNode) {
        overlayLayer.parentNode.removeChild(overlayLayer);
      }
    }, 500);
    //remove all helper layers
    var helperLayer = this.target.querySelector('.introjs-helperLayer');
    if (helperLayer) {
      helperLayer.parentNode.removeChild(helperLayer);
    }
    //remove `introjs-showElement` class from the element
    var showElement = document.querySelector('.introjs-showElement');
    if (showElement) {
      showElement.className = showElement.className.replace(/introjs-[a-zA-Z]+/g, '').replace(/^\s+|\s+$/g, ''); // This is a manual trim.
    }
    //clean listeners
    if (window.removeEventListener) {
      window.removeEventListener('keydown', this._onKeyDown, true);
    } else if (document.detachEvent) { //IE
      document.detachEvent('onkeydown', this._onKeyDown);
    }
    //set the step to zero
    this._currentStep = undefined;
    //check if any callback is defined
    if (this._exitEvent != undefined) {
      this._exitEvent.call(this);
    }
  }

  /**
   * Render tooltip box in the page
   *
   * @api private
   * @method _placeTooltip
   * @param {Object} targetElement
   * @param {Object} tooltipLayer
   * @param {Object} arrowLayer
   */
  function _placeTooltip(targetElement, tooltipLayer, arrowLayer) {
    var tooltipLayerPosition = _getOffset(tooltipLayer);
    //reset the old style
    tooltipLayer.style.top     = null;
    tooltipLayer.style.right   = null;
    tooltipLayer.style.bottom  = null;
    tooltipLayer.style.left    = null;

    //prevent error when `this._currentStep` in undefined
    if(!this._introItems[this._currentStep]) return;

    var currentTooltipPosition = this._introItems[this._currentStep].position;
    switch (currentTooltipPosition) {
      case 'top':
        tooltipLayer.style.left = '15px';
        tooltipLayer.style.top = '-' + (tooltipLayerPosition.height + 10) + 'px';
        arrowLayer.className = 'introjs-arrow bottom';
        break;
      case 'right':
        tooltipLayer.style.right = '-' + (tooltipLayerPosition.width + 10) + 'px';
        arrowLayer.className = 'introjs-arrow left';
        break;
      case 'left':
        tooltipLayer.style.top = '15px';
        tooltipLayer.style.left = '-' + (tooltipLayerPosition.width + 10) + 'px';
        arrowLayer.className = 'introjs-arrow right';
        break;
      case 'bottom':
      // Bottom going to follow the default behavior
      default:
        tooltipLayer.style.bottom = '-' + (tooltipLayerPosition.height + 10) + 'px';
        arrowLayer.className = 'introjs-arrow top';
        break;
    }
  }

  /**
   * Show an element on the page
   *
   * @api private
   * @method _showElement
   * @param {Object} targetElement
   */
  function _showElement(targetElement) {
    
    if (typeof (this._changeEvent) !== 'undefined') {
        this._changeEvent.call(this, targetElement);
    }
    
    var self = this,
        oldHelperLayer = document.querySelector('.introjs-helperLayer'),
        elementPosition = _getOffset(targetElement);

    if(oldHelperLayer != null) {
      var oldHelperNumberLayer = oldHelperLayer.querySelector('.introjs-helperNumberLayer'),
          oldtooltipLayer      = oldHelperLayer.querySelector('.introjs-tooltiptext'),
          oldArrowLayer        = oldHelperLayer.querySelector('.introjs-arrow'),
          oldtooltipContainer  = oldHelperLayer.querySelector('.introjs-tooltip'),
          skipTooltipButton    = oldHelperLayer.querySelector('.introjs-skipbutton'),
          prevTooltipButton    = oldHelperLayer.querySelector('.introjs-prevbutton'),
          nextTooltipButton    = oldHelperLayer.querySelector('.introjs-nextbutton');

      //hide the tooltip
      oldtooltipContainer.style.opacity = 0;

      //set new position to helper layer
      oldHelperLayer.setAttribute('style', 'width: ' + (elementPosition.width + 10)  + 'px; ' +
                                           'height:' + (elementPosition.height + 10) + 'px; ' +
                                           'top:'    + (elementPosition.top - 5)     + 'px;' +
                                           'left: '  + (elementPosition.left - 5)    + 'px;');
      //remove old classes
      var oldShowElement = document.querySelector('.introjs-showElement');
      oldShowElement.className = oldShowElement.className.replace(/introjs-[a-zA-Z]+/g, '').replace(/^\s+|\s+$/g, '');
      //we should wait until the CSS3 transition is competed (it's 0.3 sec) to prevent incorrect `height` and `width` calculation
      if (self._lastShowElementTimer) {
        clearTimeout(self._lastShowElementTimer);
      }
      self._lastShowElementTimer = setTimeout(function() {
        //set current step to the label
        oldHelperNumberLayer.innerHTML =  self._introItems[self._currentStep].step;
        //set current tooltip text
        oldtooltipLayer.innerHTML = self._introItems[self._currentStep].intro;
        //set the tooltip position
        _placeTooltip.call(self, targetElement, oldtooltipContainer, oldArrowLayer);
        //show the tooltip
        oldtooltipContainer.style.opacity = 1;
      }, 350);

    } else {
      var helperLayer = document.createElement('div'),
          helperNumberLayer = document.createElement('span'),
          arrowLayer = document.createElement('div'),
          tooltipLayer = document.createElement('div');

      helperLayer.className = 'introjs-helperLayer';
      helperLayer.setAttribute('style', 'width: ' + (elementPosition.width + 10)  + 'px; ' +
                                        'height:' + (elementPosition.height + 10) + 'px; ' +
                                        'top:'    + (elementPosition.top - 5)     + 'px;' +
                                        'left: '  + (elementPosition.left - 5)    + 'px;');

      //add helper layer to target element
      this.target.appendChild(helperLayer);

      helperNumberLayer.className = 'introjs-helperNumberLayer';
      arrowLayer.className = 'introjs-arrow';
      tooltipLayer.className = 'introjs-tooltip';

      helperNumberLayer.innerHTML = this._introItems[this._currentStep].step+1;
      tooltipLayer.innerHTML = '<div class="introjs-tooltiptext">' +
                               this._introItems[this._currentStep].intro +
                               '</div><div class="introjs-tooltipbuttons"></div>';
      helperLayer.appendChild(helperNumberLayer);
      tooltipLayer.appendChild(arrowLayer);
      helperLayer.appendChild(tooltipLayer);

      //next button
      var nextTooltipButton = document.createElement('a');

      nextTooltipButton.onclick = function() {
        if(self._introItems.length - 1 != self._currentStep) {
          _nextStep.call(self);
        }
      };

      //nextTooltipButton.href = 'javascript:void(0);';
      nextTooltipButton.innerHTML = this._introItems.length-1>this._currentStep ? this._options.nextLabel : this._options.doneLabel;

      //previous button
      var prevTooltipButton = document.createElement('a');

      prevTooltipButton.onclick = function() {
        if(self._currentStep != 0) {
          _previousStep.call(self);
        }
      };

      prevTooltipButton.href = 'javascript:void(0);';
      prevTooltipButton.innerHTML = this._options.prevLabel;

      //skip button
      var skipTooltipButton = document.createElement('a');
      skipTooltipButton.className = 'introjs-button introjs-skipbutton';
      skipTooltipButton.href = 'javascript:void(0);';
      skipTooltipButton.innerHTML = this._options.skipLabel;

      skipTooltipButton.onclick = function() {
        _exitIntro.call(self, self.data);
      };

      var tooltipButtonsLayer = tooltipLayer.querySelector('.introjs-tooltipbuttons');
      tooltipButtonsLayer.appendChild(skipTooltipButton);
      tooltipButtonsLayer.appendChild(prevTooltipButton);
      tooltipButtonsLayer.appendChild(nextTooltipButton);

      //set proper position
      _placeTooltip.call(self, targetElement, tooltipLayer, arrowLayer);
    }

    if (this._currentStep == 0) {
      prevTooltipButton.className = 'introjs-button introjs-prevbutton introjs-disabled';
      nextTooltipButton.className = 'introjs-button introjs-nextbutton';
      skipTooltipButton.innerHTML = this._options.skipLabel;
    } else if (this._introItems.length - 1 == this._currentStep) {
      skipTooltipButton.innerHTML = this._options.doneLabel;
      prevTooltipButton.className = 'introjs-button introjs-prevbutton';
      nextTooltipButton.className = 'introjs-button introjs-nextbutton introjs-disabled';
    } else {
      prevTooltipButton.className = 'introjs-button introjs-prevbutton';
      nextTooltipButton.className = 'introjs-button introjs-nextbutton';
      skipTooltipButton.innerHTML = this._options.skipLabel;
    }

    //add target element position style
    targetElement.className += ' introjs-showElement';

    //Thanks to JavaScript Kit: http://www.javascriptkit.com/dhtmltutors/dhtmlcascade4.shtml
    var currentElementPosition = '';
    if (targetElement.currentStyle) { //IE
      currentElementPosition = targetElement.currentStyle['position'];
    } else if (document.defaultView && document.defaultView.getComputedStyle) { //Firefox
      currentElementPosition = document.defaultView.getComputedStyle(targetElement, null).getPropertyValue('position');
    }

    //I don't know is this necessary or not, but I clear the position for better comparing
    currentElementPosition = currentElementPosition.toLowerCase();
    if (currentElementPosition !== 'absolute' &&
        currentElementPosition !== 'relative') {
      //change to new intro item
      targetElement.className += ' introjs-relativePosition';
    }

    if (!_elementInViewport(targetElement)) {
      var rect = targetElement.getBoundingClientRect(),
          top = rect.bottom - (rect.bottom - rect.top),
          bottom = rect.bottom - _getWinSize().height;

      // Scroll up
      if (top < 0) {
        window.scrollBy(0, top - 30); // 30px padding from edge to look nice

      // Scroll down
      } else {
        window.scrollBy(0, bottom + 100); // 70px + 30px padding from edge to look nice
      }
    }
    if(this._introItems[this._currentStep].load) this._introItems[this._currentStep].load(self);
  }

  /**
   * Provides a cross-browser way to get the screen dimensions
   * via: http://stackoverflow.com/questions/5864467/internet-explorer-innerheight
   *
   * @api private
   * @method _getWinSize
   * @returns {Object} width and height attributes
   */
  function _getWinSize() {
    if (window.innerWidth != undefined) {
      return { width: window.innerWidth, height: window.innerHeight };
    } else {
      var D = document.documentElement;
      return { width: D.clientWidth, height: D.clientHeight };
    }
  }

  /**
   * Add overlay layer to the page
   * http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
   *
   * @api private
   * @method _elementInViewport
   * @param {Object} el
   */
  function _elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      (rect.bottom+80) <= window.innerHeight && // add 80 to get the text right
      rect.right <= window.innerWidth 
    );
  }

  /**
   * Add overlay layer to the page
   *
   * @api private
   * @method _addOverlayLayer
   * @param {Object} targetElm
   */
  function _addOverlayLayer(targetElm) {
    var overlayLayer = document.createElement('div'),
        styleText = '',
        self = this;

    //set css class name
    overlayLayer.className = 'introjs-overlay';

    //check if the target element is body, we should calculate the size of overlay layer in a better way
    if (targetElm.tagName.toLowerCase() === 'body') {
      styleText += 'top: 0;bottom: 0; left: 0;right: 0;position: fixed;';
      overlayLayer.setAttribute('style', styleText);
    } else {
      //set overlay layer position
      var elementPosition = _getOffset(targetElm);
      if(elementPosition) {
        styleText += 'width: ' + elementPosition.width + 'px; height:' + elementPosition.height + 'px; top:' + elementPosition.top + 'px;left: ' + elementPosition.left + 'px;';
        overlayLayer.setAttribute('style', styleText);
      }
    }

    targetElm.appendChild(overlayLayer);

    overlayLayer.onclick = function() {
      _exitIntro.call(self, targetElm);
    };

    setTimeout(function() {
      styleText += 'opacity: .5;';
      overlayLayer.setAttribute('style', styleText);
    }, 10);
    return true;
  }

  /**
   * Get an element position on the page
   * Thanks to `meouw`: http://stackoverflow.com/a/442474/375966
   *
   * @api private
   * @method _getOffset
   * @param {Object} element
   * @returns Element's position info
   */
  function _getOffset(element) {
    if(!element)
        return console.log("the element you provided is not exist in dom");
    var elementPosition = {};

    //set width
    elementPosition.width = element.offsetWidth;

    //set height
    elementPosition.height = element.offsetHeight;

    //calculate element top and left
    var _x = 0;
    var _y = 0;
    while(element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
      _x += element.offsetLeft;
      _y += element.offsetTop;
      element = element.offsetParent;
    }
    //set top
    elementPosition.top = _y;
    //set left
    elementPosition.left = _x;

    return elementPosition;
  }

  /**
   * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
   * via: http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
   *
   * @param obj1
   * @param obj2
   * @returns obj3 a new object based on obj1 and obj2
   */
  function _mergeOptions(obj1,obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  var introJs = function (data) {
      return new IntroJs(data);
  };

  /**
   * Current IntroJs version
   *
   * @property version
   * @type String
   */
  introJs.version = VERSION;

  //Prototype
  introJs.fn = IntroJs.prototype = {
    clone: function () {
      return new IntroJs(this);
    },
    setOption: function(option, value) {
      this._options[option] = value;
      return this;
    },
    setOptions: function(options) {
      this._options = _mergeOptions(this._options, options);
      return this;
    },
    start: function () {
      _introForElement.call(this);
      return this;
    },
    goToStep: function(step) {
      _goToStep.call(this, step);
      return this;
    },
    exit: function() {
      _exitIntro.call(this, this.data);
    },
    on: function(event, callback) {
         if (typeof (callback) === 'function') {
          if(event=='change') {
            this._changeEvent = callback;
          }else
          if(event=='exit') {
            this._exitEvent = callback;
          }else
          if(event=='complete') {
            this._completeEvent = callback;
          }
         }else
            throw new Error('Provided callback is not a function.');
    }
  };

  exports.introJs = introJs;
  return introJs;
}));
