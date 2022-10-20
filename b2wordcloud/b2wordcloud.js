(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object") module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["B2wordcloud"] = factory();
  else root["B2wordcloud"] = factory();
})(this, function() {
  return (function(modules) {
    // webpackBootstrap

    var installedModules = {};

    function __webpack_require__(moduleId) {
      // Check if module is in cache

      if (installedModules[moduleId]) return installedModules[moduleId].exports;

      // Create a new module (and put it into the cache)

      var module = (installedModules[moduleId] = {
        exports: {},
        id: moduleId,
        loaded: false
      });

      // Execute the module function

      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

      // Flag the module as loaded

      module.loaded = true;

      // Return the exports of the module

      return module.exports;
    }

    // expose the modules object (__webpack_modules__)

    __webpack_require__.m = modules;

    // expose the module cache

    __webpack_require__.c = installedModules;

    // __webpack_public_path__

    __webpack_require__.p = "";

    // Load entry module and return exports

    return __webpack_require__(0);
  })(
    /************************************************************************/
    [
      /* 0 */
      function(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _createClass = (function() {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }

          return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();

        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }

        var WordCloud = __webpack_require__(1);

        function deepMerge(obj1, obj2) {
          var key;
          for (key in obj2) {
            obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ? deepMerge(obj1[key], obj2[key]) : (obj1[key] = obj2[key]);
          }
          return obj1;
        }

        //  ✅，计算边缘
        function updateCanvasMask(shapeCanvas, maskCanvas) {
          var bgPixel = [255, 255, 255, 255];
          console.log("bgPixel", bgPixel);
          var maskCanvasScaled = document.createElement("canvas");
          maskCanvasScaled.width = maskCanvas.width;
          maskCanvasScaled.height = maskCanvas.height;
          var ctx = maskCanvasScaled.getContext("2d");

          ctx.drawImage(shapeCanvas, 0, 0, shapeCanvas.width, shapeCanvas.height, 0, 0, maskCanvasScaled.width, maskCanvasScaled.height);
          console.log("shapeCanvas是图形一样大的canvas", shapeCanvas);
          console.log("maskCanvas是用户期望的大小", maskCanvas);
          console.log("这里是把图形拉伸或压缩到和用户期望的大小一样");
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
          ctx = maskCanvas.getContext("2d");
          ctx.drawImage(maskCanvasScaled, 0, 0);
          console.log("这里就是取个反", maskCanvasScaled);
          document.body.appendChild(maskCanvasScaled);
        }

        var B2wordcloud = (exports.B2wordcloud = (function() {
          function B2wordcloud(element, options) {
            _classCallCheck(this, B2wordcloud);

            this._wrapper = element;
            this._wrapper.style.position = "relative";
            this._container = null;
            this._tooltip = null;
            this._options = deepMerge(
              {
                renderer: "canvas",
                tooltip: {
                  show: true,
                  formatter: null
                },
                clearCanvas: !options.maskImage
              },
              options
            );
            this._wordcloud2 = null;
            this._maskCanvas = null;
            this._shapeCanvas = null;
            this._tempCanvas = null;
            this._maskImg = null;
            this._init();
          }

          _createClass(B2wordcloud, [
            {
              key: "_init",
              value: function _init() {
                this._initContainer();
                //  执行一次
                this._fixWeightFactor(this._options);
                this._maskImage();
              }
            },
            {
              key: "_initContainer",
              value: function _initContainer() {
                this._maskCanvas = document.createElement("canvas");
                this._setCanvasSize(this._maskCanvas);
                this._container = document.createElement("canvas");
                this._setCanvasSize();
                this._wrapper.appendChild(this._container);
              }
            },
            {
              key: "_setCanvasSize",
              //  ✅设置为用户控制的大小
              value: function _setCanvasSize() {
                var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._container;

                var width = this._wrapper.clientWidth;
                var height = this._wrapper.clientHeight;
                target.width = width;
                target.height = height;
                target.style.width = width + "px";
                target.style.height = height + "px";
              }
            },
            {
              key: "_maskImage",
              //  ✅计算折罩
              value: function _maskImage() {
                var _this2 = this;

                var img = window.document.createElement("img");
                img.crossOrigin = "Anonymous";
                img.src = this._options.maskImage;
                img.onload = function() {
                  _this2._maskImg = img;
                  _this2._shapeCanvas = document.createElement("canvas");
                  _this2._shapeCanvas.width = img.width;
                  _this2._shapeCanvas.height = img.height;
                  const ctx = _this2._shapeCanvas.getContext("2d");
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
            },
            {
              key: "_render",
              value: function _render() {
                updateCanvasMask(this._shapeCanvas, this._maskCanvas);
                debugger;
                new WordCloud(this._container, this._options, this._maskCanvas, false);
              }
            },
            {
              key: "_fixWeightFactor",
              value: function _fixWeightFactor(option) {
                option.maxFontSize = 24;
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
                  console.log("min", min);
                  console.log("max", max);
                  //  映射最大最小值大关系
                  if (max > min) {
                    //  ❤️❤️❤️❤️❤️❤️
                    option.weightFactor = function(val) {
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
                      return ((val - min) / subDomain) * subRange + option.minFontSize;
                    };
                  } else {
                    option.weightFactor = function(size) {
                      return option.minFontSize;
                    };
                  }
                }
              }
            }
          ]);

          return B2wordcloud;
        })());
        module.exports = B2wordcloud;
      },
      function(module, exports, __webpack_require__) {
        var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        /*** IMPORTS FROM imports-loader ***/
        (function() {
          if (!window.setImmediate) {
            window.setImmediate = (function setupSetImmediate() {
              return (
                window.msSetImmediate ||
                window.webkitSetImmediate ||
                window.mozSetImmediate ||
                window.oSetImmediate ||
                (function setupSetZeroTimeout() {
                  if (!window.postMessage || !window.addEventListener) {
                    return null;
                  }

                  var callbacks = [undefined];
                  var message = "zero-timeout-message";

                  //  类似于setTimeout，但只接受函数参数。没有时间参数(总是0)，也没有参数(必须使用闭包)。
                  var setZeroTimeout = function setZeroTimeout(callback) {
                    var id = callbacks.length;
                    callbacks.push(callback);
                    window.postMessage(message + id.toString(36), "*");
                    return id;
                  };

                  window.addEventListener(
                    "message",
                    function setZeroTimeoutMessage(evt) {
                      // Skipping checking event source, retarded IE confused this window
                      // object with another in the presence of iframe
                      if (typeof evt.data !== "string" || evt.data.substr(0, message.length) !== message /* ||  evt.source !== window */) {
                        return;
                      }

                      evt.stopImmediatePropagation();

                      var id = parseInt(evt.data.substr(message.length), 36);
                      if (!callbacks[id]) {
                        return;
                      }

                      callbacks[id]();
                      callbacks[id] = undefined;
                    },
                    true
                  );

                  /* specify clearImmediate() here since we need the scope */
                  window.clearImmediate = function clearZeroTimeout(id) {
                    if (!callbacks[id]) {
                      return;
                    }

                    callbacks[id] = undefined;
                  };

                  return setZeroTimeout;
                })() ||
                // fallback
                function setImmediateFallback(fn) {
                  window.setTimeout(fn, 0);
                }
              );
            })();
          }

          (function(global) {
            //  洗牌✅
            var shuffleArray = function shuffleArray(arr) {
              for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x) {}
              return arr;
            };

            var WordCloud = function WordCloud(elements, options, maskCanvas) {
              if (!Array.isArray(elements)) {
                elements = [elements];
              }
              // 获取像素比
              const getPixelRatio = function getPixelRatio(context) {
                var backingStore =
                  context.backingStorePixelRatio ||
                  context.webkitBackingStorePixelRatio ||
                  context.mozBackingStorePixelRatio ||
                  context.msBackingStorePixelRatio ||
                  context.oBackingStorePixelRatio ||
                  context.backingStorePixelRatio ||
                  1;
                return (window.devicePixelRatio || 1) / backingStore;
              };
              var canvasEl = null;
              var ratio = 1;
              elements.forEach(function(el, i) {
                if (el.getContext && el.getContext("2d")) {
                  canvasEl = el;
                  ratio = getPixelRatio(el.getContext("2d"));
                }
                if (typeof el === "string") {
                  elements[i] = document.getElementById(el);
                  if (!elements[i]) {
                    throw "The element id specified is not found.";
                  }
                } else if (!el.tagName && !el.appendChild) {
                  throw "You must pass valid HTML elements, or ID of the element.";
                }
              });

              /* Default values to be overwritten by options object */
              var settings = {
                list: [],
                fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' + '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
                fontWeight: "normal",
                color: "random-dark",
                minSize: 0, // 0 to disable
                weightFactor: 1,
                clearCanvas: true,
                backgroundColor: "#fff", // opaque white = rgba(255, 255, 255, 1)

                gridSize: 4,
                drawOutOfBound: false,
                origin: null,

                drawMask: false,
                maskColor: "rgba(255,0,0,0.3)",
                maskGapWidth: 0.3,

                wait: 0,
                abortThreshold: 0, // disabled
                abort: function noop() {},

                minRotation: -Math.PI / 2,
                maxRotation: Math.PI / 2,
                rotationSteps: 0,

                shuffle: true,
                rotateRatio: 0.1,

                shape: "circle",
                ellipticity: 0.65,

                classes: null,

                hover: null,
                click: null,
                cursorWhenHover: "pointer",
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

              //  todo
              if (typeof settings.weightFactor !== "function") {
                var factor = settings.weightFactor;
                settings.weightFactor = function weightFactor(pt) {
                  return pt * factor; //in px
                };
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
                ngx,
                ngy, // 网格的宽度和高度
                center, // 云中心的位置
                maxRadius;

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
                debugger;
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

                var x = Math.floor((eventX * (canvas.width / rect.width / ratio || 1)) / g);
                var y = Math.floor((eventY * (canvas.height / rect.height / ratio || 1)) / g);

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
                  evt.target.style.cursor = "default";
                  return;
                } else if (settings.cursorWhenHover === "pointer") {
                  evt.target.style.cursor = "pointer";
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
                debugger;
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
                  if (settings.shape !== "circle") {
                    rx = settings.shape((t / T) * 2 * Math.PI); // 0 to 1
                  }

                  // Push [x, y, t]; t is used solely for getTextColor()
                  points.push([
                    center[0] + radius * rx * Math.cos((-t / T) * 2 * Math.PI),
                    center[1] + radius * rx * Math.sin((-t / T) * 2 * Math.PI) * settings.ellipticity,
                    (t / T) * 2 * Math.PI
                  ]);
                }

                pointsAtRadius[radius] = points;
                return points;
              };

              /* 如果我们花了太多的时间，返回true */
              var exceedTime = function exceedTime() {
                return false;
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
                  return minRotation + (Math.floor(Math.random() * rotationSteps) * rotationRange) / (rotationSteps - 1);
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

                var fcanvas = document.createElement("canvas");
                document.body.appendChild(fcanvas);
                const fctx = fcanvas.getContext("2d", { willReadFrequently: true });

                fctx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + settings.fontFamily;

                // 量大小
                var fw = (fctx.measureText(word).width / mu) | 0;
                var fh = (Math.max(fontSize * mu, fctx.measureText("m").width, fctx.measureText("\uFF37").width) / mu) | 0;

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
                fcanvas.setAttribute("width", width);
                fcanvas.setAttribute("height", height);

                // 用|mu|缩放画布。
                fctx.scale(1 / mu, 1 / mu);
                fctx.translate((width * mu) / 2, (height * mu) / 2);
                fctx.rotate(-rotateDeg);

                //  一旦宽度/高度设置好，ctx信息将被重置。在这里再次设置。
                fctx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + settings.fontFamily;

                // Fill the text into the fcanvas.
                // XXX: We cannot because textBaseline = 'top' here because
                // Firefox and Chrome uses different default line-height for canvas.
                // Please read https://bugzil.la/737852#c6.
                // Here, we use textBaseline = 'middle' and draw the text at exactly
                // 0.5 * fontSize lower.
                fctx.fillStyle = "#000";
                fctx.textBaseline = "middle";
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
                              fctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                              fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
                            }
                            break singleGridLoop;
                          }
                        }
                      }
                      if (debug) {
                        fctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                        fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
                      }
                    }
                  }
                }

                // console.log('word',word);
                // console.log('occupied',occupied);

                //返回在真实画布上创建文本所需的信息
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

              //  ✅   难点
              _this.drawItem = function(item, index) {
                if (!item) {
                  return;
                }

                //  实际上把文本放到画布上
                drawText(
                  item.gx,
                  item.gy,
                  item.info,
                  item.word,
                  item.weight,
                  item.distance,
                  item.theta,
                  item.rotateDeg,
                  item.attributes,
                  item.i,
                  item.highlight
                );
                //  将网格上的空格标记为已填充
                updateGrid(item.gx, item.gy, item.gw, item.gh, item.info, item.item, item.i);
              };

              /*✅实际在网格上绘制文本*/
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

                var itemColor,
                  gradient,
                  isItemColorArray = false,
                  colorStartPosition = "left",
                  markColorInfo;
                if (Object.prototype.toString.call(color) === "[object Array]") {
                  itemColor = color[index % color.length];
                  color = itemColor;
                  if (Object.prototype.toString.call(itemColor) === "[object Array]") {
                    isItemColorArray = true;
                  }
                  if (isItemColorArray && Object.prototype.toString.call(itemColor[itemColor.length - 1]) !== "[object Number]") {
                    itemColor[itemColor.length] = 0;
                  }
                  colorStartPosition = itemColor[itemColor.length - 1] === 0 ? "top" : "left";
                }
                elements.forEach(function(el, i) {
                  var ctx = el.getContext("2d");
                  var mu = info.mu;
                  // Save the current state before messing it
                  ctx.save();
                  ctx.scale(1 / mu, 1 / mu);
                  // 支持阴影
                  ctx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + settings.fontFamily;
                  // 支持渐变色
                  if (isItemColorArray) {
                    var _textWidth = ctx.measureText(word).width;
                    gradient = ctx.createLinearGradient(
                      colorStartPosition !== "top" ? -_textWidth / 2 : 0,
                      colorStartPosition === "top" ? -fontSize / 2 : 0,
                      colorStartPosition !== "top" ? _textWidth / 2 : 0,
                      colorStartPosition === "top" ? fontSize / 2 : 0
                    );
                    for (var i = 0; i < itemColor.length - 1; i++) {
                      gradient.addColorStop(i / (itemColor.length - 2), itemColor[i]);
                    }
                    color = gradient;
                  }

                  ctx.fillStyle = color;

                  // Translate the canvas position to the origin coordinate of where
                  // the text should be put.
                  ctx.translate((gx + info.gw / 2) * g * mu, (gy + info.gh / 2) * g * mu);

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

                  ctx.textBaseline = "middle";

                  ctx.fillText(word, info.fillTextOffsetX * mu, (info.fillTextOffsetY + fontSize * 0.5) * mu);

                  // The below box is always matches how <span>s are positioned
                  /* ctx.strokeRect(info.fillTextOffsetX, info.fillTextOffsetY,
                                                    info.fillTextWidth, info.fillTextHeight); */

                  // Restore the state.

                  ctx.restore();
                });
              };

              //  updateGrid的帮助函数
              var fillGridAt = function fillGridAt(x, y, drawMask, dimension, item, index) {
                if (x >= ngx || y >= ngy || x < 0 || y < 0) {
                  return;
                }
                grid[x][y] = false;

                if (drawMask) {
                  var ctx = elements[0].getContext("2d");
                  ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
                }

                if (interactive) {
                  infoGrid[x][y] = { item: item, dimension: dimension, index: index };
                }
              };

              //  用占位点更新给定空间的填充信息。如有必要，在画布上画出蒙版。
              var updateGrid = function updateGrid(gx, gy, gw, gh, info, item, index) {
                var occupied = info.occupied;
                var drawMask = settings.drawMask;
                var ctx;
                if (drawMask) {
                  ctx = elements[0].getContext("2d");
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

              //  处理列表中的每一项，计算它的大小，确定它的位置，实际上把它放在画布上。
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

                //  ❤️❤️❤️❤️❤️❤️❤️❤️
                var info = getTextInfo(word, weight, rotateDeg);

                //  如果drawOutOfBound设置为false，如果我们已经知道word的边框大于画布，则跳过循环。
                if (!settings.drawOutOfBound) {
                  var bounds = info.bounds;
                  if (bounds[1] - bounds[3] + 1 > ngx || bounds[2] - bounds[0] + 1 > ngy) {
                    return false;
                  }
                }

                //  通过查找最近的点来确定文本的位置
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

                  //  试着看每一个点来匹配单词。
                  //  array.some()将停止并在putWordAtPoint()返回true时返回true。
                  //  如果所有点都返回false，则array.some()返回false。
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

              //  发送DOM事件给所有元素。将停止发送事件并返回如果前一个被取消(对于可取消的事件)。

              //  开始在画布上画画  只执行一次✅
              var start = function start() {
                //  对于维数，clearCanvas等，我们只关心第一个元素。
                var canvas = maskCanvas;
                console.log(111);
                ngx = Math.ceil(canvas.width / g);
                ngy = Math.ceil(canvas.height / g);

                console.log("寻找空间的最大半径");
                //确定词云的中心
                center = [ngx / 2, ngy / 2];

                //寻找空间的最大半径
                maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
                /*只在设置了clearCanvas时清除画布，如果没有，则更新网格到当前画布状态*/
                grid = [];

                var gx, gy, i;
                elements.forEach(function(el) {
                  var ctx = el.getContext("2d");
                  ctx.fillStyle = settings.backgroundColor;
                  ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                  ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                });
                /* Determine bgPixel by creating
                                               another canvas and fill the specified background color. */
                var bctx = document.createElement("canvas").getContext("2d");

                bctx.fillStyle = "#ffffff";
                bctx.fillRect(0, 0, 1, 1);

                const bgPixel = [255, 255, 255, 255];

                //  读取画布的像素，我们要告诉画布的哪个部分是空的。
                var imageData = canvas.getContext("2d").getImageData(0, 0, ngx * g, ngy * g).data;
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

                //  console.log('grid', JSON.stringify(grid));

                //  ------------------------------

                i = 0;
                const loopingFunction = window.setImmediate;
                const stoppingFunction = window.clearImmediate;

                var timer = loopingFunction(function loop() {
                  if (i >= settings.list.length) {
                    //  结束
                    stoppingFunction(timer);
                    return;
                  }

                  // 方文字
                  var drawn = putWord(settings.list[i], i);
                  //  画元素
                  _this.drawItem(drawn);
                  i++;
                  timer = loopingFunction(loop, settings.wait);
                }, settings.wait);

                if (canvasEl) {
                  var canvasCtx = canvasEl.getContext("2d");
                  var ratio = getPixelRatio(canvasCtx);
                  canvasEl.width = canvasEl.width * ratio;
                  canvasEl.height = canvasEl.height * ratio;
                  canvasCtx.scale(ratio, ratio);
                }
              };

              start();
            };

            global.WordCloud = WordCloud;
            !((__WEBPACK_AMD_DEFINE_ARRAY__ = []),
            (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
              return WordCloud;
            }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)),
            __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          })(this); //jshint ignore:line
        }.call(window));
      }
    ]
  );
});
