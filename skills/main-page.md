---
name: main-page
description: 个人展示页主页 - 内容框架与美术要求
metadata:
  type: project
  owner: 高明源 Allen
  status: completed
  lastModified: 2026-09-26
  tags: [css, gradient-text, artistic-text]
---

# 个人展示页主页 - 设计文档

## 1. 页面框架

```
01 关于（ABOUT）
02 教育背景（EDUCATION）
03 经历（EXPERIENCE）
04 技能（SKILLS）
05 联系（CONTACT）
```

无照片墙，VEX 视频后续挖掘后单独处理。

---

## 2. 各版块内容

### 01 关于（ABOUT）

**布局**：头部名片区 + 内容区块

头部名片区结构：
- 左侧头像（120×120，border 用 accent 色）
- 中间名字 + 身份定位
- 右侧 slogan 语录框（背景半透明 + 左侧 accent 色竖线）

内容区块：
- 教育背景 label + 主线 + 课程 tag
- 经历 label + 多个 about-item（时间 + 角色 + 描述）

### 02 教育背景（EDUCATION）

- edu-main：大标题（华东理工大学 · 双学位）
- edu-sub + edu-tags：课程 tag 列表

### 03 经历（EXPERIENCE）

- exp-item：时间 + 角色 + 描述，左侧竖线

### 04 技能（SKILLS）

- skills-grid：2 列 card
- skill-card：label + skill-tag 列表

### 05 联系（CONTACT）

- contact-list：竖排 contact-item（label + value）

---

## 3. 右侧导航索引

**定位**：固定在页面右侧，垂直居中

**结构**：
```
.nav-index
  └── .nav-slider（整体联动滑动）
       ├── .nav-handle（触发按钮，始终可见）
       └── .nav-list（导航列表，hover 展开）
```

**交互**：
- 默认：整体向右收拢，只露出 handle
- hover `.nav-index`：整个 slider 向左滑出，露出完整 list
- 点击 nav-item：平滑滚动到对应 section，收起面板
- 滚动时：根据 `getBoundingClientRect` 计算当前可见 section，自动高亮

**显示控制**：封面阶段隐藏（opacity:0），`goToMain()` 时添加 `.visible` 显示

---

## 4. 粒子背景

**方案**：与封面共用一套粒子系统，canvas z-index:50 覆盖全站

**效果**（博客园风格）：
- 粒子随机游走，碰壁反弹
- 鼠标作为特殊粒子（max:18000），吸引范围内粒子靠近
- 连线透明度随距离衰减

**参数**：
- 桌面端 50 个粒子，移动端 30 个
- `mouse.max = 18000`，粒子 `max = 6000`
- 斥力强度 `0.03`（距离 >= max/2 时生效）

---

## 5. 美术规范

### 5.1 颜色

| 变量 | 值 | 用途 |
|------|----|------|
| `--bg-color` | `#0a0a0a` | 封面背景 |
| `--text-color` | `#ffffff` | 正文 |
| `--accent-color` | `#00d9ff` | 强调色（青） |

### 5.2 背景

```css
.main-content {
  background: linear-gradient(135deg, #0f0f22 0%, #131020 30%, #0d0c1a 60%, #0a0a18 100%);
}
```

### 5.3 字体

- 中文名：`28px`，letter-spacing: 2px
- 英文名：`16px`，color: rgba(255,255,255,0.5)
- slogan：KaiTi/楷体，18px
- 正文：16px，color: rgba(255,255,255,0.7)

### 5.4 Section 标题

```css
.section-title { display: flex; gap: 12px; align-items: baseline; }
.section-no { font-size: 14px; color: accent; font-family: Consolas, monospace; }
.section-name { font-size: 22px; font-weight: 600; letter-spacing: 2px; }
```

---

## 6. 技术记录

### 6.1 双 canvas 架构

封面和主页各有一块 canvas 运行相同的粒子动画：
- 封面 canvas 在 `.cover` 内部，随 cover 一起移走
- 主页 canvas `position:fixed, z-index:50`，翻页后持续运行

### 6.2 导航 active 状态检测

改用 `getBoundingClientRect().top` 比较方案，替代 IntersectionObserver：
- 取所有 section 中 `Math.abs(rect.top)` 最小的为当前 active
- 滚动时被动触发，避免平滑滚动过程中多个 section 反复触发

### 6.3 导航 hover 展开

CSS hover 触发，JS 只负责 `.visible` 的显示/隐藏，不控制展开收起

### 6.4 渐变色艺术字（Gradient Text）

**实现原理**：利用 `background-clip: text` 将渐变背景裁剪到文字区域，配合 `color: transparent` 显示渐变。

**参考来源**：LZY 项目 `.section-head h1 span` 的实现。

**CSS 关键写法**：
```css
.about-slogan {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;                    /* 粗体字重 */
  background: linear-gradient(135deg, var(--accent-color), #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

**注意事项**：
- 必须同时写 `-webkit-background-clip: text` 和 `background-clip: text`（兼容性）
- `color: transparent` 是让文字变透明的关键，否则会遮挡渐变
- 字号和字重建议与 LZY 保持一致（`font-weight: 800`，`clamp` 响应式），视觉效果才够粗壮
- 渐变角度 `135deg` 可调整方向，青紫渐变是安全的配色方案

---

## 7. 文件清单

```
suggest/
├── index.html      # 页面结构
├── styles.css      # 样式
├── script.js       # 双 canvas 粒子系统 + 导航逻辑
├── assets/
│   └── imgs/head.png  # 头像
└── skills/
    ├── cover-page.md  # 封面设计文档
    └── main-page.md   # 本文档
```

---

## 7. 已实现功能（2026-09-27）

### 7.1 CSS 变量系统

**Google Fonts 引入**：
- `DM Sans` / `Fraunces` / `JetBrains Mono` / `Noto Sans SC` / `Noto Serif SC` / `ZCOOL XiaoWei`

**CSS 变量**：
```css
:root {
  /* 配色 */
  --bg: #0f0820;
  --bg-color: #0a0a0a;
  --bg-2: #160d20;
  --accent-color: #00d9ff;
  --accent-2: #9e59ee;
  --orange: #ff6b35;

  /* 字体 */
  --font-display: 'Fraunces', 'Noto Serif SC', Georgia, serif;
  --font-sans: 'DM Sans', 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --font-cn: 'ZCOOL XiaoWei', 'Noto Serif SC', sans-serif;

  /* 字号阶梯 */
  --fs-h1: clamp(28px, 4vw, 44px);
  --fs-h2: clamp(24px, 3.5vw, 36px);
  --fs-h3: clamp(20px, 2.5vw, 28px);
  --fs-body: 15px;
  --fs-small: 13px;
}
```

### 7.2 滚动揭示动画

IntersectionObserver 滚动揭示 + data-delay 错峰：
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s, transform 0.8s;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal[data-delay="1"] { transition-delay: 0.1s; }
/* ... */
```

### 7.3 交互细节优化

- 项目/联系卡片 hover：`translateY(-6px)` + 发光 box-shadow 扩散动画
- 技能卡片 hover：`translateY(-4px)` + 边框发光
- 教育标签 hover：`translateY(-3px)` + 阴影增强
- 技能条入场动画：`.reveal.is-visible` 时宽度从 0 动画展开

### 7.4 导航 active 状态检测（修复）

改用 scrollY 精确计算，替代 rect.top 绝对值方案：
```javascript
var scrollY = window.scrollY;
var headerOffset = 56 + 40; // 导航高度 + 余量
// 遍历 sections，找到 scrollY 在范围内的 section
```

### 7.5 数字滚动动画

```javascript
// IntersectionObserver 触发 countUp
// ease-out cubic 缓动，1400ms 动画时长
```

---

## 8. 待完成事项

| 项目 | 状态 | 说明 |
|------|------|------|
| 粒子分布均匀性 | 待优化 | 粒子在鼠标周围分布优化 |
| 右侧导航 contact 项 hover 区域 | 待修复 | 列表展开时鼠标移到下方 item 会超出 hover 区域 |
| VEX 视频链接 | 待挖掘 | 展柜/照片墙区域 |
| 角落装饰符号 | 可选 | ⚡ { } </> Σ ∞ ∂ |
| 飘浮代码碎片 | 可选 | .cosmic-field |
| 右侧导航重构 | 可选 | 圆钮 + 进度环 + 展开面板 |
