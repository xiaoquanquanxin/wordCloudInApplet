import { Dispatch, SetStateAction } from "react";
import { _OPTIONS } from "../constants/init.config";
import { wordCloud } from "./wordCloud";
import logoImg from "../assets/logo.png";

//  初始化
const InitCanvas = function(
  canvas,
  keywords,
  setMainChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>,
  textChartCanvas: any,
  setTextChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>
) {
  const dpr = wx.getSystemInfoSync().pixelRatio;
  const { min, max, list } = this.getMinMaxList(keywords);
  this.options = {
    ..._OPTIONS,
    list,
    dpr,
    min,
    max
  };

  canvas.width *= dpr;
  canvas.height *= dpr;
  this.ctx = canvas.getContext("2d", { willReadFrequently: true });
  this.canvas = canvas;
  this._shapeCanvas = null;

  //  图片原始数据
  this.imageData = null;
  //  图片处理后的数据
  this.newImageData = null;

  this.init();
  console.log("🔩🔩🔩 options 🔩🔩🔩", this.options);

  //  回调，main-chart 画布大小的调整
  this.setMainChartSize = setMainChartSize;

  //  文本 text-chart 相关
  this.textChartCanvas = textChartCanvas;
  this.textChartCtx = textChartCanvas.getContext("2d", { willReadFrequently: true });
  this.setTextChartSize = setTextChartSize;

  this.words = [];
};

InitCanvas.prototype = {
  constructor: InitCanvas,
  init() {
    (async () => {
      // setCanvasSize(canvas)
      //  加载图片
      await this.maskImage();
      //  词云
      wordCloud(this);
    })();
  },
  //  最大值、最小值、数据
  getMinMaxList(keywords: { [key: string]: number }): { max: number; min: number; list: List } {
    const _list: List = [];
    Reflect.ownKeys(keywords).forEach((index: string) => {
      _list.push([index, keywords[index]]);
    });
    //  排序
    const list = _list.sort((a, b) => {
      return b[1] - a[1];
    });
    const max = list[0][1];
    const min = list[list.length - 1][1];
    return {
      min,
      max,
      list
    };
  },
  //  设置字母权重
  weightFactor(val: number): number {
    const { maxFontSize, minFontSize, max, min } = this.options;
    const subDomain = max - min;
    const subRange = maxFontSize - minFontSize;
    if (subDomain === 0) {
      return subRange === 0 ? minFontSize : (minFontSize + maxFontSize) / 2;
    }
    if (val === min) {
      return minFontSize;
    }
    if (val === max) {
      return maxFontSize;
    }
    return ((val - min) / subDomain) * subRange + minFontSize;
  },
  //  折罩图片
  async maskImage(): Promise<any> {
    return new Promise(resolve => {
      const image = this.canvas.createImage();
      image.src = logoImg;
      image.onload = () => {
        const { width, height } = this.canvas;
        // 将图片绘制到 canvas 上
        this.ctx.drawImage(image, 0, 0, width, height);
        this.imageData = this.ctx.getImageData(0, 0, width, height);
        //  将图片映射到canvas上
        this.mapImageData();
        this.ctx.putImageData(this.newImageData, 0, 0, 0, 0, width, height);
        resolve(this.newImageData);
      };
    });
  },
  //  将图片映射到canvas上
  mapImageData(): void {
    const newImageData = this.ctx.createImageData(this.imageData);
    for (let i = 0; i < this.imageData.data.length; i += 4) {
      const tone = this.imageData.data[i] + this.imageData.data[i + 1] + this.imageData.data[i + 2];
      const alpha = this.imageData.data[i + 3];
      //  这里直接取反了
      if (alpha < 128 || tone > 128 * 3) {
        newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 0;
        newImageData.data[i + 3] = 255;
      } else {
        newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 255;
        newImageData.data[i + 3] = 255;
      }
    }
    this.newImageData = newImageData;
  }
};

export { InitCanvas };
