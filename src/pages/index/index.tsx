import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { calcCanvas, loadImage, renderText } from "../../utils/core";

import "./index.scss";

const IndexPage = () => {
  const [imgInfo, setImgInfo] = useState();
  useEffect(() => {}, []);
  useEffect(() => {
    console.clear();
    Taro.nextTick(() => {
      wx.createSelectorQuery()
        .select("#chart-temp")
        .fields({ node: true, size: true })
        .exec(async res => {
          const canvas = res[0].node;
          const ctx = calcCanvas(canvas);
          await loadImage(canvas, ctx, canvas.width, canvas.height);
          renderText(canvas, ctx, "一二三四五十");
        });
    });
  }, []);
  return (
    <View>
      {/*<Canvas type="2d" className={"chart"} id={"chart"}/>*/}
      <Canvas type="2d" className={"chart"} id={"chart-temp"} />
    </View>
  );
};

export default IndexPage;
