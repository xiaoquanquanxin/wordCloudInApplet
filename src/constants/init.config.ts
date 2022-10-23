// 默认值将被options对象覆盖
const _OPTIONS: OptionsType = {
  //  颜色
  color: ["rgb(0,200,0)", "rgb(200,0,0)", "rgb(200,200,0)", "rgb(200,0,200)", "rgb(0,0,200)", "rgb(0,200,200)"],
  //  字重

  fontWeight: "normal",
  //  字体
  fontFamily: "Arial",

  //  用于渲染的-文本最小值
  minFontSize: 2,
  //  用于渲染的-文本最大值
  maxFontSize: 24,

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

  //  图片地址
  maskImage: "./logo.png",

  //  0、1纯扁，0.5最圆
  ellipticity: 0.618,

  //  👇👇👇动态载入的
  list: [],
  dpr: 0
};

//  当前半径上的点
const pointsAtRadius: PointsAtRadiusType = {};

export { pointsAtRadius, _OPTIONS };
