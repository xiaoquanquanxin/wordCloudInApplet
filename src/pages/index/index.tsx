import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import logoImg from "../../assets/logo.png";
import "./index.scss";

const loadImage = (
  canvas: any,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) => {
  const image = canvas.createImage();
  image.src = logoImg;

  image.onload = () => {
    // 将图片绘制到 canvas 上
    ctx.drawImage(image, 0, 0, w, h);
  };
};

const CanvasJob = () => {
  const [imgInfo, setImgInfo] = useState();
  useEffect(() => {}, []);
  useEffect(() => {
    console.clear();
    console.log(logoImg);
    Taro.nextTick(() => {
      wx.createSelectorQuery()
        .select("#chart")
        .fields({ node: true, size: true })
        .exec(res => {
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          console.log("imgInfo---", imgInfo);
          loadImage(canvas, ctx, res[0].width, res[0].height);
        });
    });
  }, []);
  return (
    <View>
      <canvas type="2d" className={"chart"} canvas-id={"chart"} id={"chart"} />
    </View>
  );
};

export default CanvasJob;
