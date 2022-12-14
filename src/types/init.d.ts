//  配置
type OptionsType = {
  //  屏幕宽度
  windowWidth: number;
  //  颜色
  color: Array<string>;
  //  字重
  fontWeight: string;
  //  字体
  fontFamily: string;

  //  用于渲染的-文本最小值
  minFontSize: number;
  //  用于渲染的-文本最大值
  maxFontSize: number;

  //  栅格，栅格间距
  gridSize: number;
  //  画出边界
  drawOutOfBound: boolean;

  //  旋转相关
  minRotation: number;
  maxRotation: number;
  rotationSteps: number;

  //  当前文字是旋转的概率
  rotateRatio: number;

  //  图片地址
  maskImage: "./logo.png";

  //  0、1纯扁，0.5最圆
  ellipticity: 0.618;

  //  数据
  list: List;
  //  最大值
  max: number;
  //  最小值
  min: number;

  //  比例
  dpr: number;

  //  todo 测试用

  //  画折罩
  drawMask: boolean;
  maskColor: string;
  maskGapWidth: number;
};
//  数据
type List = Array<[string, number]>;
//  回调，main-chart 画布大小的调整
// type SetMainChartSizeType  = Dispatch<SetStateAction<{width:number,height:number}>>;
//  初始化canvas
type InitCanvasType = {
  canvas: any;
  //  上下文
  ctx: CanvasRenderingContext2D;
  //  配置
  options: OptionsType;

  //  图片数据
  imageData: ImageData;

  //  回调，main-chart 画布大小的调整
  setMainChartSize: any;

  //  文本 text-chart 相关
  textChartCanvas: any;
  textChartCtx: CanvasRenderingContext2D;
  setTextChartSize: any;

  //  执行相关 🚄🚄
  words: Array<WordItemType>;

  //  格子列数
  ngx: number;
  //  格子行数
  ngy: number;
  //  格子数据
  grid: Array<Array<boolean>>;
};

//  中心点
type CenterType = [number, number];

//  wordItem
type WordItemType = {
  gx: number;
  gy: number;
  info: any;
  word: string;
  weight: number;
  item: any;
  rotateDeg: number;
  i: number;
};

type PointsType = [number, number, number];

//  当前半径上的点
type PointsAtRadiusType = {
  [key: number]: [PointsType];
};
