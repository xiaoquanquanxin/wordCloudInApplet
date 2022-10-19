import { Dispatch, SetStateAction } from "react";

import Taro from "@tarojs/taro";

//  核心间距
const grid = 4;
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
  const fctx = Taro.createCanvasContext("ncaa", { willReadFrequently: true });
  fctx.font = `${fontSize}px ${fontFamily}`;

  //  文本宽度
  const fontWidth = fctx.measureText(text).width;
  //  文本高度
  const fontHeight = fctx.measureText("一").width;
  return {
    fontWidth,
    fontHeight
  };
};

//  计算文本盒子尺寸
const getFontBoxSie = (fontWidth: number, fontHeight: number): { boxWidth: number; boxHeight: number } => {
  //  盒子宽度
  const boxWidth = ((fontWidth + grid + 2) * pixelRatio) | 0;
  //  盒子高度
  const boxHeight = ((fontHeight + grid * 2) * pixelRatio) | 0;
  return {
    boxWidth,
    boxHeight
  };
};

//  与文字相关的canvas上下文
const renderText = (canvas: HTMLCanvasElement, text: string, setTextChartSize: Dispatch<SetStateAction<{ width: number; height: number }>>) => {
  const fontSize = 20;
  const fontFamily = "Arial";
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
  const diff = grid * pixelRatio;
  //  写文本
  ctx.fillText(text, diff, boxHeight - diff);
  // const imageData = ctx.getImageData(0, 0, boxWidth, fontHeight,).data;
  // console.log(imageData);
  return ctx;
};

export { renderText };
