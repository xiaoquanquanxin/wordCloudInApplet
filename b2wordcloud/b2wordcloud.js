/// 默认值将被options对象覆盖
const settings = {
  list: [],
  //    必须
  fontWeight: "normal",
  //    必须
  color: "random-dark",
  //  文本最小值
  minSize: 2,

  weightFactor: null,

  //  栅格，栅格间距
  gridSize: 4,
  //  画出边界
  drawOutOfBound: false,

  //  画折罩
  drawMask: false,

  maskColor: "rgb(0,0,0,.2)",
  maskGapWidth: 0.3,

  minRotation: -Math.PI / 2,
  maxRotation: Math.PI / 2,
  rotationSteps: Math.PI / 36,

  //  当前文字是旋转的概率
  rotateRatio: 1 - 0.618,

  //  0、1纯扁，
  ellipticity: 0.618
};
const pointsAtRadius = {};

/*✅实际在网格上绘制文本*/
function drawText(ctx, gx, gy, info, word, weight, distance, theta, rotateDeg) {
  //  获取用于设置ctx的fontWeight。字体和字体样式规则
  const mu = info.mu;
  //在打乱当前状态之前保存当前状态
  ctx.save();
  ctx.scale(1 / mu, 1 / mu);
  // 支持阴影
  ctx.font = settings.fontWeight + " " + (info.fontSize * mu).toString(10) + "px " + settings.fontFamily;
  ctx.fillStyle = settings.color[(settings.color.length * Math.random()) | 0];
  //  将画布位置转换为文本应该放置的原始坐标。
  ctx.translate((gx + info.gw / 2) * settings.gridSize * mu, (gy + info.gh / 2) * settings.gridSize * mu);
  //  旋转是必须的
  //  console.log('rotateDeg',rotateDeg)
  ctx.rotate(-rotateDeg);
  ctx.textBaseline = "middle";
  ctx.fillText(word, info.fillTextOffsetX * mu, (info.fillTextOffsetY + info.fontSize * 0.5) * mu);
  //恢复状态。
  ctx.restore();
}

//  updateGrid的帮助函数
function fillGridAt(elementsCtx, x, y, drawMask, grid, ngx, ngy) {
  if (x >= ngx || y >= ngy || x < 0 || y < 0) {
    return;
  }
  grid[x][y] = false;

  if (drawMask) {
    //  临时对象
    const maskRectWidth = settings.gridSize - settings.maskGapWidth;
    elementsCtx.fillRect(x * settings.gridSize, y * settings.gridSize, maskRectWidth, maskRectWidth);
  }
}

//  用占位点更新给定空间的填充信息。如有必要，在画布上画出蒙版。
function updateGrid(elementsCtx, gx, gy, gw, gh, info, grid, ngx, ngy) {
  const occupied = info.occupied;
  if (settings.drawMask) {
    elementsCtx.save();
    elementsCtx.fillStyle = settings.maskColor;
  }
  let i = occupied.length;
  while (i--) {
    const px = gx + occupied[i][0];
    const py = gy + occupied[i][1];
    if (px >= ngx || py >= ngy || px < 0 || py < 0) {
      continue;
    }
    // console.log(grid, ngx, ngy);
    fillGridAt(elementsCtx, px, py, settings.drawMask, grid, ngx, ngy);
  }
  if (settings.drawMask) {
    elementsCtx.restore();
  }
}

//  ✅   难点
function drawItem(elementsCtx, item, grid, ngx, ngy) {
  if (!item) {
    return;
  }

  //  实际上把文本放到画布上
  drawText(
    elementsCtx,
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
  updateGrid(elementsCtx, item.gx, item.gy, item.gw, item.gh, item.info, grid, ngx, ngy);
}

//  确定给定维度中是否有可用空间
function canFitText(gx, gy, gw, gh, occupied, grid, ngx, ngy) {
  //遍历已占用点，如果空间不可用则返回false。
  let i = occupied.length;
  while (i--) {
    let px = gx + occupied[i][0];
    let py = gy + occupied[i][1];

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
}

//  ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️根据设定得到旋转的程度，和运气
function getRotateDeg() {
  // console.log(settings.rotateRatio)
  if (settings.rotateRatio === 0) {
    return 0;
  }
  if (Math.random() > settings.rotateRatio) {
    return 0;
  }

  //  规范化旋转设置
  const rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
  const rotationSteps = Math.abs(Math.floor(settings.rotationSteps));
  const minRotation = Math.min(settings.maxRotation, settings.minRotation);

  if (rotationRange === 0) {
    return minRotation;
  }

  if (rotationSteps > 0) {
    //  最小旋转数+ 0或更多步数*一步的跨度
    return minRotation + (Math.floor(Math.random() * rotationSteps) * rotationRange) / (rotationSteps - 1);
  } else {
    return minRotation + Math.random() * rotationRange;
  }
}

//  在网格上取距离中心半径一定的点,    todo    这里可以优化radius
function getPointsAtRadius(radius, center) {
  //  console.log('radius',radius);
  if (pointsAtRadius[radius]) {
    return pointsAtRadius[radius];
  }
  const points = [];
  if (radius === 0) {
    points.push([center[0], center[1], 0]);
  }
  //  在每个半径上查找这些点的数量
  const T = radius * 8;
  //  得到这个半径上的所有点
  let t = T;
  while (t--) {
    points.push([
      center[0] + radius * Math.cos((-t / T) * 2 * Math.PI),
      center[1] + radius * Math.sin((-t / T) * 2 * Math.PI) * settings.ellipticity,
      (t / T) * 2 * Math.PI
    ]);
  }
  pointsAtRadius[radius] = points;
  return points;
}

function WordCloud(elements, options, maskCanvas) {
  // 获取像素比
  const getPixelRatio = () => 2;
  const elementsCtx = elements.getContext("2d");
  const elementsRatio = getPixelRatio(elementsCtx);

  const _this = this;
  this.words = [];

  //  ⚠️⚠️⚠️⚠️更新参数 属性
  if (options) {
    for (const key in options) {
      if (key in settings) {
        settings[key] = options[key];
      }
    }
  }

  /* 所有函数可用的信息/对象，在start()时设置 */
  let grid, // 包含填充信息的2d数组
    ngx,
    ngy, // 网格的宽度和高度
    center, // 云中心的位置
    maxRadius;

  //  获取文本信息
  function getTextInfo(word, weight, rotateDeg) {
    //  计算实际字体大小
    // fontSize === 0表示权重因子函数希望跳过文本，
    // size < minSize表示无法绘制文本。
    let fontSize = settings.weightFactor(weight);
    if (fontSize <= settings.minSize) {
      return false;
    }

    const mu = 1;
    const fontWeight = settings.fontWeight;

    let fcanvas = document.createElement("canvas");
    document.body.appendChild(fcanvas);
    const fctx = fcanvas.getContext("2d", { willReadFrequently: true });

    fctx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + settings.fontFamily;

    // 量大小
    const fw = (fctx.measureText(word).width / mu) | 0;
    const fh = (Math.max(fontSize * mu, fctx.measureText("m").width, fctx.measureText("\uFF37").width) / mu) | 0;

    //  创建一个比我们估计的更大的边界框，这样文本就不会被删除(它仍然可能)
    let boxWidth = fw + fh * 2;
    let boxHeight = fh * 3;
    const fgw = Math.ceil(boxWidth / settings.gridSize);
    const fgh = Math.ceil(boxHeight / settings.gridSize);
    boxWidth = fgw * settings.gridSize;
    boxHeight = fgh * settings.gridSize;

    //  ❤️❤️❤️❤️❤️❤️❤️
    //  计算适当的偏移量，使文本位于首选位置的中心。

    //  这只是宽度的一半。
    let fillTextOffsetX = -fw / 2;
    //  不将方框移动到首选位置的精确中间位置，而是将y偏移量移动0.4，因此拉丁字母看起来垂直居中。
    let fillTextOffsetY = -fh * 0.4;
    // console.log(fillTextOffsetX, fw)

    //  计算画布的实际尺寸，考虑旋转。
    let cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) + boxHeight * Math.abs(Math.cos(rotateDeg))) / settings.gridSize);
    let cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) + boxHeight * Math.abs(Math.sin(rotateDeg))) / settings.gridSize);
    // console.log(cgw, boxWidth);
    // console.log(cgh, boxHeight);
    // console.log( cgw, boxWidth)
    let width = cgw * settings.gridSize;
    let height = cgh * settings.gridSize;

    //  将画布设置为这么大
    fcanvas.setAttribute("width", width);
    fcanvas.setAttribute("height", height);

    // 用|mu|缩放画布。
    fctx.scale(1 / mu, 1 / mu);
    fctx.translate((width * mu) / 2, (height * mu) / 2);
    fctx.rotate(-rotateDeg);

    //  一旦宽度/高度设置好，ctx信息将被重置。在这里再次设置。
    fctx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + settings.fontFamily;

    //将文本填充到fcanvas中。
    // XXX:我们不能因为textBaseline = 'top'这里因为
    // Firefox和Chrome使用不同的默认行高画布。
    //请阅读https://bugzil.la/737852#c6。
    //这里，我们使用textBaseline = 'middle'，并在精确位置绘制文本
    // 0.5 * fontSize lower。
    fctx.fillStyle = "#000";
    fctx.textBaseline = "middle";
    // console.log(fillTextOffsetX * mu,(fillTextOffsetY + fontSize * 0.5) * mu)
    fctx.fillText(word, fillTextOffsetX * mu, (fillTextOffsetY + fontSize * 0.5) * mu);

    const imageData = fctx.getImageData(0, 0, width, height).data;

    //  ❤️❤️❤️❤️❤️❤️
    //  读取像素并将信息保存到占用的数组中
    let occupied = [];
    let gx = cgw,
      gy,
      x,
      y;
    const bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
    while (gx--) {
      gy = cgh;
      while (gy--) {
        y = settings.gridSize;
        singleGridLoop: {
          while (y--) {
            x = settings.gridSize;
            while (x--) {
              if (imageData[((gy * settings.gridSize + y) * width + (gx * settings.gridSize + x)) * 4 + 3]) {
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
                  fctx.fillRect(gx * settings.gridSize, gy * settings.gridSize, settings.gridSize - 0.5, settings.gridSize - 0.5);
                }
                break singleGridLoop;
              }
            }
          }
          if (true) {
            fctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            fctx.fillRect(gx * settings.gridSize, gy * settings.gridSize, settings.gridSize - 0.5, settings.gridSize - 0.5);
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
  }

  //  处理列表中的每一项，计算它的大小，确定它的位置，实际上把它放在画布上。
  function putWord(item, i) {
    let word,
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
    const rotateDeg = getRotateDeg();

    //  ❤️❤️❤️❤️❤️❤️❤️❤️
    const info = getTextInfo(word, weight, rotateDeg);

    //  如果drawOutOfBound设置为false，如果我们已经知道word的边框大于画布，则跳过循环。
    if (!settings.drawOutOfBound) {
      const bounds = info.bounds;
      if (!bounds) {
        return false;
      }
      if (bounds[1] - bounds[3] + 1 > ngx || bounds[2] - bounds[0] + 1 > ngy) {
        return false;
      }
    }

    //  通过查找最近的点来确定文本的位置
    let r = maxRadius + 1;

    function tryToPutWordAtPoint(gxy, index, info, grid, ngx, ngy) {
      const gx = Math.floor(gxy[0] - info.gw / 2);
      const gy = Math.floor(gxy[1] - info.gh / 2);
      const gw = info.gw;
      const gh = info.gh;
      //  如果我们不能在这个位置放入文本，返回false并到下一个位置。
      if (!canFitText(gx, gy, gw, gh, info.occupied, grid, ngx, ngy)) {
        return false;
      }
      const wordItem = {
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

      //实际上把文字放在画布上
      return wordItem;
    }

    while (r--) {
      const points = getPointsAtRadius(maxRadius - r, center);
      //  试着看每一个点来匹配单词。
      //  array.some()将停止并在putWordAtPoint()返回true时返回true。
      //  如果所有点都返回false，则array.some()返回false。
      let drawn;
      for (let i = 0; i < points.length; i++) {
        let drawnItem = tryToPutWordAtPoint(points[i], index, info, grid, ngx, ngy);
        if (drawnItem) {
          drawn = drawnItem;
          break;
        }
      }
      if (drawn) {
        return drawn;
      }
    }
    // we tried all distances but text won't fit, return false
    return false;
  }

  //  开始在画布上画画  只执行一次✅
  function start() {
    //  对于维数，clearCanvas等，我们只关心第一个元素。
    console.log(111);
    ngx = Math.ceil(maskCanvas.width / settings.gridSize);
    ngy = Math.ceil(maskCanvas.height / settings.gridSize);

    console.log("寻找空间的最大半径");
    //  确定词云的中心
    center = [ngx / 2, ngy / 2];

    //  寻找空间的最大半径
    maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
    //  只在设置了clearCanvas时清除画布，如果没有，则更新网格到当前画布状态
    grid = [];

    let gx, gy, i;

    const bgPixel = [255, 255, 255, 255];

    //  读取画布的像素，我们要告诉画布的哪个部分是空的。
    const imageData = maskCanvas.getContext("2d").getImageData(0, 0, ngx * settings.gridSize, ngy * settings.gridSize).data;
    gx = ngx;
    let x, y;
    while (gx--) {
      grid[gx] = [];
      gy = ngy;
      while (gy--) {
        y = settings.gridSize;
        singleGridLoop: while (y--) {
          x = settings.gridSize;
          while (x--) {
            i = 4;
            while (i--) {
              if (imageData[((gy * settings.gridSize + y) * ngx * settings.gridSize + (gx * settings.gridSize + x)) * 4 + i] !== bgPixel[i]) {
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
    let timer = window.requestAnimationFrame(function loop() {
      if (i >= settings.list.length) {
        //  结束
        clearTimeout(timer);
        return;
      }

      // 方文字
      const drawn = putWord(settings.list[i], i);
      //  画元素
      drawItem(elementsCtx, drawn, grid, ngx, ngy);
      i++;
      timer = requestAnimationFrame(loop);
    });

    elements.width = elements.width * elementsRatio;
    elements.height = elements.height * elementsRatio;
    elementsCtx.scale(elementsRatio, elementsRatio);
  }

  start();
  return this;
}

//  ✅，计算边缘
function updateCanvasMask(shapeCanvas, maskCanvas) {
  let bgPixel = [255, 255, 255, 255];
  console.log("bgPixel", bgPixel);
  let maskCanvasScaled = document.createElement("canvas");
  maskCanvasScaled.width = maskCanvas.width;
  maskCanvasScaled.height = maskCanvas.height;
  let ctx = maskCanvasScaled.getContext("2d");

  ctx.drawImage(shapeCanvas, 0, 0, shapeCanvas.width, shapeCanvas.height, 0, 0, maskCanvasScaled.width, maskCanvasScaled.height);
  console.log("shapeCanvas是图形一样大的canvas", shapeCanvas);
  console.log("maskCanvas是用户期望的大小", maskCanvas);
  console.log("这里是把图形拉伸或压缩到和用户期望的大小一样");
  console.log(maskCanvas);

  //  创建一个新的、空的
  const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const newImageData = ctx.createImageData(imageData);
  for (let i = 0; i < imageData.data.length; i += 4) {
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

function B2wordcloud(element, options) {
  this._wrapper = element;
  this._wrapper.style.position = "relative";
  this._maskCanvas = document.createElement("canvas");
  document.body.appendChild(this._maskCanvas);
  this._container = document.createElement("canvas");
  this._wrapper.appendChild(this._container);
  this._options = options;
  this._shapeCanvas = null;

  //
  this._setCanvasSize(this._maskCanvas);
  this._setCanvasSize(this._container);
  //  执行一次
  this._fixWeightFactor(this._options);
  this._maskImage();
}

B2wordcloud.prototype = {
  _fixWeightFactor: function(option) {
    //  排序
    option.list = option.list.sort((a, b) => {
      return b[1] - a[1];
    });
    //  用于渲染的
    option.maxFontSize = 24;
    option.minFontSize = 2;
    const max = option.list[0][1];
    const min = option.list[option.list.length - 1][1];
    console.log("min", min);
    console.log("max", max);
    //  映射最大最小值大关系
    option.weightFactor = function(val) {
      const subDomain = max - min;
      const subRange = option.maxFontSize - option.minFontSize;
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
  },
  _setCanvasSize(target) {
    const width = this._wrapper.clientWidth;
    const height = this._wrapper.clientHeight;
    target.width = width;
    target.height = height;
    target.style.width = width + "px";
    target.style.height = height + "px";
  },
  _maskImage() {
    const img = window.document.createElement("img");
    img.crossOrigin = "Anonymous";
    img.src = this._options.maskImage;
    img.onload = () => {
      this._shapeCanvas = document.createElement("canvas");
      this._shapeCanvas.width = img.width;
      this._shapeCanvas.height = img.height;
      const ctx = this._shapeCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, this._shapeCanvas.width, this._shapeCanvas.height);
      const newImageData = ctx.createImageData(imageData);
      for (let i = 0; i < imageData.data.length; i += 4) {
        let tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
        let alpha = imageData.data[i + 3];

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
      updateCanvasMask(this._shapeCanvas, this._maskCanvas);
      new WordCloud(this._container, this._options, this._maskCanvas, false);
    };
  }
};
