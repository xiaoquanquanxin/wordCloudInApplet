(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if (typeof define === 'function' && define.amd)
        define([], factory);
    else if (typeof exports === 'object')
        exports["B2wordcloud"] = factory();
    else
        root["B2wordcloud"] = factory();
})(this, function () {
    return /******/ (function (modules) { // webpackBootstrap
        /******/ 	// The module cache
        /******/
        var installedModules = {};
        /******/
        /******/ 	// The require function
        /******/
        function __webpack_require__(moduleId) {
            /******/
            /******/ 		// Check if module is in cache
            /******/
            if (installedModules[moduleId])
            /******/            return installedModules[moduleId].exports;
            /******/
            /******/ 		// Create a new module (and put it into the cache)
            /******/
            var module = installedModules[moduleId] = {
                /******/            exports: {},
                /******/            id: moduleId,
                /******/            loaded: false
                /******/
            };
            /******/
            /******/ 		// Execute the module function
            /******/
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ 		// Flag the module as loaded
            /******/
            module.loaded = true;
            /******/
            /******/ 		// Return the exports of the module
            /******/
            return module.exports;
            /******/
        }

        /******/
        /******/
        /******/ 	// expose the modules object (__webpack_modules__)
        /******/
        __webpack_require__.m = modules;
        /******/
        /******/ 	// expose the module cache
        /******/
        __webpack_require__.c = installedModules;
        /******/
        /******/ 	// __webpack_public_path__
        /******/
        __webpack_require__.p = "";
        /******/
        /******/ 	// Load entry module and return exports
        /******/
        return __webpack_require__(0);
        /******/
    })
    /************************************************************************/
    /******/([
        /* 0 */
        /***/ (function (module, exports, __webpack_require__) {

            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _createClass = function () {
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

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }

            var WordCloud = __webpack_require__(1);

            function deepMerge(obj1, obj2) {
                var key;
                for (key in obj2) {
                    obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ? deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key];
                }
                return obj1;
            }

            //  ✅，计算边缘
            function updateCanvasMask(shapeCanvas, maskCanvas) {
                var bgPixel = [255, 255, 255, 255,]
                console.log('bgPixel', bgPixel);
                var maskCanvasScaled = document.createElement('canvas');
                maskCanvasScaled.width = maskCanvas.width;
                maskCanvasScaled.height = maskCanvas.height;
                var ctx = maskCanvasScaled.getContext('2d');

                ctx.drawImage(shapeCanvas, 0, 0, shapeCanvas.width, shapeCanvas.height, 0, 0, maskCanvasScaled.width, maskCanvasScaled.height);
                console.log('shapeCanvas是图形一样大的canvas', shapeCanvas)
                console.log('maskCanvas是用户期望的大小', maskCanvas)
                console.log('这里是把图形拉伸或压缩到和用户期望的大小一样')
                console.log(maskCanvas);

                //  创建一个新的、空的
                var imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
                var newImageData = ctx.createImageData(imageData);
                for (var i = 0; i < imageData.data.length; i += 4) {
                    //  不透明度
                    newImageData.data[i + 3] = 255;
                    if (imageData.data[i + 3] > 128) {
                        //  最后就是取这个白色的部分
                        newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 255;
                    } else {
                        //  而黑色的部分就不取了
                        newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 0;
                    }
                }
                ctx.putImageData(newImageData, 0, 0);
                ctx = maskCanvas.getContext('2d');
                ctx.drawImage(maskCanvasScaled, 0, 0);
                console.log('这里就是取个反', maskCanvasScaled)
                document.body.appendChild(maskCanvasScaled)
                return
                maskCanvasScaled = ctx = imageData = newImageData = bctx = bgPixel = undefined;


            }

            var B2wordcloud = exports.B2wordcloud = function () {
                function B2wordcloud(element, options) {
                    _classCallCheck(this, B2wordcloud);

                    this._wrapper = element;
                    this._wrapper.style.position = 'relative';
                    this._container = null;
                    this._tooltip = null;
                    this._options = deepMerge({
                        renderer: 'canvas',
                        tooltip: {
                            show: true,
                            formatter: null
                        },
                        clearCanvas: !options.maskImage
                    }, options);
                    this._wordcloud2 = null;
                    this._maskCanvas = null;
                    this._shapeCanvas = null;
                    this._tempCanvas = null;
                    this._maskImg = null;
                    this._init();
                }

                _createClass(B2wordcloud, [{
                    key: '_init',
                    value: function _init() {
                        this._initContainer();
                        this._setOptions();
                    }
                }, {
                    key: '_initContainer',
                    value: function _initContainer() {
                        this._maskCanvas = document.createElement('canvas');
                        this._setCanvasSize(this._maskCanvas);
                        if (this._options.renderer === 'div') {
                            this._container = document.createElement('div');
                            this._container.style.width = '100%';
                            this._container.style.height = '100%';
                            this._createTempCanvas();
                        } else if (this._options.renderer === 'canvas') {
                            this._container = document.createElement('canvas');
                            this._setCanvasSize();
                        }
                        this._wrapper.appendChild(this._container);
                    }
                }, {
                    key: '_createTempCanvas',
                    value: function _createTempCanvas() {
                        this._tempCanvas = document.createElement('canvas');
                        this._setCanvasSize(this._tempCanvas);
                    }
                }, {
                    key: '_setCanvasSize',
                    //  ✅设置为用户控制的大小
                    value: function _setCanvasSize() {
                        var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._container;

                        var width = this._wrapper.clientWidth;
                        var height = this._wrapper.clientHeight;
                        target.width = width;
                        target.height = height;
                        target.style.width = width + 'px';
                        target.style.height = height + 'px';
                    }
                }, {
                    key: '_setOptions',
                    value: function _setOptions() {
                        this._fixWeightFactor(this._options);
                        this._maskImage();
                    }
                }, {
                    key: '_maskImage',
                    //  ✅计算折罩
                    value: function _maskImage() {
                        var _this2 = this;

                        var img = window.document.createElement('img');
                        img.crossOrigin = "Anonymous";
                        img.src = this._options.maskImage;
                        img.onload = function () {
                            _this2._maskImg = img;
                            _this2._shapeCanvas = document.createElement('canvas');
                            _this2._shapeCanvas.width = img.width;
                            _this2._shapeCanvas.height = img.height;
                            const ctx = _this2._shapeCanvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, img.width, img.height);
                            var imageData = ctx.getImageData(0, 0, _this2._shapeCanvas.width, _this2._shapeCanvas.height);
                            var newImageData = ctx.createImageData(imageData);
                            for (var i = 0; i < imageData.data.length; i += 4) {
                                var tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
                                var alpha = imageData.data[i + 3];

                                if (alpha < 128 || tone > 128 * 3) {
                                    // Area not to draw
                                    newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 255;
                                    newImageData.data[i + 3] = 0;
                                } else {
                                    // Area to draw
                                    newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 0;
                                    newImageData.data[i + 3] = 255;
                                }
                            }

                            ctx.putImageData(newImageData, 0, 0);
                            _this2._render();
                        };
                    }
                }, {
                    key: '_render',
                    value: function _render() {
                        const isResize = false;
                        updateCanvasMask(this._shapeCanvas, this._maskCanvas);
                        debugger
                        this._wordcloud2 = new WordCloud(
                            this._container,
                            this._options, this._maskCanvas, false);
                    }
                }, {
                    key: '_fixWeightFactor',
                    value: function _fixWeightFactor(option) {
                        option.maxFontSize = 24
                        option.minFontSize = 2;
                        if (option.list && option.list.length > 0) {
                            var min = Number(option.list[0][1]);
                            var max = 0;
                            for (var i = 0, len = option.list.length; i < len; i++) {
                                var item = Number(option.list[i][1]);
                                if (min > item) {
                                    min = item;
                                }
                                if (max < item) {
                                    max = item;
                                }
                            }
                            console.log('min', min)
                            console.log('max', max)
                            //  映射最大最小值大关系
                            if (max > min) {
                                //  ❤️❤️❤️❤️❤️❤️
                                option.weightFactor = function (val) {
                                    var subDomain = max - min;
                                    var subRange = option.maxFontSize - option.minFontSize;
                                    if (subDomain === 0) {
                                        return subRange === 0 ? option.minFontSize : (option.minFontSize + option.maxFontSize) / 2;
                                    }
                                    if (val === min) {
                                        return option.minFontSize;
                                    }

                                    if (val === max) {
                                        return option.maxFontSize;
                                    }
                                    return (val - min) / subDomain * subRange + option.minFontSize;
                                };
                            } else {
                                option.weightFactor = function (size) {
                                    return option.minFontSize;
                                };
                            }
                        }
                    }
                }, {
                    key: 'dispatchAction',
                    value: function dispatchAction(params) {
                        switch (params.type) {
                            case 'highlight':
                                this._wordcloud2.highlight(params.dataIndex, params.keepAlive);
                                break;
                            case 'downplay':
                                this._wordcloud2.downplay(params.dataIndex, params.keepAlive);
                                break;
                        }
                    }
                }]);

                return B2wordcloud;
            }();

            module.exports = B2wordcloud;

            /***/
        }),
        /* 1 */
        /***/ (function (module, exports, __webpack_require__) {

            var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
            'use strict';

            function _defineProperty(obj, key, value) {
                if (key in obj) {
                    Object.defineProperty(obj, key, {
                        value: value,
                        enumerable: true,
                        configurable: true,
                        writable: true
                    });
                } else {
                    obj[key] = value;
                }
                return obj;
            }

            /*** IMPORTS FROM imports-loader ***/
            (function () {

                /*!
                 * wordcloud2.js
                 * http://timdream.org/wordcloud2.js/
                 *
                 * Copyright 2011 - 2013 Tim Chien
                 * Released under the MIT license
                 */

                'use strict';

                // setImmediate

                if (!window.setImmediate) {
                    window.setImmediate = function setupSetImmediate() {
                        return window.msSetImmediate || window.webkitSetImmediate || window.mozSetImmediate || window.oSetImmediate || function setupSetZeroTimeout() {
                                if (!window.postMessage || !window.addEventListener) {
                                    return null;
                                }

                                var callbacks = [undefined];
                                var message = 'zero-timeout-message';

                                // Like setTimeout, but only takes a function argument.  There's
                                // no time argument (always zero) and no arguments (you have to
                                // use a closure).
                                var setZeroTimeout = function setZeroTimeout(callback) {
                                    var id = callbacks.length;
                                    callbacks.push(callback);
                                    window.postMessage(message + id.toString(36), '*');

                                    return id;
                                };

                                window.addEventListener('message', function setZeroTimeoutMessage(evt) {
                                    // Skipping checking event source, retarded IE confused this window
                                    // object with another in the presence of iframe
                                    if (typeof evt.data !== 'string' || evt.data.substr(0, message.length) !== message /* ||
	                                                                                             evt.source !== window */) {
                                        return;
                                    }

                                    evt.stopImmediatePropagation();

                                    var id = parseInt(evt.data.substr(message.length), 36);
                                    if (!callbacks[id]) {
                                        return;
                                    }

                                    callbacks[id]();
                                    callbacks[id] = undefined;
                                }, true);

                                /* specify clearImmediate() here since we need the scope */
                                window.clearImmediate = function clearZeroTimeout(id) {
                                    if (!callbacks[id]) {
                                        return;
                                    }

                                    callbacks[id] = undefined;
                                };

                                return setZeroTimeout;
                            }() ||
                            // fallback
                            function setImmediateFallback(fn) {
                                window.setTimeout(fn, 0);
                            };
                    }();
                }

                if (!window.clearImmediate) {
                    window.clearImmediate = function setupClearImmediate() {
                        return window.msClearImmediate || window.webkitClearImmediate || window.mozClearImmediate || window.oClearImmediate ||
                            // "clearZeroTimeout" is implement on the previous block ||
                            // fallback
                            function clearImmediateFallback(timer) {
                                window.clearTimeout(timer);
                            };
                    }();
                }

                (function (global) {

                    // Check if WordCloud can run on this browser
                    var isSupported = function isSupported() {
                        var canvas = document.createElement('canvas');
                        if (!canvas || !canvas.getContext) {
                            return false;
                        }

                        var ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return false;
                        }
                        if (!ctx.getImageData) {
                            return false;
                        }
                        if (!ctx.fillText) {
                            return false;
                        }

                        if (!Array.prototype.some) {
                            return false;
                        }
                        if (!Array.prototype.push) {
                            return false;
                        }

                        return true;
                    }();

                    // Find out if the browser impose minium font size by
                    // drawing small texts on a canvas and measure it's width.
                    var minFontSize = function getMinFontSize() {
                        if (!isSupported) {
                            return;
                        }

                        var ctx = document.createElement('canvas').getContext('2d');

                        // start from 20
                        var size = 20;

                        // two sizes to measure
                        var hanWidth, mWidth;

                        while (size) {
                            ctx.font = size.toString(10) + 'px sans-serif';
                            if (ctx.measureText('\uFF37').width === hanWidth && ctx.measureText('m').width === mWidth) {
                                return size + 1;
                            }

                            hanWidth = ctx.measureText('\uFF37').width;
                            mWidth = ctx.measureText('m').width;

                            size--;
                        }

                        return 0;
                    }();

                    // Based on http://jsfromhell.com/array/shuffle
                    var shuffleArray = function shuffleArray(arr) {
                        for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x) {
                        }
                        return arr;
                    };

                    var WordCloud = function WordCloud(elements, options, maskCanvas) {
                        if (!Array.isArray(elements)) {
                            elements = [elements];
                        }
                        // 获取像素比
                        const getPixelRatio = function getPixelRatio(context) {
                            var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                            return (window.devicePixelRatio || 1) / backingStore;
                        };
                        var canvasEl = null;
                        var ratio = 1;
                        elements.forEach(function (el, i) {
                            if (el.getContext && el.getContext('2d')) {
                                canvasEl = el;
                                ratio = getPixelRatio(el.getContext('2d'));
                            }
                            if (typeof el === 'string') {
                                elements[i] = document.getElementById(el);
                                if (!elements[i]) {
                                    throw 'The element id specified is not found.';
                                }
                            } else if (!el.tagName && !el.appendChild) {
                                throw 'You must pass valid HTML elements, or ID of the element.';
                            }
                        });

                        /* Default values to be overwritten by options object */
                        var settings = {
                            list: [],
                            fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' + '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
                            fontWeight: 'normal',
                            color: 'random-dark',
                            minSize: 0, // 0 to disable
                            weightFactor: 1,
                            clearCanvas: true,
                            backgroundColor: '#fff', // opaque white = rgba(255, 255, 255, 1)

                            gridSize: 4,
                            drawOutOfBound: false,
                            origin: null,

                            drawMask: false,
                            maskColor: 'rgba(255,0,0,0.3)',
                            maskGapWidth: 0.3,

                            wait: 0,
                            abortThreshold: 0, // disabled
                            abort: function noop() {
                            },

                            minRotation: -Math.PI / 2,
                            maxRotation: Math.PI / 2,
                            rotationSteps: 0,

                            shuffle: true,
                            rotateRatio: 0.1,

                            shape: 'circle',
                            ellipticity: 0.65,

                            classes: null,

                            hover: null,
                            click: null,
                            cursorWhenHover: 'pointer',
                            mouseout: null
                        };
                        var _this = this;
                        _this.words = [];
                        _this.elements = elements;

                        //  更新参数 属性
                        if (options) {
                            for (var key in options) {
                                if (key in settings) {
                                    settings[key] = options[key];
                                }
                            }
                        }


                        /* Convert weightFactor into a function */
                        if (typeof settings.weightFactor !== 'function') {
                            var factor = settings.weightFactor;
                            settings.weightFactor = function weightFactor(pt) {
                                return pt * factor; //in px
                            };
                        }


                        /* Convert shape into a function */
                        if (typeof settings.shape !== 'function') {
                            switch (settings.shape) {
                                case 'circle':
                                /* falls through */
                                default:
                                    // 'circle' is the default and a shortcut in the code loop.
                                    settings.shape = 'circle';
                                    break;

                                case 'cardioid':
                                    settings.shape = function shapeCardioid(theta) {
                                        return 1 - Math.sin(theta);
                                    };
                                    break;

                                /*
                                 To work out an X-gon, one has to calculate "m",
                                where 1/(cos(2*PI/X)+m*sin(2*PI/X)) = 1/(cos(0)+m*sin(0))
                                http://www.wolframalpha.com/input/?i=1%2F%28cos%282*PI%2FX%29%2Bm*sin%28
                                2*PI%2FX%29%29+%3D+1%2F%28cos%280%29%2Bm*sin%280%29%29
                                 Copy the solution into polar equation r = 1/(cos(t') + m*sin(t'))
                                where t' equals to mod(t, 2PI/X);
                                 */

                                case 'diamond':
                                    // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
                                    // %28t%2C+PI%2F2%29%29%2Bsin%28mod+%28t%2C+PI%2F2%29%29%29%2C+t+%3D
                                    // +0+..+2*PI
                                    settings.shape = function shapeSquare(theta) {
                                        var thetaPrime = theta % (2 * Math.PI / 4);
                                        return 1 / (Math.cos(thetaPrime) + Math.sin(thetaPrime));
                                    };
                                    break;

                                case 'square':
                                    // http://www.wolframalpha.com/input/?i=plot+r+%3D+min(1%2Fabs(cos(t
                                    // )),1%2Fabs(sin(t)))),+t+%3D+0+..+2*PI
                                    settings.shape = function shapeSquare(theta) {
                                        return Math.min(1 / Math.abs(Math.cos(theta)), 1 / Math.abs(Math.sin(theta)));
                                    };
                                    break;

                                case 'triangle-forward':
                                    // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
                                    // %28t%2C+2*PI%2F3%29%29%2Bsqrt%283%29sin%28mod+%28t%2C+2*PI%2F3%29
                                    // %29%29%2C+t+%3D+0+..+2*PI
                                    settings.shape = function shapeTriangle(theta) {
                                        var thetaPrime = theta % (2 * Math.PI / 3);
                                        return 1 / (Math.cos(thetaPrime) + Math.sqrt(3) * Math.sin(thetaPrime));
                                    };
                                    break;

                                case 'triangle':
                                case 'triangle-upright':
                                    settings.shape = function shapeTriangle(theta) {
                                        var thetaPrime = (theta + Math.PI * 3 / 2) % (2 * Math.PI / 3);
                                        return 1 / (Math.cos(thetaPrime) + Math.sqrt(3) * Math.sin(thetaPrime));
                                    };
                                    break;

                                case 'pentagon':
                                    settings.shape = function shapePentagon(theta) {
                                        var thetaPrime = (theta + 0.955) % (2 * Math.PI / 5);
                                        return 1 / (Math.cos(thetaPrime) + 0.726543 * Math.sin(thetaPrime));
                                    };
                                    break;

                                case 'star':
                                    settings.shape = function shapeStar(theta) {
                                        var thetaPrime = (theta + 0.955) % (2 * Math.PI / 10);
                                        if ((theta + 0.955) % (2 * Math.PI / 5) - 2 * Math.PI / 10 >= 0) {
                                            return 1 / (Math.cos(2 * Math.PI / 10 - thetaPrime) + 3.07768 * Math.sin(2 * Math.PI / 10 - thetaPrime));
                                        } else {
                                            return 1 / (Math.cos(thetaPrime) + 3.07768 * Math.sin(thetaPrime));
                                        }
                                    };
                                    break;
                            }
                        }

                        //  栅格，栅格间距
                        settings.gridSize = Math.max(Math.floor(settings.gridSize), 4);


                        /* shorthand */
                        var g = settings.gridSize;
                        var maskRectWidth = g - settings.maskGapWidth;

                        /* normalize rotation settings */
                        var rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
                        var rotationSteps = Math.abs(Math.floor(settings.rotationSteps));
                        var minRotation = Math.min(settings.maxRotation, settings.minRotation);

                        /* 所有函数可用的信息/对象，在start()时设置 */
                        var grid, // 包含填充信息的2d数组
                            ngx, ngy, // 网格的宽度和高度
                            center, // 云中心的位置
                            maxRadius;

                        /* 用于测量每个putWord()操作的时间戳 */
                        var escapeTime;

                        /* 函数获取文本的颜色 */
                        var getTextColor;


                        /* function for getting the font-weight of the text */
                        var getTextFontWeight;


                        /* function for getting the classes of the text */
                        var getTextClasses = null;


                        /* Interactive */
                        var interactive = false;
                        var infoGrid = [];
                        var hovered;

                        var getInfoGridFromMouseTouchEvent = function getInfoGridFromMouseTouchEvent(evt) {
                            debugger
                            var canvas = evt.currentTarget;
                            var rect = canvas.getBoundingClientRect();
                            var clientX;
                            var clientY;
                            /** Detect if touches are available */
                            if (evt.touches) {
                                clientX = evt.touches[0].clientX;
                                clientY = evt.touches[0].clientY;
                            } else {
                                clientX = evt.clientX;
                                clientY = evt.clientY;
                            }
                            var eventX = clientX - rect.left;
                            var eventY = clientY - rect.top;

                            var x = Math.floor(eventX * (canvas.width / rect.width / ratio || 1) / g);
                            var y = Math.floor(eventY * (canvas.height / rect.height / ratio || 1) / g);

                            return infoGrid[x][y];
                        };
                        var wordcloudout = function wordcloudout() {
                            settings.mouseout();
                        };
                        var wordcloudhover = function wordcloudhover(evt) {
                            var info = getInfoGridFromMouseTouchEvent(evt);
                            if (hovered === info) {
                                return;
                            }
                            hovered = info;
                            if (!info) {
                                settings.hover(undefined, undefined, evt);
                                evt.target.style.cursor = 'default';
                                return;
                            } else if (settings.cursorWhenHover === 'pointer') {
                                evt.target.style.cursor = 'pointer';
                            }
                            settings.hover(info.item, info.dimension, evt);
                        };

                        var wordcloudclick = function wordcloudclick(evt) {
                            var info = getInfoGridFromMouseTouchEvent(evt);
                            if (!info) {
                                return;
                            }
                            settings.click(info.item, info.dimension, evt, info.index);
                            evt.preventDefault();
                        };

                        //  ⚠️⚠️⚠️⚠️🏁🏁🏁
                        /* 在网格上取距离中心半径一定的点 */
                        var pointsAtRadius = [];
                        var getPointsAtRadius = function getPointsAtRadius(radius) {
                            debugger
                            if (pointsAtRadius[radius]) {
                                return pointsAtRadius[radius];
                            }

                            // Look for these number of points on each radius
                            var T = radius * 8;

                            // Getting all the points at this radius
                            var t = T;
                            var points = [];

                            if (radius === 0) {
                                points.push([center[0], center[1], 0]);
                            }

                            while (t--) {
                                // distort the radius to put the cloud in shape
                                var rx = 1;
                                if (settings.shape !== 'circle') {
                                    rx = settings.shape(t / T * 2 * Math.PI); // 0 to 1
                                }

                                // Push [x, y, t]; t is used solely for getTextColor()
                                points.push([center[0] + radius * rx * Math.cos(-t / T * 2 * Math.PI), center[1] + radius * rx * Math.sin(-t / T * 2 * Math.PI) * settings.ellipticity, t / T * 2 * Math.PI]);
                            }

                            pointsAtRadius[radius] = points;
                            return points;
                        };

                        /* 如果我们花了太多的时间，返回true */
                        var exceedTime = function exceedTime() {
                            //  console.log('如果我们花了太多的时间，返回true');
                            return settings.abortThreshold > 0 && new Date().getTime() - escapeTime > settings.abortThreshold;
                        };

                        /* ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️根据设定得到旋转的程度，和运气. */
                        var getRotateDeg = function getRotateDeg() {
                            // console.log(settings.rotateRatio)
                            if (settings.rotateRatio === 0) {
                                return 0;
                            }

                            if (Math.random() > settings.rotateRatio) {
                                return 0;
                            }

                            if (rotationRange === 0) {
                                return minRotation;
                            }

                            if (rotationSteps > 0) {
                                // Min rotation + zero or more steps * span of one step
                                return minRotation + Math.floor(Math.random() * rotationSteps) * rotationRange / (rotationSteps - 1);
                            } else {
                                return minRotation + Math.random() * rotationRange;
                            }
                        };

                        //  获取文本信息
                        var getTextInfo = function getTextInfo(word, weight, rotateDeg) {
                            // calculate the acutal font size
                            // fontSize === 0 means weightFactor function wants the text skipped,
                            // and size < minSize means we cannot draw the text.
                            var debug = false;
                            var fontSize = settings.weightFactor(weight);
                            if (fontSize <= settings.minSize) {
                                return false;
                            }

                            const mu = 1;
                            const fontWeight = settings.fontWeight;

                            var fcanvas = document.createElement('canvas');
                            document.body.appendChild(fcanvas);
                            const  fctx = fcanvas.getContext('2d', {willReadFrequently: true});

                            fctx.font = fontWeight + ' ' + (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

                            // 量大小
                            var fw = (fctx.measureText(word).width / mu) | 0;
                            var fh = (Math.max(fontSize * mu, fctx.measureText('m').width, fctx.measureText('\uFF37').width) / mu) | 0;

                            //  创建一个比我们估计的更大的边界框，这样文本就不会被删除(它仍然可能)
                            let boxWidth = fw + fh * 2;
                            let boxHeight = fh * 3;
                            const fgw = Math.ceil(boxWidth / g);
                            const fgh = Math.ceil(boxHeight / g);
                            boxWidth = fgw * g;
                            boxHeight = fgh * g;

                            //  ❤️❤️❤️❤️❤️❤️❤️
                            //  计算适当的偏移量，使文本位于首选位置的中心。

                            //  这只是宽度的一半。
                            var fillTextOffsetX = -fw / 2;
                            //  不将方框移动到首选位置的精确中间位置，而是将y偏移量移动0.4，因此拉丁字母看起来垂直居中。
                            var fillTextOffsetY = -fh * 0.4;
                            // console.log(fillTextOffsetX, fw)

                            //  计算画布的实际尺寸，考虑旋转。
                            var cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) + boxHeight * Math.abs(Math.cos(rotateDeg))) / g);
                            var cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) + boxHeight * Math.abs(Math.sin(rotateDeg))) / g);
                            // console.log(cgw, boxWidth);
                            // console.log(cgh, boxHeight);
                            // console.log( cgw, boxWidth)
                            var width = cgw * g;
                            var height = cgh * g;

                            //  将画布设置为这么大
                            fcanvas.setAttribute('width', width);
                            fcanvas.setAttribute('height', height);




                            // 用|mu|缩放画布。
                            fctx.scale(1 / mu, 1 / mu);
                            fctx.translate(width * mu / 2, height * mu / 2);
                            fctx.rotate(-rotateDeg);

                            //  一旦宽度/高度设置好，ctx信息将被重置。在这里再次设置。
                            fctx.font = fontWeight + ' ' + (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

                            // Fill the text into the fcanvas.
                            // XXX: We cannot because textBaseline = 'top' here because
                            // Firefox and Chrome uses different default line-height for canvas.
                            // Please read https://bugzil.la/737852#c6.
                            // Here, we use textBaseline = 'middle' and draw the text at exactly
                            // 0.5 * fontSize lower.
                            fctx.fillStyle = '#000';
                            fctx.textBaseline = 'middle';
                            // console.log(fillTextOffsetX * mu,(fillTextOffsetY + fontSize * 0.5) * mu)
                            fctx.fillText(word, fillTextOffsetX * mu, (fillTextOffsetY + fontSize * 0.5) * mu);

                            const imageData = fctx.getImageData(0, 0, width, height).data;


                            //  ❤️❤️❤️❤️❤️❤️
                            //  读取像素并将信息保存到占用的数组中
                            var occupied = [];
                            var gx = cgw,
                                gy,
                                x,
                                y;
                            var bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
                            while (gx--) {
                                gy = cgh;
                                while (gy--) {
                                    y = g;
                                    singleGridLoop: {
                                        while (y--) {
                                            x = g;
                                            while (x--) {
                                                if (imageData[((gy * g + y) * width + (gx * g + x)) * 4 + 3]) {
                                                    occupied.push([gx, gy]);
                                                    if (gx < bounds[3]) {
                                                        bounds[3] = gx;
                                                    }
                                                    if (gx > bounds[1]) {
                                                        bounds[1] = gx;
                                                    }
                                                    if (gy < bounds[0]) {
                                                        bounds[0] = gy;
                                                    }
                                                    if (gy > bounds[2]) {
                                                        bounds[2] = gy;
                                                    }

                                                    if (true) {
                                                        fctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                                                        fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
                                                    }
                                                    break singleGridLoop;
                                                }
                                            }
                                        }
                                        if (debug) {
                                            fctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                                            fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
                                        }
                                    }
                                }
                            }


                            // Return information needed to create the text on the real canvas
                            return {
                                mu: mu,
                                occupied: occupied,
                                bounds: bounds,
                                gw: cgw,
                                gh: cgh,
                                fillTextOffsetX: fillTextOffsetX,
                                fillTextOffsetY: fillTextOffsetY,
                                fillTextWidth: fw,
                                fillTextHeight: fh,
                                fontSize: fontSize
                            };
                        };

                        /* Determine if there is room available in the given dimension */
                        var canFitText = function canFitText(gx, gy, gw, gh, occupied) {
                            // Go through the occupied points,
                            // return false if the space is not available.
                            var i = occupied.length;
                            while (i--) {
                                var px = gx + occupied[i][0];
                                var py = gy + occupied[i][1];

                                if (px >= ngx || py >= ngy || px < 0 || py < 0) {
                                    if (!settings.drawOutOfBound) {
                                        return false;
                                    }
                                    continue;
                                }

                                if (!grid[px][py]) {
                                    return false;
                                }
                            }
                            return true;
                        };

                        _this.drawItem = function (item, index) {
                            if (!item) {
                                return;
                            }
                            // Actually put the text on the canvas
                            drawText(item.gx, item.gy, item.info, item.word, item.weight, item.distance, item.theta, item.rotateDeg, item.attributes, item.i, item.highlight);
                            // Mark the spaces on the grid as filled

                            updateGrid(item.gx, item.gy, item.gw, item.gh, item.info, item.item, item.i);
                        };

                        var roundRect = function roundRect(ctx, x, y, width, height, r, bgColor, borderColor) {
                            ctx.beginPath(0);
                            ctx.save();
                            ctx.moveTo(x + r, y);
                            ctx.lineTo(x + width - r, y);
                            ctx.arcTo(x + width, y, x + width, y + r, r);
                            ctx.lineTo(x + width, y + height - r);
                            ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
                            ctx.lineTo(x + r, y + height);
                            ctx.arcTo(x, y + height, x, y + height - r, r);
                            ctx.lineTo(x, y + r);
                            ctx.arcTo(x, y, x + r, y, r);
                            ctx.closePath();
                            ctx.fillStyle = bgColor; //若是给定了值就用给定的值否则给予默认值
                            ctx.fill();
                            ctx.lineWidth = '1';
                            ctx.strokeStyle = borderColor;
                            ctx.stroke();
                            ctx.restore();
                        };

                        var colorRgba = function colorRgba(sHex) {
                            var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

                            // 十六进制颜色值的正则表达式
                            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                            /* 16进制颜色转为RGB格式 */
                            var sColor = sHex.toLowerCase();
                            if (sColor && reg.test(sColor)) {
                                if (sColor.length === 4) {
                                    var sColorNew = '#';
                                    for (var i = 1; i < 4; i += 1) {
                                        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                                    }
                                    sColor = sColorNew;
                                }
                                //  处理六位的颜色值
                                var sColorChange = [];
                                for (var _i = 1; _i < 7; _i += 2) {
                                    sColorChange.push(parseInt('0x' + sColor.slice(_i, _i + 2)));
                                }
                                // return sColorChange.join(',')
                                // 或
                                return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')';
                            } else if (sColor.startsWith('rgba')) {
                                return sColor.split(',').map(function (item, i) {
                                    if (i === 3) {
                                        item = ' 0.2)';
                                    }
                                    ;
                                    return item;
                                }).join(',');
                            } else {
                                return sColor;
                            }
                        };
                        /* Actually draw the text on the grid */
                        var drawText = function drawText(gx, gy, info, word, weight, distance, theta, rotateDeg, attributes, index, highlight) {

                            var fontSize = info.fontSize;
                            var color;
                            if (getTextColor) {
                                color = getTextColor(word, weight, fontSize, distance, theta);
                            } else {
                                color = settings.color;
                            }
                            // get fontWeight that will be used to set ctx.font and font style rule
                            var fontWeight;
                            if (getTextFontWeight) {
                                fontWeight = getTextFontWeight(word, weight, fontSize);
                            } else {
                                fontWeight = settings.fontWeight;
                            }

                            var classes;
                            if (getTextClasses) {
                                classes = getTextClasses(word, weight, fontSize);
                            } else {
                                classes = settings.classes;
                            }

                            var dimension;
                            var bounds = info.bounds;
                            dimension = {
                                x: (gx + bounds[3]) * g,
                                y: (gy + bounds[0]) * g,
                                w: (bounds[1] - bounds[3] + 1) * g,
                                h: (bounds[2] - bounds[0] + 1) * g
                            };

                            var itemColor,
                                gradient,
                                isItemColorArray = false,
                                colorStartPosition = 'left',
                                markColorInfo;
                            if (Object.prototype.toString.call(color) === '[object Array]') {
                                itemColor = color[index % color.length];
                                color = itemColor;
                                if (Object.prototype.toString.call(itemColor) === '[object Array]') {
                                    isItemColorArray = true;
                                }
                                if (isItemColorArray && Object.prototype.toString.call(itemColor[itemColor.length - 1]) !== '[object Number]') {
                                    itemColor[itemColor.length] = 0;
                                }
                                colorStartPosition = itemColor[itemColor.length - 1] === 0 ? 'top' : 'left';
                            }
                            markColorInfo = JSON.parse(JSON.stringify(color));
                            elements.forEach(function (el, i) {
                                if (el.getContext) {
                                    var ctx = el.getContext('2d');
                                    var mu = info.mu;
                                    // Save the current state before messing it
                                    ctx.save();
                                    ctx.scale(1 / mu, 1 / mu);
                                    // 支持阴影
                                    ctx.font = fontWeight + ' ' + (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;
                                    // 支持渐变色
                                    if (isItemColorArray) {
                                        var _textWidth = ctx.measureText(word).width;
                                        gradient = ctx.createLinearGradient(colorStartPosition !== 'top' ? -_textWidth / 2 : 0, colorStartPosition === 'top' ? -fontSize / 2 : 0, colorStartPosition !== 'top' ? _textWidth / 2 : 0, colorStartPosition === 'top' ? fontSize / 2 : 0);
                                        for (var i = 0; i < itemColor.length - 1; i++) {
                                            gradient.addColorStop(i / (itemColor.length - 2), itemColor[i]);
                                        }
                                        color = gradient;
                                    }

                                    ctx.fillStyle = color;

                                    // Translate the canvas position to the origin coordinate of where
                                    // the text should be put.
                                    ctx.translate((gx + info.gw / 2) * g * mu, (gy + info.gh / 2) * g * mu);
                                    if (highlight) {
                                        var bggradient;
                                        if (isItemColorArray) {
                                            bggradient = ctx.createLinearGradient(colorStartPosition !== 'top' ? -info.fillTextOffsetX * mu - 4 * 1 / mu / 2 : 0, colorStartPosition === 'top' ? -info.fillTextOffsetY * mu - 4 * 1 / mu / 2 : 0, colorStartPosition !== 'top' ? info.fillTextOffsetX * mu - 4 * 1 / mu / 2 : 0, colorStartPosition === 'top' ? info.fillTextOffsetY * mu - 4 * 1 / mu / 2 : 0);
                                            for (var i = 0; i < itemColor.length - 1; i++) {
                                                bggradient.addColorStop(i / (itemColor.length - 2), colorRgba(itemColor[itemColor.length - 2 - i], 0.2));
                                            }
                                        }
                                        roundRect(ctx, info.fillTextOffsetX * mu - 2 * 1 / mu, info.fillTextOffsetY * mu - 2 * 1 / mu, ctx.measureText(word).width + 4 * 1 / mu, fontSize + 4 * 1 / mu, 4 * 1 / mu, isItemColorArray ? bggradient : colorRgba(itemColor ? itemColor : color, 0.2), isItemColorArray ? itemColor[0] : itemColor ? itemColor : color);
                                    }
                                    ctx.shadowColor = options.shadowColor;
                                    ctx.shadowOffsetX = options.shadowOffsetX;
                                    ctx.shadowOffsetY = options.shadowOffsetY;
                                    ctx.shadowBlur = options.shadowBlur;
                                    if (rotateDeg !== 0) {
                                        ctx.rotate(-rotateDeg);
                                    }

                                    // Finally, fill the text.

                                    // XXX: We cannot because textBaseline = 'top' here because
                                    // Firefox and Chrome uses different default line-height for canvas.
                                    // Please read https://bugzil.la/737852#c6.
                                    // Here, we use textBaseline = 'middle' and draw the text at exactly
                                    // 0.5 * fontSize lower.

                                    ctx.textBaseline = 'middle';

                                    ctx.fillText(word, info.fillTextOffsetX * mu, (info.fillTextOffsetY + fontSize * 0.5) * mu);

                                    // The below box is always matches how <span>s are positioned
                                    /* ctx.strokeRect(info.fillTextOffsetX, info.fillTextOffsetY,
                                      info.fillTextWidth, info.fillTextHeight); */

                                    // Restore the state.

                                    ctx.restore();
                                } else {
                                    if (isItemColorArray) {
                                        color = itemColor;
                                    }
                                    // drawText on DIV element
                                    var div = document.createElement('div');
                                    var span = document.createElement('span');
                                    var transformRule = '';
                                    transformRule = 'rotate(' + -rotateDeg / Math.PI * 180 + 'deg) ';
                                    if (info.mu !== 1) {
                                        transformRule += 'translateX(-' + info.fillTextWidth / 4 + 'px) ' + 'scale(' + 1 / info.mu + ')';
                                    }
                                    var posStyle = _defineProperty({
                                        'position': 'absolute',
                                        'display': 'block',
                                        'font': fontWeight + ' ' + fontSize * info.mu + 'px ' + settings.fontFamily,
                                        'left': (gx + info.gw / 2) * g + info.fillTextOffsetX + 'px',
                                        'top': (gy + info.gh / 2) * g + info.fillTextOffsetY + 'px',
                                        'width': info.fillTextWidth + 'px',
                                        // 'height': info.fillTextHeight + 'px',

                                        'box-sizing': 'border-box',
                                        'border-radius': '4px',
                                        'border-style': 'solid',
                                        'border-width': '1px',
                                        'border-color': 'transparent',
                                        'lineHeight': fontSize + 'px',
                                        'whiteSpace': 'nowrap',
                                        'transform': transformRule,
                                        'webkitTransform': transformRule,
                                        'msTransform': transformRule,
                                        'transformOrigin': '50% 40%',
                                        'webkitTransformOrigin': '50% 40%',
                                        'msTransformOrigin': '50% 40%'
                                    }, 'font', fontWeight + ' ' + fontSize * info.mu + 'px ' + settings.fontFamily);
                                    var styleRules = {
                                        'display': 'block',
                                        'font': fontWeight + ' ' + fontSize * info.mu + 'px ' + settings.fontFamily,
                                        // 'textShadow': options.shadowOffsetX + 'px ' + options.shadowOffsetY + 'px ' + options.shadowBlur + 'px ' + options.shadowColor, //增加文字阴影
                                        'filter': 'drop-shadow(' + options.shadowOffsetX + 'px ' + options.shadowOffsetY + 'px ' + options.shadowBlur + 'px ' + options.shadowColor + ')'
                                        // 'cursor': options.tooltip.show || options.click || options.hover ? 'pointer' : 'auto'
                                    };
                                    if (highlight) {
                                        posStyle = Object.assign(posStyle, _defineProperty({
                                            'border-color': isItemColorArray ? color[0] : color,
                                            'border-style': 'solid',
                                            'border-width': '1px'
                                        }, 'border-color', isItemColorArray ? color[0] : color));
                                        if (isItemColorArray) {
                                            posStyle.backgroundImage = '-webkit-linear-gradient(' + colorStartPosition + ',' + color.filter(function (item, i) {
                                                return i != color.length - 1;
                                            }).map(function (item) {
                                                return colorRgba(item, 0.2);
                                            }).join(',') + ')';
                                        } else {
                                            posStyle.backgroundColor = colorRgba(color, 0.2);
                                        }
                                    }
                                    if (color) {
                                        if (Object.prototype.toString.call(color) === '[object Array]') {
                                            // DOM 渲染时增加渐变色
                                            styleRules = Object.assign({
                                                webkitBackgroundClip: 'text',
                                                webkitTextFillColor: 'transparent',
                                                backgroundImage: '-webkit-linear-gradient(' + colorStartPosition + ',' + color.filter(function (item, i) {
                                                    return i != color.length - 1;
                                                }).join(',') + ')'
                                            }, styleRules);
                                        }
                                        styleRules.color = color;
                                    }
                                    span.textContent = word;
                                    for (var cssProp in posStyle) {
                                        div.style[cssProp] = posStyle[cssProp];
                                    }
                                    for (var cssProp in styleRules) {
                                        span.style[cssProp] = styleRules[cssProp];
                                    }
                                    if (attributes) {
                                        for (var attribute in attributes) {
                                            span.setAttribute(attribute, attributes[attribute]);
                                        }
                                    }
                                    if (classes) {
                                        span.className += classes;
                                    }
                                    div.appendChild(span);
                                    el.appendChild(div);
                                }
                            });
                        };

                        /* Help function to updateGrid */
                        var fillGridAt = function fillGridAt(x, y, drawMask, dimension, item, index) {
                            if (x >= ngx || y >= ngy || x < 0 || y < 0) {
                                return;
                            }

                            grid[x][y] = false;

                            if (drawMask) {
                                var ctx = elements[0].getContext('2d');
                                ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
                            }

                            if (interactive) {
                                infoGrid[x][y] = {item: item, dimension: dimension, index: index};
                            }
                        };

                        /* Update the filling information of the given space with occupied points.
                           Draw the mask on the canvas if necessary. */
                        var updateGrid = function updateGrid(gx, gy, gw, gh, info, item, index) {
                            var occupied = info.occupied;
                            var drawMask = settings.drawMask;
                            var ctx;
                            if (drawMask) {
                                ctx = elements[0].getContext('2d');
                                ctx.save();
                                ctx.fillStyle = settings.maskColor;
                            }

                            var dimension;
                            if (interactive) {
                                var bounds = info.bounds;
                                dimension = {
                                    x: (gx + bounds[3]) * g,
                                    y: (gy + bounds[0]) * g,
                                    w: (bounds[1] - bounds[3] + 1) * g,
                                    h: (bounds[2] - bounds[0] + 1) * g
                                };
                            }

                            var i = occupied.length;
                            while (i--) {
                                var px = gx + occupied[i][0];
                                var py = gy + occupied[i][1];

                                if (px >= ngx || py >= ngy || px < 0 || py < 0) {
                                    continue;
                                }

                                fillGridAt(px, py, drawMask, dimension, item, index);
                            }

                            if (drawMask) {
                                ctx.restore();
                            }
                        };

                        /* putWord() processes each item on the list,
                           calculate it's size and determine it's position, and actually
                           put it on the canvas. */
                        var putWord = function putWord(item, i) {
                            var word,
                                weight,
                                attributes,
                                highlight,
                                index = i;
                            if (Array.isArray(item)) {
                                word = item[0];
                                weight = item[1];
                                highlight = item[2];
                            } else {
                                word = item.word;
                                weight = item.weight;
                                attributes = item.attributes;
                                highlight = item.highlight;
                            }
                            var rotateDeg = getRotateDeg();

                            // get info needed to put the text onto the canvas
                            var info = getTextInfo(word, weight, rotateDeg);

                            // not getting the info means we shouldn't be drawing this one.
                            if (!info) {
                                return false;
                            }

                            if (exceedTime()) {
                                return false;
                            }

                            // If drawOutOfBound is set to false,
                            // skip the loop if we have already know the bounding box of
                            // word is larger than the canvas.
                            if (!settings.drawOutOfBound) {
                                var bounds = info.bounds;
                                if (bounds[1] - bounds[3] + 1 > ngx || bounds[2] - bounds[0] + 1 > ngy) {
                                    return false;
                                }
                            }

                            // Determine the position to put the text by
                            // start looking for the nearest points
                            var r = maxRadius + 1;
                            var tryToPutWordAtPoint = function tryToPutWordAtPoint(gxy, index) {
                                var gx = Math.floor(gxy[0] - info.gw / 2);
                                var gy = Math.floor(gxy[1] - info.gh / 2);
                                var gw = info.gw;
                                var gh = info.gh;
                                // If we cannot fit the text at this position, return false
                                // and go to the next position.
                                if (!canFitText(gx, gy, gw, gh, info.occupied)) {
                                    return false;
                                }
                                var wordItem = {
                                    gx: gx,
                                    gy: gy,
                                    info: info,
                                    word: word,
                                    weight: weight,
                                    distance: maxRadius - r,
                                    theta: gxy[2],
                                    attributes: attributes,
                                    item: item,
                                    i: index,
                                    highlight: highlight,
                                    rotateDeg: rotateDeg
                                };
                                _this.words.push(wordItem);
                                // // Actually put the text on the canvas
                                // drawText(gx, gy, info, word, weight,
                                //          (maxRadius - r), gxy[2], rotateDeg, attributes, i);
                                // // Mark the spaces on the grid as filled
                                // updateGrid(gx, gy, gw, gh, info, item);
                                // Return true so some() will stop and also return true.
                                return wordItem;
                            };
                            while (r--) {
                                var points = getPointsAtRadius(maxRadius - r);
                                if (settings.shuffle) {
                                    points = [].concat(points);
                                    shuffleArray(points);
                                }

                                // Try to fit the words by looking at each point.
                                // array.some() will stop and return true
                                // when putWordAtPoint() returns true.
                                // If all the points returns false, array.some() returns false.
                                var drawn;
                                for (var i = 0; i < points.length; i++) {
                                    var drawnItem = tryToPutWordAtPoint(points[i], index);
                                    if (drawnItem) {
                                        drawn = drawnItem;
                                        break;
                                    }
                                }

                                // var drawn = points.some(tryToPutWordAtPoint);
                                if (drawn) {
                                    // leave putWord() and return true
                                    return drawn;
                                }
                            }
                            // we tried all distances but text won't fit, return false
                            return false;
                        };

                        /* Send DOM event to all elements. Will stop sending event and return
                           if the previous one is canceled (for cancelable events). */
                        var sendEvent = function sendEvent(type, cancelable, detail) {
                            if (cancelable) {
                                return !elements.some(function (el) {
                                    var evt = document.createEvent('CustomEvent');
                                    evt.initCustomEvent(type, true, cancelable, detail || {});
                                    return !el.dispatchEvent(evt);
                                }, this);
                            } else {
                                elements.forEach(function (el) {
                                    var evt = document.createEvent('CustomEvent');
                                    evt.initCustomEvent(type, true, cancelable, detail || {});
                                    el.dispatchEvent(evt);
                                }, this);
                            }
                        };

                        /* Start drawing on a canvas */
                        var start = function start() {
                            // For dimensions, clearCanvas etc.,
                            // we only care about the first element.
                            var canvas = maskCanvas;

                            if (canvas.getContext) {
                                ngx = Math.ceil(canvas.width / g);
                                ngy = Math.ceil(canvas.height / g);
                            } else {
                                var rect = canvas.getBoundingClientRect();
                                ngx = Math.ceil(rect.width / g);
                                ngy = Math.ceil(rect.height / g);
                            }

                            // Sending a wordcloudstart event which cause the previous loop to stop.
                            // Do nothing if the event is canceled.
                            if (!sendEvent('wordcloudstart', true)) {
                                return;
                            }

                            // Determine the center of the word cloud
                            center = settings.origin ? [settings.origin[0] / g, settings.origin[1] / g] : [ngx / 2, ngy / 2];

                            // Maxium radius to look for space
                            maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
                            /* Clear the canvas only if the clearCanvas is set,
                               if not, update the grid to the current canvas state */
                            grid = [];

                            var gx, gy, i;
                            elements.forEach(function (el) {
                                el.style.backgroundColor = settings.backgroundColor;
                                if (el.getContext) {
                                    var ctx = el.getContext('2d');
                                    ctx.fillStyle = settings.backgroundColor;
                                    ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                                    ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                                } else {
                                    el.textContent = '';
                                    el.style.position = 'relative';
                                }
                            });
                            if (!canvas.getContext || settings.clearCanvas) {

                                /* fill the grid with empty state */
                                gx = ngx;
                                while (gx--) {
                                    grid[gx] = [];
                                    gy = ngy;
                                    while (gy--) {
                                        grid[gx][gy] = true;
                                    }
                                }
                            } else {
                                /* Determine bgPixel by creating
                                   another canvas and fill the specified background color. */
                                var bctx = document.createElement('canvas').getContext('2d');

                                // bctx.fillStyle = settings.backgroundColor;
                                bctx.fillStyle = '#ffffff';
                                bctx.fillRect(0, 0, 1, 1);
                                var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

                                /* Read back the pixels of the canvas we got to tell which part of the
                                   canvas is empty.
                                   (no clearCanvas only works with a canvas, not divs) */
                                var imageData = canvas.getContext('2d').getImageData(0, 0, ngx * g, ngy * g).data;

                                gx = ngx;
                                var x, y;
                                while (gx--) {
                                    grid[gx] = [];
                                    gy = ngy;
                                    while (gy--) {
                                        y = g;
                                        singleGridLoop: while (y--) {
                                            x = g;
                                            while (x--) {
                                                i = 4;
                                                while (i--) {
                                                    if (imageData[((gy * g + y) * ngx * g + (gx * g + x)) * 4 + i] !== bgPixel[i]) {
                                                        grid[gx][gy] = false;
                                                        break singleGridLoop;
                                                    }
                                                }
                                            }
                                        }
                                        if (grid[gx][gy] !== false) {
                                            grid[gx][gy] = true;
                                        }
                                    }
                                }

                                imageData = bctx = bgPixel = undefined;
                            }
                            // fill the infoGrid with empty state if we need it
                            if (settings.hover || settings.click) {
                                interactive = true;

                                /* fill the grid with empty state */
                                gx = ngx + 1;
                                while (gx--) {
                                    infoGrid[gx] = [];
                                }
                                var touchend = function touchend(e) {
                                    e.preventDefault();
                                };
                                elements.forEach(function (item) {
                                    if (settings.hover) {
                                        item.addEventListener('mousemove', wordcloudhover);
                                        item.addEventListener('mouseout', wordcloudout);
                                    }
                                    if (settings.click) {
                                        item.addEventListener('click', wordcloudclick);
                                        item.addEventListener('touchstart', wordcloudclick);
                                        item.addEventListener('touchend', touchend);
                                        item.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
                                    }

                                    item.addEventListener('wordcloudstart', function stopInteraction() {
                                        item.removeEventListener('wordcloudstart', stopInteraction);
                                        item.removeEventListener('mousemove', wordcloudhover);
                                        item.removeEventListener('mouseout', wordcloudout);
                                        item.removeEventListener('click', wordcloudclick);
                                        item.removeEventListener('touchstart', wordcloudclick);
                                        item.removeEventListener('touchend', touchend);
                                        hovered = undefined;
                                    });
                                });
                            }

                            i = 0;
                            var loopingFunction, stoppingFunction;
                            if (settings.wait !== 0) {
                                loopingFunction = window.setTimeout;
                                stoppingFunction = window.clearTimeout;
                            } else {
                                loopingFunction = window.setImmediate;
                                stoppingFunction = window.clearImmediate;
                            }

                            var addEventListener = function addEventListener(type, listener) {
                                elements.forEach(function (el) {
                                    el.addEventListener(type, listener);
                                }, this);
                            };

                            var removeEventListener = function removeEventListener(type, listener) {
                                elements.forEach(function (el) {
                                    el.removeEventListener(type, listener);
                                }, this);
                            };

                            var anotherWordCloudStart = function anotherWordCloudStart() {
                                removeEventListener('wordcloudstart', anotherWordCloudStart);
                                stoppingFunction(timer);
                            };

                            addEventListener('wordcloudstart', anotherWordCloudStart);
                            var timer = loopingFunction(function loop() {
                                if (i >= settings.list.length) {
                                    stoppingFunction(timer);
                                    sendEvent('wordcloudstop', false);
                                    removeEventListener('wordcloudstart', anotherWordCloudStart);

                                    return;
                                }
                                escapeTime = new Date().getTime();
                                var drawn = putWord(settings.list[i], i);
                                _this.drawItem(drawn);
                                var canceled = !sendEvent('wordclouddrawn', true, {
                                    item: settings.list[i], drawn: drawn && true
                                });
                                if (exceedTime() || canceled) {
                                    stoppingFunction(timer);
                                    settings.abort();
                                    sendEvent('wordcloudabort', false);
                                    sendEvent('wordcloudstop', false);
                                    removeEventListener('wordcloudstart', anotherWordCloudStart);
                                    return;
                                }
                                i++;
                                timer = loopingFunction(loop, settings.wait);
                            }, settings.wait);

                            if (canvasEl) {
                                var canvasCtx = canvasEl.getContext('2d');
                                var ratio = getPixelRatio(canvasCtx);
                                canvasEl.width = canvasEl.width * ratio;
                                canvasEl.height = canvasEl.height * ratio;
                                canvasCtx.scale(ratio, ratio);
                            }
                        };

                        // All set, start the drawing
                        start();

                        return this;
                    };

                    WordCloud.prototype.highlight = function (index, isKeepAlive) {
                        var _this = this;
                        _this.elements.forEach(function (el, i) {
                            if (el.getContext) {
                                el.getContext('2d').clearRect(0, 0, el.width, el.height);
                            } else {
                                el.innerHTML = "";
                            }
                            _this.words.forEach(function (item) {
                                if (!isKeepAlive) {
                                    item.highlight = false;
                                }
                                if (item.i === index) {
                                    item.highlight = true;
                                }
                                _this.drawItem(item);
                            });
                        });
                    };
                    WordCloud.prototype.downplay = function (index, isKeepAlive) {
                        var _this = this;
                        _this.elements.forEach(function (el, i) {
                            if (el.getContext) {
                                el.getContext('2d').clearRect(0, 0, el.width, el.height);
                            } else {
                                el.innerHTML = "";
                            }
                            _this.words.forEach(function (item) {
                                if (item.i === index) {
                                    item.highlight = false;
                                }
                                _this.drawItem(item);
                            });
                        });
                    };

                    WordCloud.isSupported = isSupported;
                    WordCloud.minFontSize = minFontSize;

                    // Expose the library as an AMD module
                    if (true) {
                        global.WordCloud = WordCloud;
                        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
                            return WordCloud;
                        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                    } else if (typeof module !== 'undefined' && module.exports) {
                        module.exports = WordCloud;
                    } else {
                        global.WordCloud = WordCloud;
                    }
                })(this); //jshint ignore:line
            }).call(window);

            /***/
        })
        /******/])
});
;
//# sourceMappingURL=b2wordcloud.js.map