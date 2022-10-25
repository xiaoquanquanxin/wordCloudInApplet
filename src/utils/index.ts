//  放大绘画比例，使得更清晰
import { pointsAtRadius } from "../constants/init.config";

function ZoomRenderRatio(initCanvas: InitCanvasType) {
  const { options, canvas, setMainChartSize } = initCanvas;
  const dpr = options.dpr;
  const { width, height } = canvas;
  // console.log(initCanvas);
  console.log(width, height, dpr);
  //  放大
  // setMainChartSize({ width: width * dpr, height: height * dpr });
  // initCanvas.ctx.scale(dpr, dpr);
}

//  ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️根据设定得到旋转的程度，和运气
function getRotateDeg(options: OptionsType): number {
  return 0;
  if (options.rotateRatio === 0) {
    return 0;
  }
  if (Math.random() > options.rotateRatio) {
    return 0;
  }

  //  规范化旋转设置
  const rotationRange = Math.abs(options.maxRotation - options.minRotation);
  const rotationSteps = Math.abs(Math.floor(options.rotationSteps));
  const minRotation = Math.min(options.maxRotation, options.minRotation);

  if (rotationRange === 0) {
    return minRotation;
  }

  if (rotationSteps > 0) {
    //  最小旋转数+ 0或更多步数*一步的跨度
    return minRotation + (Math.floor(Math.random() * rotationSteps) * rotationRange) / (rotationSteps - 1);
  } else {
    return minRotation + Math.random() * rotationRange;
  }
}

export { ZoomRenderRatio, getRotateDeg };

//  确定给定维度中是否有可用空间
function canFitText(drawOutOfBound: boolean, gx, gy, occupied, grid, ngx, ngy) {
  //遍历已占用点，如果空间不可用则返回false。
  let i = occupied.length;
  while (i--) {
    let px = gx + occupied[i][0];
    let py = gy + occupied[i][1];

    if (px >= ngx || py >= ngy || px < 0 || py < 0) {
      if (!drawOutOfBound) {
        return false;
      }
      continue;
    }

    if (!grid[px][py]) {
      return false;
    }
  }
  return true;
}

//  尝试放入文字，到点位
function tryToPutWordAtPoint(
  words: Array<WordItemType>,
  gxy: PointsType,
  index: number,
  info,
  grid: number,
  ngx: number,
  ngy: number,
  word: string,
  weight: number,
  item,
  rotateDeg: number,
  drawOutOfBound: boolean
): WordItemType | false {
  const gx = Math.floor(gxy[0] - info.gw / 2);
  const gy = Math.floor(gxy[1] - info.gh / 2);

  // console.log('入参⬇️')
  // console.log('gxy',gxy)
  // console.log('index',index)
  // console.log('info',info)
  // console.log('grid',grid)
  // console.log('ngx',ngx)
  // console.log('ngy',ngy)
  // console.log('入参⬆️')

  //  如果我们不能在这个位置放入文本，返回false并到下一个位置。
  if (!canFitText(drawOutOfBound, gx, gy, info.occupied, grid, ngx, ngy)) {
    return false;
  }
  const wordItem: WordItemType = {
    gx,
    gy,
    info,
    word,
    weight,
    item,
    rotateDeg,
    i: index
  };
  words.push(wordItem);

  //实际上把文字放在画布上
  return wordItem;
}

export { tryToPutWordAtPoint };

//  在网格上取距离中心半径一定的点,    todo    这里可以优化radius
function getPointsAtRadius(radius: number, ellipticity: number, center: CenterType): [PointsType] {
  // console.log("center", center);
  //  console.log('radius',radius);
  if (pointsAtRadius[radius]) {
    return pointsAtRadius[radius];
  }
  //  @ts-ignore
  const points: [PointsType] = [];
  if (radius === 0) {
    points.push([center[0], center[1], 0]);
  }
  //  在每个半径上查找这些点的数量
  const T = radius * 8;
  //  得到这个半径上的所有点
  let t = T;
  while (t--) {
    points.push([
      center[0] + radius * Math.cos((-t / T) * 2 * Math.PI),
      center[1] + radius * Math.sin((-t / T) * 2 * Math.PI) * ellipticity,
      (t / T) * 2 * Math.PI
    ]);
  }
  pointsAtRadius[radius] = points;
  return points;
}

export { getPointsAtRadius };

//  计算格子的数据
const calcGridData = (
  //  图片原数据
  newImageData: ImageData,
  //  列
  ngx: number,
  //  行
  ngy: number,
  //  格子大小
  gridSize: number
): Array<Array<boolean>> => {
  const grid: Array<Array<boolean>> = [];
  const bgPixel = 255;
  let y: number;
  let x: number;
  let i: number;
  let gx: number = ngx;
  let gy: number;
  while (gx--) {
    grid[gx] = [];
    gy = ngy;
    while (gy--) {
      y = gridSize;
      grid[gx][gy] = true;
      singleGridLoop: while (y--) {
        x = gridSize;
        while (x--) {
          i = 4;
          while (i--) {
            const key = ((gy * gridSize + y) * ngx * gridSize + (gx * gridSize + x)) * 4 + i;
            const value = newImageData.data[key];
            if (value === undefined) {
              debugger;
            }
            if (value !== bgPixel) {
              grid[gx][gy] = false;
              break singleGridLoop;
            }
          }
        }
      }
    }
  }
  return grid;
};

export { calcGridData };

//  获得 gridSize 的整数倍
const gridSizeTimes = (gridSize: number, value: number): number => {
  return Math.ceil(value / gridSize) * gridSize;
};

export { gridSizeTimes };
