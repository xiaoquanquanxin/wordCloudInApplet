import logoImg from "../assets/logo.png";

//  映射图片成为底图
const mapImageData = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): ImageData => {
  const newImageData = ctx.createImageData(imageData);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const tone =
      imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
    const alpha = imageData.data[i + 3];
    //  todo  这里直接取反了
    if (alpha < 128 || tone > 128 * 3) {
      newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[
        i + 2
      ] = 0;
      newImageData.data[i + 3] = 255;
    } else {
      newImageData.data[i] = newImageData.data[i + 1] = newImageData.data[
        i + 2
      ] = 255;
      newImageData.data[i + 3] = 255;
    }
  }
  // ctx.putImageData(newImageData, 0, 0, 0, 0, w * 2, h * 2);
  return newImageData;
};

//  加载图片
const loadImage = async (
  canvas: any,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): Promise<ImageData> => {
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

//  计算canvas宽度通过dpr
const calcCanvas = (canvas: any): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d");
  const dpr = wx.getSystemInfoSync().pixelRatio;
  canvas.width *= dpr;
  canvas.height *= dpr;
  // ctx.scale()
  return ctx;
};

export { calcCanvas, loadImage };
