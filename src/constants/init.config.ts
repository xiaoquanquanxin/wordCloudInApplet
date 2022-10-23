//  核心间距
const g = 4;
//  字体大小
const fontSize = 15;
const fontFamily = "Arial";

//  canvas相关数据
const ngxData = {
  ngx: 0,
  ngy: 0,

  //  中心点
  center: [0, 0],
  //  最大半径
  maxRadius: 0
};

export { g, fontSize, ngxData, fontFamily };

// 默认值将被options对象覆盖
const _options = {
  color: ["rgb(0,200,0)", "rgb(200,0,0)", "rgb(200,200,0)", "rgb(200,0,200)", "rgb(0,0,200)", "rgb(0,200,200)"],
  //    必须
  fontWeight: "normal",
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

  //  用于渲染的文本的大小
  maxFontSize: 24,
  minFontSize: 2,

  maskImage: "./logo.png",

  //  0、1纯扁，
  ellipticity: 0.618
};
const pointsAtRadius = {};

export { pointsAtRadius, _options };
