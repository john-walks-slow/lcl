# LCL / 意识海

## 空间化、离散、不断膨胀的留言板

> 0.8: 初步完成程序化音乐 解决很多 bug 重做 ui 设置 M 以下及一级深度不消耗道具 离线可用 重构代码

### 简介

LCL 是一个空间化的留言板。你可以在里留下会说话的像素物体。它们会发出声音，然后飘走。

### 规则

1. 不沟通

2. 不关心别人

3. 保持独立、保持距离、保持自由

4. 违反规则我会引爆核弹 :fire:

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

#### 3. 程序化音乐（beta）

背景音乐是根据空间里的对象生成的。

旋律对象（深度 <= 1）：有不同的音高、音色、时值、位置，每若干小节重复

和声对象（深度 > 1）：有不同的音域、音色。根据每天随机生成的和弦进行演奏和弦音。

对象的音色和音高会受对象的参数影响。

### 平台/版本

- 网页版：[地址 1](https://lcl.yu-me.workers.dev) [地址 2](https://lcl-web.herokuapp.com)
- 将网页安装为 PWA（网页应用）
  - Chrome 等浏览器会自动弹出安装提示。你也可以点击本页面顶部的 “安装到桌面” 按钮安装。
  - IOS 在 Safari 中点击 `分享 - 添加到主屏幕` 可以将本应用安装到主屏。
- 安卓版（开发中）
- PC 版（开发中）

- [Github 仓库](https://github.com/john-walks-slow/lcl)
- [报告 BUG / 提建议](https://github.com/john-walks-slow/lcl/issues/new)

### 特别感谢

本项目的像素画板是基于[jvalen/pixel-art-react](https://github.com/jvalen/pixel-art-react)修改的

(MIT Copyright © 2016 Javier Valencia Romero)

### 待办事项

##### 当前版本

- [ ] :bug: 程序化音乐 start time 报错
- [ ] :musical_note: 不难听的程序化音乐
  - [ ] :musical_note: 试试不同音色
  - [ ] :musical_note: 调整混音
  - [ ] :musical_note: 性能优化
  - [ ] :musical_note: 试试不同算法
- [ ] :wrench: 调试参数
- [ ] :sparkles: 恒定的坐标系统
- [x] :sparkles: 现在只有视野范围内的对象会根据 zfactor 更新坐标
- [ ] :shirt: 邀请第一批用户
- [ ] :package: 安卓版开发（！）
- [x] :sparkles: 尝试粒子（否决，用户可以自行创建粒子）
- [x] :fire: 字体加载超级慢，更换字体
- [x] :sparkles: 重新设计颜料色板，默认赠送 8 色，奖励颜色从 64 色中抽取
- [x] :sparkles: undo redo 现在会以一次完整的操作为单位
- [x] :sparkles: 分辨率自适应，优化 item 大小
- [x] :sparkles: 没有对话的对象不增加空间密度，会更快飘走，不会生成道具和颜料
- [x] :sparkles: 深度不为 1 的对象不会挡路
- [x] :art: 新图标
- [x] :art: 调整 UI 色值，与色板吻合
- [x] :art: 重新设计 Add Page
- [x] :art: 重新设计 pixel editor，布局更合理，大屏下工具栏横置，简化画布操作
- [x] :bug: frames drag&drop / scrollbar 重叠
- [x] :bug: canvas 和 preview 像素间白边
- [x] :bug: 创建 game 前未更新屏幕坐标
- [x] :bug: Add Page 改变屏幕大小导致坐标偏移
- [x] :bug: Inventory reducer 未及时更新
- [x] :bug: 扩大 canvas/选择颜料时按钮位移
- [x] :bug: 连续点击 map 相机卡死
- [x] :fire: 拒绝“白洞”这个名字，白洞是一个只发射，不吸收的时空区域。白洞更真，意识海更有指向性。

##### 今后

- [ ] :package: PC 版开发
- [ ] :sparkles: i18n
- [ ] :sparkles: 自动翻译
- [ ] :shirt: SEO

### Changelog

##### [详细版：https://github.com/john-walks-slow/lcl/blob/master/history.md](https://github.com/john-walks-slow/lcl/blob/master/history.md)

- 0.8: 初步完成程序化音乐 重做 ui 设置 M 以下及一级深度不消耗道具 离线可用 重构代码 解决很多 bug
- 0.7: 新增道具功能 新增超链接功能 新增 PWA 支持 优化缓存机制 重做加载界面 优化数值
- 0.6: 迁移到 MongoDB 基本功能可用

### 我为什么做这个？

有一天我玩了很久游戏，洗碗的时候我在想我是不是可以做游戏。

如果做游戏，我一定要在游戏里留下一点自己的痕迹，我也希望玩家可以在游戏里留下他们的痕迹，那不如创造一个大家可以随便留下痕迹的地方。

我对这里的设想是一个“共享的梦空间”，把大家脑袋里的想象放在同一个世界里会不会有趣？
