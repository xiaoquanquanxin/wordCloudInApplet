import { Component } from "react";
import { View } from "@tarojs/components";
import "./app.scss";
class App extends Component {
  componentDidMount() {
    // 检测版本
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: "温馨提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: "温馨提示",
              content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟"
            });
          });
        }
      });
    } else {
      wx.showModal({
        title: "温馨提示",
        content:
          "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
      });
    }
  }

  render() {
    return <View>{this.props.children}</View>;
  }
}

export default App;
