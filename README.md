# 白洞

## 空间化、离散、不断膨胀的留言板

> 0.88: 新增子世界功能，过去的世界在子世界 2021 中；新增坐标传送；新增静音；随便调整了音乐，变得更好或更差了；其他不知名调整；

### 简介

白洞 是一个空间化的留言板。你可以在里留下会说话的像素物体。它们会发出声音，然后飘走。

### 说明

#### 1. 世界的运转方式

中心是现在，距离是时间。新创建的对象出现在世界中心，已有对象随时间推移和密度增加向外扩散。

#### 2. 对象的参数

- 形象：对象的样子。
  点击画布上方的＋可以画动画。
  默认提供 8 种颜料，创建对象有几率获得一次性的特殊颜料。

- 对话：对象说的话。每句话之间用回车分割。
  没有对话的物体对空间密度影响较小。
  （欢迎批量生产宇宙垃圾）

- 名字：默认为？？？，给对象取名字消耗便签。

- 链接：消耗箱子让对象携带一个网址（url）。

- 体积：决定对象的大小。设置为 M 以上 消耗肥料。

- 深度：
  决定对象在 z 轴的位置，近快远慢。
  设置 0.4~0.8 或 1.2~1.6 需要消耗镜片。
  可以用这个参数模拟前景和背景。

- 音色（未实装）：
  决定对象发出的音色。

#### 3. 程序化音乐（beta）

背景音乐是根据空间里的对象生成的。

旋律对象（深度 <= 1）：有不同的音高、音色、时值、位置，随时间推移演变。

和声对象（深度 > 1）：有不同的音域、音色。根据每天随机生成的和弦进行演奏和弦音。

对象的音色和音高会受对象的参数影响。

### 平台/版本

- 网页版：[地址 1](lcl.onrender.com)
- 将网页安装为 PWA（网页应用）
  - Chrome 等浏览器会自动弹出安装提示。你也可以点击本页面顶部的 “安装到桌面” 按钮安装。
  - IOS 在 Safari 中点击 `分享 - 添加到主屏幕` 可以将本应用安装到主屏。

- [Github 仓库](https://github.com/john-walks-slow/lcl)
- [报告 BUG / 提建议](https://github.com/john-walks-slow/lcl/issues/new)

### 特别感谢

本项目的像素画板是基于[jvalen/pixel-art-react](https://github.com/jvalen/pixel-art-react)修改的

(MIT Copyright © 2016 Javier Valencia Romero)

### Changelog

#### [详细版：https://github.com/john-walks-slow/lcl/blob/master/history.md](https://github.com/john-walks-slow/lcl/blob/master/history.md)

- 0.88：新增子世界功能，过去的世界在子世界 2021 中；新增坐标传送；新增静音；随便调整了音乐，变得更好或更差了；其他不知名调整；
- 0.86: ...
- 0.85: 程序化音乐差不多可以听了（使用采样音源，扩展Sampler支持多通道输出避免重复创建实例，重写Panner，动态调整的效果器、淡入淡出） 很多的性能优化（解决了像素画板断断续续、走着走着卡一下等问题） 重做界面（世界坐标、圆形遮罩）
- 0.8: 初步完成程序化音乐 重做 ui 设置 M 以下及一级深度不消耗道具 离线可用 重构代码 解决很多 bug
- 0.7: 新增道具功能 新增超链接功能 新增 PWA 支持 优化缓存机制 重做加载界面 优化数值
- 0.6: 迁移到 MongoDB 基本功能可用
