---
name: cover-page
description: 个人展示页封面 - 双 canvas 粒子背景 + 四面体鼠标跟随 + 鱼骨箭头
metadata:
  type: project
  owner: 高明源 Allen
  status: completed
  lastModified: 2026-09-26
---

# 个人展示页封面 - 设计文档

## 1. 项目概述

**目标**：为计算机 + 金融双学位、VEX 机器人世界冠军得主高明源（Allen）构建的个人展示页封面。

**核心理念**：科技感 + 简洁几何风格，用深色背景衬托发光粒子与线框效果，暗示技术能力与精密感。

**方案**：封面和主页各有一块 canvas 运行相同的粒子动画，翻页时封面连同其 canvas 一起移走，主页 canvas 继续运行。

---

## 2. 页面结构

```
body
├── .cover (position:fixed, z-index:100)  # 封面主体
│   ├── #cover-canvas (position:absolute, z-index:0)  # 封面专属 canvas
│   ├── .avatar-wrapper                    # 头像
│   ├── .name-wrapper                      # 中英文名
│   ├── .tags                              # 散落标签
│   └── .bottom-click-zone (position:absolute)  # 底部点击区
├── .main-content (z-index:3)
│   ├── #main-canvas (position:fixed, z-index:50)  # 主页 canvas
│   └── .section#about                     # 主页内容
```

### 2.1 各层 z-index

| 元素 | z-index | 作用 |
|------|---------|------|
| #cover-canvas | 0 | 在 cover 内部，封面粒子效果 |
| .cover | 100 | 完全覆盖视口，封面移走后消失 |
| .bottom-click-zone | 在 cover 内部 | 跟随 cover 一起移走 |
| #main-canvas | 50 | 固定覆盖全站，主页 canvas 持续运行 |
| .main-content | 3 | 主页内容，藏在 cover 后面 |

---

## 3. 核心实现：双 canvas 方案

### 3.1 为什么需要两个 canvas

参考 LZY 项目使用双 canvas 的方案。封面和主页需要各自独立的粒子效果，互不干扰：

- **封面 canvas**（`#cover-canvas`）：在 `.cover` 内部，翻页时连同封面一起移走（`translateY(-100%)`）
- **主页 canvas**（`#main-canvas`）：`position: fixed z-index:50`，翻页后继续运行，粒子漂浮在主页内容上方

### 3.2 翻页机制

**触发**：点击 `.bottom-click-zone`

**动画**：
- `.cover`：`translateY(-100%)` + opacity 0，向上滑出（0.8s）
- 封面内的 `#cover-canvas` 跟随 cover 一起移走，不需要单独处理
- `.main-content`：opacity 0→1 淡入，delay 0.4s

**关键 CSS**：
```css
.cover {
  position: fixed;  /* 完全脱离文档流，盖住整个视口 */
  inset: 0;
  z-index: 100;
  background-color: #0a0a0a;  /* 必须有实色背景才能挡住主页 */
}
```

---

## 4. 视觉元素详解

### 4.1 Canvas 粒子背景（双 canvas 通用）

**粒子行为**：
- 数量：桌面端 50 个，移动端（屏幕宽<600px）30 个
- 每个粒子带随机速度 `(xa, ya)`，碰壁反弹
- 粒子与鼠标/其他粒子之间距离 < max(6000) 时画连线
- **鼠标斥力**：距离鼠标足够远（`dist >= max/2`）时，粒子被轻微推离

**连线样式**：
```javascript
ctx.strokeStyle = 'rgba(0,217,255,' + (alpha + 0.2) + ')';
ctx.lineWidth = alpha / 2;
```

### 4.2 四面体鼠标跟随

**构成**：4 个点组成四面体线框
- **1 个锚点（anchor）**：紧随鼠标 lerp(factor=0.3)
- **3 个自由点（p1/p2/p3）**：围绕锚点做布朗运动 + 速度限制 + 距离约束

**关键参数**：
```javascript
MAX_DIST = 80;
speed上限 = 2;
布朗运动 = (Math.random() - 0.5) * 0.5;
```

**视觉效果**：
- 所有连线：白色半透明底色 + 青色发光叠加两层绘制
- 锚点：青色实心圆，半径 4px，强发光（shadowBlur:14）
- 自由点：青色实心圆，半径 2.5px，弱发光

### 4.3 散落标签

**位置**：围绕头像周围，绝对定位在 500×400 的容器内
```
.tag-1: 左上，rotate(-8deg)   → "VEX 世界冠军"
.tag-2: 右上，rotate(6deg)    → "Python · C · SQL"
.tag-3: 左下，rotate(10deg)   → "计算机 + 金融"
.tag-4: 右下，rotate(-5deg)   → "雅思 7.5"
```
入场动画依次延迟 0.5s/0.7s/0.9s/1.1s 产生错落出现效果。

### 4.4 底部点击区 - 鱼骨箭头

**布局**（在 cover 内部，`position: absolute`）：
```
.bottom-click-zone（absolute，底部，高度 20vh）
├── .enter-text              # "点击进入"
└── .fish-bone（flex column，gap:4px）
    ├── SVG v 箭头 × 4       # 细线折角 chevron
    └── ...
```

**箭头 SVG**：
```html
<polyline points="2,2 10,10 18,2"/>
```

**颜色动画**：紫→蓝→粉→橙→白，每个箭头 animation-delay 依次错开 0.1s。

---

## 5. 主页背景

翻页后主页露出来，主页背景使用蓝紫渐变，与封面纯黑略有区别但保持整体暗色基调：

```css
.main-content {
  background: linear-gradient(135deg, #0f0f22 0%, #131020 30%, #0d0c1a 60%, #0a0a18 100%);
}
```

---

## 6. 已知坑与解决方案

| 问题 | 原因 | 解决 |
|------|------|------|
| 主页内容显示在封面下方（竖排排列） | `.cover` 使用 `position: relative`，占据文档流空间 | 改用 `position: fixed; inset: 0` |
| 封面不能完全遮挡主页 | `.cover` 没有背景色，是透明的 | 添加 `background-color: #0a0a0a` |
| canvas 遮挡主页内容 | 单一 canvas z-index 太高，覆盖所有内容 | 双 canvas 方案：封面 canvas 在 cover 内部随封面移走，主页 canvas z-index 50 |
| 主页背景看不出和封面的区别 | gradient 颜色太浅 | 调深 gradient 到 `#0f0f22 ~ #0a0a18` |
| 四面体自由点聚拢成一团 | 缺乏布朗运动驱散 | 每帧添加 `(Math.random()-0.5)*0.5` 速度扰动 |

---

## 7. 文件清单

```
suggest/
├── index.html      # 页面结构（封面 + 主页 + 双 canvas）
├── styles.css      # 所有样式 + 动画
├── script.js       # 双 canvas 粒子系统 + 四面体 + 翻页逻辑
├── assets/
│   └── imgs/head.png  # 头像图片
└── skills/
    └── cover-page.md  # 本文档
```

---

## 8. 下次继续开发

**待完成**：
- 主页 `.main-content` 内容填充（关于我、教育背景、项目经历等 section）
- 主页的 canvas 粒子效果（当前已实现，z-index 50 固定覆盖）

**代码复用注意事项**：
- `script.js` 中 `(function(){...})()` 包裹确保不污染全局命名空间
- CSS 变量集中在 `:root`，修改 `--accent-color` 可全局换色
- 双 canvas 共用相同的粒子绘制函数 `drawParticles()` 和四面体绘制函数 `drawTetrahedron()`
- resize 时 `createParticles()` + `initTetra()` 需要同步重置
- z-index 层级：`#cover-canvas`（0）< `.cover`（100）< `#main-canvas`（50）< 内容层（3 但被 cover 盖住）
