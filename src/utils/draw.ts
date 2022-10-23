//  updateGrid的帮助函数
function fillGridAt(elementsCtx, options: OptionsType, x, y, drawMask, grid, ngx, ngy) {
  if (x >= ngx || y >= ngy || x < 0 || y < 0) {
    return;
  }
  grid[x][y] = false;

  if (drawMask) {
    //  临时对象
    const maskRectWidth = options.gridSize - options.maskGapWidth;
    elementsCtx.fillRect(x * options.gridSize, y * options.gridSize, maskRectWidth, maskRectWidth);
  }
}

//  用占位点更新给定空间的填充信息。如有必要，在画布上画出蒙版。
function updateGrid(elementsCtx, options: OptionsType, gx, gy, info, grid, ngx, ngy) {
  const occupied = info.occupied;
  if (options.drawMask) {
    elementsCtx.save();
    elementsCtx.fillStyle = options.maskColor;
  }
  let i = occupied.length;
  while (i--) {
    const px = gx + occupied[i][0];
    const py = gy + occupied[i][1];
    if (px >= ngx || py >= ngy || px < 0 || py < 0) {
      continue;
    }
    fillGridAt(elementsCtx, options, px, py, options.drawMask, grid, ngx, ngy);
  }
  if (options.drawMask) {
    elementsCtx.restore();
  }
}

//  ✅   难点
function drawItem(ctx: CanvasRenderingContext2D, options: OptionsType, drawn: WordItemType, grid: number, ngx: number, ngy: number) {
  //  实际上把文本放到画布上
  drawText(ctx, options, drawn.gx, drawn.gy, drawn.info, drawn.word, drawn.rotateDeg);
  //  将网格上的空格标记为已填充
  updateGrid(ctx, options, drawn.gx, drawn.gy, drawn.info, grid, ngx, ngy);
}

export { drawItem };

// ✅实际在网格上绘制文本
function drawText(ctx: CanvasRenderingContext2D, options: OptionsType, gx, gy, info, word, rotateDeg) {
  //  获取用于设置ctx的fontWeight。字体和字体样式规则
  const mu = info.mu;
  //在打乱当前状态之前保存当前状态
  ctx.save();
  ctx.scale(1 / mu, 1 / mu);
  // 支持阴影
  ctx.font = options.fontWeight + " " + (info.fontSize * mu).toString(10) + "px " + options.fontFamily;
  ctx.fillStyle = options.color[(options.color.length * Math.random()) | 0];
  //  将画布位置转换为文本应该放置的原始坐标。
  ctx.translate((gx + info.gw / 2) * options.gridSize * mu, (gy + info.gh / 2) * options.gridSize * mu);
  //  旋转是必须的
  //  console.log('rotateDeg',rotateDeg)
  ctx.rotate(-rotateDeg);
  ctx.textBaseline = "middle";
  ctx.fillText(word, info.fillTextOffsetX * mu, (info.fillTextOffsetY + info.fontSize * 0.5) * mu);
  //恢复状态。
  ctx.restore();
}
