import { _options } from "./init.config";
import { WordCloud } from "./wordCloud";
import logoImg from "../assets/logo.png";

//  初始化
function InitCanvas(canvas, keywords) {
  const list: Array<Array<number>> = [];
  Reflect.ownKeys(keywords).forEach(index => {
    list.push([index, keywords[index]]);
  });
  const dpr = wx.getSystemInfoSync().pixelRatio;
  this.options = {
    ..._options,
    list,
    dpr
  };

  canvas.width *= dpr;
  canvas.height *= dpr;
  this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  this.canvas = canvas;
  this._shapeCanvas = null;

  //  图片原始数据
  this.imageData = null;
  //  图片处理后的数据
  this.newImageData = null;

  this.init();
  console.log("🔩🔩🔩 options 🔩🔩🔩", this.options);
}

InitCanvas.prototype = {
  constructor: InitCanvas,
  init() {
    (async () => {
      // setCanvasSize(canvas)
      this.getMinMax();
      //  执行一次
      this.fixWeightFactor();
      //  加载图片
      await this.maskImage();
      //  词云
      new WordCloud();
    })();
  },
  //  最大值、最小值
  getMinMax() {
    //  排序
    this.options.list = this.options.list.sort((a, b) => {
      return b[1] - a[1];
    });
    const max = this.options.list[0][1];
    const min = this.options.list[this.options.list.length - 1][1];
    this.options.max = max;
    this.options.min = min;
  },
  //  设置字母权重
  fixWeightFactor() {
    //  映射最大最小值大关系
    this.options.weightFactor = function(val) {
      const { maxFontSize, minFontSize } = this.options;
      const subDomain = this.max - this.min;
      const subRange = maxFontSize - minFontSize;
      if (subDomain === 0) {
        return subRange === 0 ? minFontSize : (minFontSize + maxFontSize) / 2;
      }
      if (val === this.min) {
        return minFontSize;
      }
      if (val === this.max) {
        return maxFontSize;
      }
      return ((val - this.min) / subDomain) * subRange + minFontSize;
    };
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
