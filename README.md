# LCL / 意识海
## 空间化、离散、不断膨胀的留言板

>0.75: 重构代码，大量细节优化，触屏增加虚拟手柄
### 简介

这里是LCL，你可以在这个空间里留下会说话的像素物体，探索其他人创造的物体。

### 规则

1. 不与别人沟通

    1.2 不与兔子沟通

2. 不要关心别人

3. 保持独立、保持距离、保持自由

如果违反会引爆核弹。

### 说明

这个空间会不断膨胀，新加入的对象出现在世界中心附近，现有对象会随时间流逝以及世界密度的增加向外圈漂移。这里可以容纳10000000个以上的对象。

每次创建对象时有几率得到颜料，世界中会生成道具。使用道具和颜料可以创造更加独特的对象。

### 我为什么做这个？

有一天我玩了很久游戏，洗碗的时候我在想我是不是可以做游戏。

如果做游戏，我一定要在游戏里留下一点自己的痕迹，我也希望玩家可以在游戏里留下他们的痕迹，那不如创造一个大家可以随便留下痕迹的地方。

我对这里的设想是一个“共享的梦空间”，把大家脑袋里的想象放在同一个世界里会不会有趣呢？

### 链接

- [地址1](https://lcl.yu-me.workers.dev) [地址2](https://lcl-web.herokuapp.com)
- 安卓版（开发中）
- PC版（开发中）
- 网页应用版
  - Chrome等浏览器会自动弹出安装提示。你也可以点击本页面顶部的 “安装到桌面” 按钮安装。
  - IOS 在Safari中点击 ```分享 - 添加到主屏幕``` 可以将本应用安装到主屏。
- [Github 仓库](https://github.com/john-walks-slow/lcl)

### 程序化音乐

对象分为旋律对象和和声对象
旋律对象：
有自己固定的音、时值、位置，每若干小节重复
和声对象
根据同一节奏奏响和弦的不同音
和声重复若干次后会变化
- 生成和声
- 每个和声对象根据和声节奏弹奏和音

### TODO


- [ ] :art: 重做滤镜
- [ ] :fire: 重构ui
- [ ] :sparkles: ui可以隐藏
- [ ] :art: 重做ui
- [ ] :package: 安卓版开发
- [ ] :package: 上架安卓市场
- [ ] :package: PC版开发
- [x] :sparkles: 重写渲染算法（pixel perfect）
- [ ] :sparkles: 发言前检测用户是否阅读本文档
- [ ] :musical_note: 调整音量
- [ ] :musical_note: 试试音色
- [ ] :musical_note: 性能优化
- [ ] :musical_note: 试试算法
- [ ] :bug: resize问题
- [ ] :art: 重做颜色
- [x] :art: 调整响应式布局
- [x] :books: 优化README
- [x] :bug: link dialog 隐藏虚拟键盘
- [x] :fire: 重构Configurations
- [x] :fire: 重构GenerativeMusic
- [x] :fire: 重构ObjectData
- [x] :sparkles: 道具生成率降低，道具大小减少
- [x] :sparkles: 更好的报错界面
- [x] :sparkles: 键盘快捷键 
- [x] :sparkles: 降低道具重要性，深度-2~2不消耗镜片
- [x] :sparkles: 优化自动转屏逻辑
- [x] :sparkles: Generative Music
- [x] :wrench: 调整数值
- [x] :wrench: 设置M以下不需要肥料
- [x] :wrench: 使用history api优化后退键
- [x] :wrench: 提高服务器安全性
- [x] :wrench: ui 事件优化

### Changelog
- 0.7: 新增道具功能 新增超链接功能 新增PWA支持 优化缓存机制 重做加载界面 优化数值 
- 0.6: 迁移到MongoDB 基本功能可用
