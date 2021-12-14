# 白洞 / LCL
## 空间化、离散、不断膨胀的留言板

>0.8: 初步完成程序化音乐 解决很多bug 重做ui 设置M以下及一级深度不消耗道具 离线可用 重构代码
### 简介

白洞是一个只发射、不吸收的时空区域。你可以在这里留下像素东西（意识碎片）。它们会发出声音，然后飘走。

### 规则

1. 不沟通（不与兔子沟通）

2. 不关心别人

3. 保持独立、保持距离、保持自由

4. 违反规则我会引爆核弹 :fire:

### 说明

现在是中心，时间是距离。每次创建东西有几率得到颜料，有几率在世界中生成道具。

### 音乐（beta）

背景音乐是根据空间里的东西生成的。

旋律东西：有不同的音高、音色、时值、位置，每若干小节重复

和声东西（深度 > 1）：有不同的音域、音色。根据每天随机生成的和弦进行演奏和弦音

东西的音色和音高会受东西的参数影响。
### 链接

- [地址1](https://lcl.yu-me.workers.dev) [地址2](https://lcl-web.herokuapp.com)
- 安卓版（开发中）
- PC版（开发中）
- 网页应用版
  - Chrome等浏览器会自动弹出安装提示。你也可以点击本页面顶部的 “安装到桌面” 按钮安装。
  - IOS 在Safari中点击 ```分享 - 添加到主屏幕``` 可以将本应用安装到主屏。
- [Github 仓库](https://github.com/john-walks-slow/lcl)
- [报告BUG/建议](https://github.com/john-walks-slow/lcl/issues/new)



### 待办事项

##### 当前版本
- [x] :fire: 字体加载超级慢，更换字体
- [x] :art: 调整UI色值，与色板吻合
- [x] :art: 重新设计Add Page
- [x] :art: 重新设计pixel editor，布局更合理，大屏下工具栏横置，简化画布操作
- [x] :bug: frames drag&drop / scrollbar 重叠
- [x] :bug: canvas和preview像素间白边
- [x] :bug: 创建game前未更新屏幕坐标
- [x] :bug: Add Page改变屏幕大小导致坐标偏移
- [x] :bug: Inventory reducer未及时更新
- [x] :bug: 扩大canvas时按钮位移
- [x] :sparkles: 重新设计颜料色板，默认赠送8色，奖励颜色从64色中抽取
- [x] 增加分辨率设置，优化item大小
- [ ] :bug: 程序化音乐start time 报错
- [ ] :package: 安卓版开发（！）
- [ ] :sparkles: 尝试粒子
- [ ] :sparkles: 恒定的坐标系统
- [ ] :musical_note: 不难听的程序化音乐
  - [ ] :musical_note: 试试不同音色
  - [ ] :musical_note: 调整混音
  - [ ] :musical_note: 性能优化
  - [ ] :musical_note: 试试不同算法

##### 今后
- [ ] :package: PC版开发

### Changelog 
##### [详细版：https://github.com/john-walks-slow/lcl/blob/master/history.md](https://github.com/john-walks-slow/lcl/blob/master/history.md)
- 0.8: 初步完成程序化音乐 重做ui 设置M以下及一级深度不消耗道具 离线可用 重构代码 解决很多bug
- 0.7: 新增道具功能 新增超链接功能 新增PWA支持 优化缓存机制 重做加载界面 优化数值 
- 0.6: 迁移到MongoDB 基本功能可用

### 我为什么做这个？

有一天我玩了很久游戏，洗碗的时候我在想我是不是可以做游戏。

如果做游戏，我一定要在游戏里留下一点自己的痕迹，我也希望玩家可以在游戏里留下他们的痕迹，那不如创造一个大家可以随便留下痕迹的地方。

我对这里的设想是一个“共享的梦空间”，把大家脑袋里的想象放在同一个世界里会不会有趣？