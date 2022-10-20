import { Dispatch, SetStateAction } from "react";

import Taro from "@tarojs/taro";
import { fontFamily, fontSize, g, ngxData } from "../constants/init.config";

//  像素比例
const { pixelRatio } = Taro.getSystemInfoSync();

//  文本渐变
const getTextGradient = (ctx, fontHeight): void => {
  const gradient = ctx.createLinearGradient(0, 0, 0, fontHeight);
  gradient.addColorStop(0, "blue");
  gradient.addColorStop(1, "red");
  ctx.fillStyle = gradient;
};

//  计算文本大小
const getFontSize = (text: string, fontSize: number, fontFamily: string): { fontWidth: number; fontHeight: number } => {
  //  测绘用的
  const ctx = Taro.createCanvasContext("ncaa", { willReadFrequently: true });
  ctx.font = `${fontSize}px ${fontFamily}`;

  //  文本宽度
  const fontWidth = ctx.measureText(text).width;
  //  文本高度
  const fontHeight = ctx.measureText("一").width;
  return {
    fontWidth,
    fontHeight
  };
};

//  计算文本盒子尺寸
const getFontBoxSie = (fontWidth: number, fontHeight: number): { boxWidth: number; boxHeight: number } => {
  //  盒子宽度
  const boxWidth = ((fontWidth + g + 2) * pixelRatio) | 0;
  //  盒子高度
  const boxHeight = ((fontHeight + g * 2) * pixelRatio) | 0;
  return {
    boxWidth,
    boxHeight
  };
};

//  核心
const getOccupied = (boxWidth: number, boxHeight: number, ctx: CanvasRenderingContext2D, imageData): any => {
  const cgw = boxWidth;
  const cgh = boxHeight;
  //  读取像素并将信息保存到占用的数组中
  const occupied: Array<[number, number]> = [];
  let gx = cgw;
  let gy: number;
  let x: number;
  let y: number;
  const bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
  while (gx--) {
    gy = cgh;
    while (gy--) {
      y = g;
      singleGridLoop: {
        while (y--) {
          x = g;
          while (x--) {
            if (imageData[((gy * g + y) * boxWidth + (gx * g + x)) * 4 + 3]) {
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
                ctx.fillStyle = "rgba(255, 0, 0, .8)";
                ctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
              }
              break singleGridLoop;
            }
          }
        }
        if (true) {
          ctx.fillStyle = "rgba(0, 0, 255, .8)";
          ctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
        }
      }
    }
  }
  console.log("occupied", occupied);
  console.log("bounds", bounds);

  if (bounds[1] - bounds[3] + 1 > ngxData.ngx || bounds[2] - bounds[0] + 1 > ngxData.ngy) {
    return false;
  }
};

//  与文字相关的canvas上下文
const renderText = (canvas: HTMLCanvasElement, text: string, setTextChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>) => {
  //  计算文本大小
  const { fontWidth, fontHeight } = getFontSize(text, fontSize, fontFamily);
  //  创建上下文
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  }) as CanvasRenderingContext2D;
  const { boxWidth, boxHeight } = getFontBoxSie(fontWidth, fontHeight);
  //  console.log('boxWidth,boxHeight', boxWidth, boxHeight)
  //  设置canvas的尺寸
  setTextChartSize({ width: boxWidth, height: boxHeight });
  canvas.width = boxWidth;
  canvas.height = boxHeight;
  ctx.font = `${fontSize * pixelRatio}px ${fontFamily}`;
  //  文本渐变
  getTextGradient(ctx, fontHeight);
  const diff = g * pixelRatio;
  //  写文本
  ctx.fillText(text, diff, boxHeight - diff);
  const imageData = ctx.getImageData(0, 0, boxWidth, fontHeight).data;
  console.log("imageData", imageData);
  const occupied = getOccupied(boxWidth, boxHeight, ctx, imageData);
  console.log("occupied", occupied);
  // return ctx;
};

export { renderText };
