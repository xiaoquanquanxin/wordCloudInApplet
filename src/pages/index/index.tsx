import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { InitCanvas } from "../../utils/init";

import "./index.scss";

const IndexPage = () => {
  const [textChartSize, setTextChartSize] = useState({ width: 100, height: 100 });
  const [mainChartSize, setMainChartSize] = useState({ width: 750, height: 400 });

  useEffect(() => {
    console.clear();
    Taro.nextTick(async () => {
      const [originData, mainChart, textChart] = await Promise.all([
        //    加载数据
        new Promise(resolve => {
          resolve(import("../../data/originData.json"));
        }),
        //  绘制用的canvas
        new Promise(resolve => {
          wx.createSelectorQuery()
            .select("#main-chart")
            .fields({ node: true, size: true })
            .exec(async res => resolve(res[0].node));
        }),
        //  文本用的canvas
        new Promise(resolve => {
          wx.createSelectorQuery()
            .select("#text-chart")
            .fields({ node: true, size: true })
            .exec(async res => resolve(res[0].node));
        })
      ]);

      const initCanvas = new InitCanvas(mainChart, (originData as any).default, setMainChartSize, textChart, setTextChartSize);
      console.log(initCanvas);
    });
  }, []);
  return (
    <View>
      <Canvas type="2d" style={mainChartSize} className={"chart"} id="main-chart" />
      <Canvas type="2d" style={textChartSize} id="text-chart" />
    </View>
  );
};

export default IndexPage;
