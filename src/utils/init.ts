import { Dispatch, SetStateAction } from "react";
import Taro from "@tarojs/taro";
import { _OPTIONS } from "../constants/init.config";
import { wordCloud } from "./wordCloud";
import { calcGridData, getMinMaxList, gridSizeTimes } from "./index";
const logoImg = "http://192.168.199.138:8080/logo.png";

//  初始化
const InitCanvas = function(
  canvas,
  keywords,
  setMainChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>,
  textChartCanvas: any,
  setTextChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>
) {
  const dpr = Taro.getSystemInfoSync().pixelRatio;
  const { min, max, list, minFontSize, maxFontSize } = getMinMaxList(keywords);
  this.options = {
    ..._OPTIONS,
    maxFontSize,
    minFontSize,
    list,
    dpr,
    min,
    max
  };

  this.canvas = canvas;
  this.ctx = canvas.getContext("2d", { willReadFrequently: true });

  //  图片原始数据
  this.imageData = null;

  this.init();
  console.log("🔩🔩🔩 options 🔩🔩🔩", this.options);

  //  回调，main-chart 画布大小的调整
  this.setMainChartSize = setMainChartSize;

  //  文本 text-chart 相关
  this.textChartCanvas = textChartCanvas;
  console.log("//  文本 text-chart 相关", textChartCanvas);
  this.textChartCtx = textChartCanvas.getContext("2d", { willReadFrequently: true });
  this.setTextChartSize = setTextChartSize;

  this.words = [];
};

InitCanvas.prototype = {
  constructor: InitCanvas,
  init() {
    (async () => {
      //  加载图片
      await this.maskImage();
      //  词云
      wordCloud(this);
    })();
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
      image.onload = e => {
        console.log("e", e);
        console.log("logoImg,", logoImg);
        console.log("image", image);
        const { naturalHeight, naturalWidth } = image;
        //  图片宽高比
        const aspectRatio = naturalWidth / naturalHeight;
        console.log("图片宽高比", aspectRatio);
        const { gridSize, windowWidth } = this.options;
        const dpr = windowWidth / naturalWidth;
        const width = gridSizeTimes(gridSize, naturalWidth * dpr);
        const height = gridSizeTimes(gridSize, naturalHeight * dpr);
        this.canvas.width = width;
        this.canvas.height = height;
        console.log("canvas width", width);
        console.log("canvas height", height);
        this.setMainChartSize({ width: width + "px", height: height + "px" });

        const ngx = Math.ceil(width / gridSize);
        const ngy = Math.ceil(height / gridSize);
        this.ngx = ngx;
        this.ngy = ngy;
        console.log("格子数量ngx", ngx);
        console.log("格子数量ngy", ngy);

        // 将图片绘制到 canvas 上
        this.ctx.drawImage(image, 0, 0, width, height);
        this.imageData = this.ctx.getImageData(0, 0, width, height);
        console.log("this.imageData", this.imageData.data.length);
        //  将图片映射到canvas上
        const newImageData = this.mapImageData();
        this.ctx.putImageData(newImageData, 0, 0);
        // console.log("❗️❗️❗️❗️❗️❗️❗️", this.newImageData.data);
        //  读取画布的像素，我们要告诉画布的哪个部分是空的。
        this.grid = calcGridData(newImageData, ngx, ngy, gridSize);
        this.ctx.clearRect(0, 0, width, height);
        // console.log('gird',grid);
        resolve(newImageData);
      };
    });
  },
  //  将图片映射到canvas上
  mapImageData(): ImageData {
    const newImageData = this.ctx.createImageData(this.imageData);
    for (let i = 0; i < this.imageData.data.length; i += 4) {
      const tone = this.imageData.data[i] + this.imageData.data[i + 1] + this.imageData.data[i + 2];
      const alpha = this.imageData.data[i + 3];
      newImageData.data[i + 3] = 255;
      newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = alpha < 128 || tone > 128 * 3 ? 0 : 255;
    }
    return newImageData;
  }
};

export { InitCanvas };
