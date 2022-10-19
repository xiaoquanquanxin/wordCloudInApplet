import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { calcCanvas, loadImage } from "../../utils/core";

import "./index.scss";
import { renderText } from "../../utils/fctx";

const IndexPage = () => {
  // const [imgInfo, setImgInfo] = useState();

  const [textChartSize, setTextChartSize] = useState({
    width: 100,
    height: 100
  });
  useEffect(() => {}, []);
  useEffect(() => {
    console.clear();
    Taro.nextTick(() => {
      wx.createSelectorQuery()
        .select("#main-chart")
        .fields({ node: true, size: true })
        .exec(async res => {
          const canvas = res[0].node;
          const ctx = calcCanvas(canvas);
          await loadImage(canvas, ctx, canvas.width, canvas.height);
        });
      wx.createSelectorQuery()
        .select("#text-chart")
        .fields({ node: true, size: true })
        .exec(async res => {
          const canvas = res[0].node;
          renderText(canvas, "一二三四五sss", setTextChartSize);
        });
    });
  }, []);
  return (
    <View>
      {/*<Canvas type="2d" className={"chart"} id={"chart"}/>*/}
      <Canvas type="2d" className={"chart"} id="main-chart" />
      <Canvas type="2d" style={textChartSize} id="text-chart" />
      <View>在这里⬆️⬆️⬆️⬆️</View>
    </View>
  );
};

export default IndexPage;
