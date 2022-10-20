import logoImg from "../assets/logo.png";
import { g, ngxData } from "../constants/init.config";
import Taro from "@tarojs/taro";

//  映射图片成为底图
const mapImageData = (ctx: CanvasRenderingContext2D, imageData: ImageData): ImageData => {
  const newImageData = ctx.createImageData(imageData);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
    const alpha = imageData.data[i + 3];
    //  todo  这里直接取反了
    if (alpha < 128 || tone > 128 * 3) {
      newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 0;
      newImageData.data[i + 3] = 255;
    } else {
      newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[i + 2] = 255;
      newImageData.data[i + 3] = 255;
    }
  }
  // ctx.putImageData(newImageData, 0, 0, 0, 0, w * 2, h * 2);
  return newImageData;
};

//  加载图片
const loadImage = async (canvas: any, ctx: CanvasRenderingContext2D, w: number, h: number): Promise<ImageData> => {
  return new Promise(resolve => {
    const image = canvas.createImage();
    image.src = logoImg;
    image.onload = () => {
      // 将图片绘制到 canvas 上
      ctx.drawImage(image, 0, 0, w, h);
      const imageData = mapImageData(ctx, ctx.getImageData(0, 0, w, h));
      ctx.putImageData(imageData, 0, 0, 0, 0, w, h);
      resolve(imageData);
    };
  });
};

//  设置这个值
const setNgxData = (canvas, ctx) => {
  const ngx = Math.ceil(canvas.width / g);
  const ngy = Math.ceil(canvas.height / g);
  // 确定词云的中心
  ngxData.center = [ngx / 2, ngy / 2];
  //  最大半径
  ngxData.maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
  /*只在设置了clearCanvas时清除画布，如果没有，则更新网格到当前画布状态*/
  ctx.fillStyle = "rgb(0,255,0)";
  // ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
  // ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));

  ngxData.ngx = ngx;
  ngxData.ngy = ngy;

  const bgPixel = [255, 255, 255, 255];

  //  读取画布的像素，我们要告诉画布的哪个部分是空的。
  const imageData = ctx.getImageData(0, 0, ngx * g, ngy * g).data;

  const grid: Array<Array<any>> = [];
  let gx = ngx;
  let gy = 0;
  let x;
  let y;
  let i;
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
  console.log("grid", grid);
};

//  计算canvas宽度通过dpr
const calcCanvas = (canvas: any): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d");
  const dpr = wx.getSystemInfoSync().pixelRatio;
  canvas.width *= dpr;
  canvas.height *= dpr;
  setNgxData(canvas, ctx);
  return ctx;
};

export { calcCanvas, loadImage };
