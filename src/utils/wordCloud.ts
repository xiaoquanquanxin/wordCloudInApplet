import Taro from "@tarojs/taro";
import { calcGridData, getPointsAtRadius, getRotateDeg, tryToPutWordAtPoint, ZoomRenderRatio } from "@utils";
import { Dispatch, SetStateAction } from "react";
import { drawItem } from "./draw";

//  词云
function wordCloud(initCanvas: InitCanvasType) {
  const { ctx, options, textChartCtx, words, newImageData, textChartCanvas, setTextChartSize, ngx, ngy, grid } = initCanvas;
  const { list, minFontSize, fontWeight, gridSize, fontFamily, ellipticity, drawOutOfBound, dpr } = options;

  let maxRadius = 0;
  // 云中心的位置
  const center: CenterType = [0, 0];

  const mu = 1;

  //  获取文本信息
  function getTextInfo(word: string, weight: number, rotateDeg: number) {
    //  计算实际字体大小
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

    let boxWidth = fw + fh * 2;
    let boxHeight = fh * 3;
    const fgw = Math.ceil(boxWidth / gridSize);
    const fgh = Math.ceil(boxHeight / gridSize);
    boxWidth = fgw * gridSize;
    boxHeight = fgh * gridSize;

    // console.log(boxWidth)
    // console.log(boxHeight)
    // debugger;

    //  ❤️❤️❤️❤️❤️❤️❤️
    //  计算适当的偏移量，使文本位于首选位置的中心。

    //  这只是宽度的一半。
    const fillTextOffsetX = -fw / 2;
    //  不将方框移动到首选位置的精确中间位置，而是将y偏移量移动0.4，因此拉丁字母看起来垂直居中。
    const fillTextOffsetY = -fh * 0.4;
    // console.log(fillTextOffsetX, fw)

    //  计算画布的实际尺寸，考虑旋转。
    const cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) + boxHeight * Math.abs(Math.cos(rotateDeg))) / gridSize);
    // console.log(cgh);
    const cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) + boxHeight * Math.abs(Math.sin(rotateDeg))) / gridSize);
    // console.log(cgw, boxWidth);
    // console.log(cgh, boxHeight);
    // console.log( cgw, boxWidth)
    const width = cgw * gridSize;
    const height = cgh * gridSize;
    // console.log("width", width);
    // console.log("height", height);
    textChartCanvas.height = height;
    textChartCanvas.width = width;

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
    (() => {
      const x = fillTextOffsetX * mu;
      const y = (fillTextOffsetY + fontSize * 0.5) * mu;
      // console.log('x',x)
      // console.log('y',y)
      textChartCtx.fillText(word, Math.ceil(x), Math.ceil(y));
    })();

    const textCanvasImageData = textChartCtx.getImageData(0, 0, width, height).data;

    //  ❤️❤️❤️❤️❤️❤️
    //  读取像素并将信息保存到占用的数组中
    const occupied: Array<[number, number]> = [];
    let gx: number = cgw;
    let gy: number;
    let x: number;
    let y: number;

    const bounds: [number, number, number, number] = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
    // console.log("bounds", bounds);
    // console.log("gx", gx);
    // console.log("gridSize", gridSize);
    // console.log("cgh", cgh);
    // console.log("cgw", cgw);
    // console.log("textCanvasImageData", JSON.stringify(textCanvasImageData));
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

    // console.log("bounds", bounds);

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
    // console.log("海咲野 ❤️", info.occupied);

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
      // console.log("points", points);
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
    //  todo  这里不对
    // console.log("ngx", ngx);
    // console.log("ngy", ngy);

    console.log("寻找空间的最大半径");
    //  确定词云的中心
    center[0] = ngx / 2;
    center[1] = ngy / 2;

    //  寻找空间的最大半径
    maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
    //  只在设置了clearCanvas时清除画布，如果没有，则更新网格到当前画布状态

    //  todo  需要刷新画布
    return;

    console.log("grid--------", grid);
    //  放大绘画比例，使得更清晰
    ZoomRenderRatio(initCanvas);

    //  console.log('grid', JSON.stringify(grid));

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
          // console.log('出参⬇️')
          // console.log("drawn", drawn);
          // console.log("info", drawn.info);
          // console.log('出参⬆️')
          // return;
          //  画元素
          drawItem(ctx, options, drawn, grid, ngx, ngy);
        }

        //  todo
        // return;

        i++;
        Taro.nextTick(loop);
      });
    })();
  }

  start();
}

export { wordCloud };
