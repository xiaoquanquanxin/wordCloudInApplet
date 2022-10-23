import Taro from "@tarojs/taro";
import { getPointsAtRadius, getRotateDeg, tryToPutWordAtPoint, ZoomRenderRatio } from "@utils";
import { Dispatch, SetStateAction } from "react";
import { drawItem } from "./draw";

//  词云
function wordCloud(initCanvas: InitCanvasType) {
  const { ctx, options, textChartCtx, words, newImageData, setTextChartSize } = initCanvas;
  const { list, minFontSize, fontWeight, gridSize, fontFamily, ellipticity, drawOutOfBound } = options;

  //  所有函数可用的信息/对象，在start()时设置

  // 包含填充信息的2d数组
  let grid;
  // 网格的宽度和高度
  let ngx = 0;
  let ngy = 0;

  let maxRadius = 0;
  // 云中心的位置
  const center: CenterType = [0, 0];

  const mu = 1;

  //  获取文本信息
  function getTextInfo(word: string, weight: number, rotateDeg: number) {
    //  计算实际字体大小
    // fontSize === 0表示权重因子函数希望跳过文本，
    // size < minSize表示无法绘制文本。
    const fontSize = initCanvas.weightFactor(weight);
    //  console.log("fontSize", fontSize);
    //  console.log("minFontSize", minFontSize);
    if (fontSize <= minFontSize) {
      return null;
    }

    textChartCtx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + fontFamily;

    // 量大小
    const fw = (textChartCtx.measureText(word).width / mu) | 0;
    const fh = (Math.max(fontSize * mu, textChartCtx.measureText("m").width, textChartCtx.measureText("\uFF37").width) / mu) | 0;

    const fgw = Math.ceil(fw + (fh * 2) / gridSize);
    const fgh = Math.ceil((fh * 3) / gridSize);
    //  创建一个比我们估计的更大的边界框，这样文本就不会被删除(它仍然可能)
    const boxWidth = fgw * gridSize;
    const boxHeight = fgh * gridSize;

    //  ❤️❤️❤️❤️❤️❤️❤️
    //  计算适当的偏移量，使文本位于首选位置的中心。

    //  这只是宽度的一半。
    const fillTextOffsetX = -fw / 2;
    //  不将方框移动到首选位置的精确中间位置，而是将y偏移量移动0.4，因此拉丁字母看起来垂直居中。
    const fillTextOffsetY = -fh * 0.4;
    // console.log(fillTextOffsetX, fw)

    //  计算画布的实际尺寸，考虑旋转。
    const cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) + boxHeight * Math.abs(Math.cos(rotateDeg))) / gridSize);
    const cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) + boxHeight * Math.abs(Math.sin(rotateDeg))) / gridSize);
    // console.log(cgw, boxWidth);
    // console.log(cgh, boxHeight);
    // console.log( cgw, boxWidth)
    const width = cgw * gridSize;
    const height = cgh * gridSize;

    //  设置文本canvas宽高
    (setTextChartSize as Dispatch<SetStateAction<{ width: number; height: number }>>)({ width, height });

    // 用|mu|缩放画布。
    textChartCtx.scale(1 / mu, 1 / mu);
    textChartCtx.translate((width * mu) / 2, (height * mu) / 2);
    textChartCtx.rotate(-rotateDeg);

    //  一旦宽度/高度设置好，ctx信息将被重置。在这里再次设置。
    textChartCtx.font = fontWeight + " " + (fontSize * mu).toString(10) + "px " + fontFamily;

    //  将文本填充到fcanvas中。
    textChartCtx.fillStyle = "#000";
    textChartCtx.textBaseline = "middle";
    // console.log(fillTextOffsetX * mu,(fillTextOffsetY + fontSize * 0.5) * mu)
    textChartCtx.fillText(word, fillTextOffsetX * mu, (fillTextOffsetY + fontSize * 0.5) * mu);

    const textCanvasImageData = textChartCtx.getImageData(0, 0, width, height).data;

    //  ❤️❤️❤️❤️❤️❤️
    //  读取像素并将信息保存到占用的数组中
    const occupied: Array<[number, number]> = [];
    let gx: number = cgw;
    let gy: number;
    let x: number;
    let y: number;

    const bounds: [number, number, number, number] = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
    while (gx--) {
      gy = cgh;
      while (gy--) {
        y = gridSize;
        singleGridLoop: {
          while (y--) {
            x = gridSize;
            while (x--) {
              if (textCanvasImageData[((gy * gridSize + y) * width + (gx * gridSize + x)) * 4 + 3]) {
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
                  textChartCtx.fillStyle = "rgba(255, 0, 0, 0.5)";
                  textChartCtx.fillRect(gx * gridSize, gy * gridSize, gridSize - 0.5, gridSize - 0.5);
                }
                break singleGridLoop;
              }
            }
          }
          if (true) {
            textChartCtx.fillStyle = "rgba(0, 0, 255, 0.5)";
            textChartCtx.fillRect(gx * gridSize, gy * gridSize, gridSize - 0.5, gridSize - 0.5);
          }
        }
      }
    }

    // console.log('word',word);
    // console.log('occupied',occupied);

    //返回在真实画布上创建文本所需的信息
    return {
      mu,
      occupied,
      bounds,
      fontSize,
      fillTextOffsetX,
      fillTextOffsetY,
      gw: cgw,
      gh: cgh,
      fillTextWidth: fw,
      fillTextHeight: fh
    };
  }

  //  处理列表中的每一项，计算它的大小，确定它的位置，实际上把它放在画布上。
  function putWord(item, _i: number): WordItemType | false {
    //  文本
    const word: string = item[0];
    //  权重
    const weight: number = item[1];
    //  旋转角度
    const rotateDeg: number = getRotateDeg(options);

    //  获取文本信息
    const info = getTextInfo(word, weight, rotateDeg);

    //  如果drawOutOfBound设置为false，如果我们已经知道word的边框大于画布，则跳过循环。
    if (!initCanvas.options.drawOutOfBound) {
      const bounds = info?.bounds;
      if (!bounds) {
        return false;
      }
      if (bounds[1] - bounds[3] + 1 > ngx || bounds[2] - bounds[0] + 1 > ngy) {
        return false;
      }
    }

    //  通过查找最近的点来确定文本的位置
    let r = maxRadius + 1;

    while (r--) {
      const points = getPointsAtRadius(maxRadius - r, ellipticity, center);
      //  试着看每一个点来匹配单词。
      //  array.some()将停止并在putWordAtPoint()返回true时返回true。
      //  如果所有点都返回false，则array.some()返回false。
      let drawn;
      for (let i = 0; i < points.length; i++) {
        const drawnItem = tryToPutWordAtPoint(words, points[i], _i, info, grid, ngx, ngy, word, weight, item, rotateDeg, drawOutOfBound);
        if (drawnItem) {
          // return drawnItem;
          //  todo  将来回来试一试
          drawn = drawnItem;
          break;
        }
      }
      if (drawn) {
        return drawn;
      }
    }
    //我们尝试了所有的距离，但文本不适合，返回false
    return false;
  }

  //  开始在画布上画画  只执行一次✅
  function start() {
    //  对于维数，clearCanvas等，我们只关心第一个元素。
    ngx = Math.ceil(initCanvas.canvas.width / gridSize);
    ngy = Math.ceil(initCanvas.canvas.height / gridSize);

    console.log("寻找空间的最大半径");
    //  确定词云的中心
    center[0] = ngx / 2;
    center[1] = ngy / 2;

    //  寻找空间的最大半径
    maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
    //  只在设置了clearCanvas时清除画布，如果没有，则更新网格到当前画布状态
    grid = [];

    let gx;
    let gy;

    const bgPixel = [255, 255, 255, 255];

    //  读取画布的像素，我们要告诉画布的哪个部分是空的。

    gx = ngx;
    let x, y;
    let i = 0;
    while (gx--) {
      grid[gx] = [];
      gy = ngy;
      while (gy--) {
        y = gridSize;
        singleGridLoop: while (y--) {
          x = gridSize;
          while (x--) {
            i = 4;
            while (i--) {
              if (newImageData.data[((gy * gridSize + y) * ngx * gridSize + (gx * gridSize + x)) * 4 + i] !== bgPixel[i]) {
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

    //  放大绘画比例，使得更清晰
    ZoomRenderRatio(initCanvas);

    //  ------------------------------遍历每一个文字------------------------------
    (() => {
      let i = 0;
      Taro.nextTick(function loop() {
        if (i >= list.length) {
          //  结束
          return;
        }

        //  方文字
        const drawn = putWord(list[i], i);
        if (drawn) {
          //  console.log("drawn", drawn);
          //  画元素
          drawItem(ctx, options, drawn, grid, ngx, ngy);
        }

        i++;
        Taro.nextTick(loop);
      });
    })();
  }

  start();
}

export { wordCloud };
