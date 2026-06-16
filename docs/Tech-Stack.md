# Quiet Space 技术栈说明

本文档说明项目各功能使用的技术及其优势。

---

## 一、前端技术

### 1. HTML5 + CSS3 + JavaScript（原生）

**使用位置**：所有页面

**优势**：
- ✅ 无需构建工具（不需要 Webpack、Vite 等）
- ✅ 无需学习框架（React、Vue 等）
- ✅ 文件体积小，加载快
- ✅ 浏览器原生支持，兼容性好
- ✅ 调试简单，直接查看源码

---

### 2. CSS Variables（CSS 变量）

**使用位置**：所有页面的 `:root` 定义

**示例**：
```css
:root {
    --bg-deep: #000000;
    --accent-amber: #c9a96e;
    --text-soft: #e8e8e8;
}
```

**优势**：
- ✅ 统一管理颜色、间距等设计 token
- ✅ 修改一处，全局生效
- ✅ 便于实现深色/浅色主题切换

---

### 3. HTML5 Video

**使用位置**：所有页面的视频背景

**示例**：
```html
<video autoplay muted loop playsinline>
    <source src="backgrounds/summer-watermelon.mp4" type="video/mp4">
</video>
```

**优势**：
- ✅ 浏览器原生支持，无需插件
- ✅ `autoplay` + `loop` 实现无缝循环
- ✅ `muted` 静音播放，不影响用户
- ✅ `playsinline` 移动端内联播放
- ✅ `object-fit: cover` 保持比例覆盖全屏

---

### 4. CSS Flexbox / Grid

**使用位置**：所有页面的布局

**优势**：
- ✅ 响应式布局，自适应不同屏幕
- ✅ 居中、对齐简单
- ✅ 无需浮动（float）和清除浮动

---

### 5. CSS Animation + JavaScript 动画

**使用位置**：
- 页面过渡动画（淡入淡出）
- 时间线滑动淡入淡出效果
- 消息出现动画

**示例**：
```css
@keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

**优势**：
- ✅ 流畅的 60fps 动画
- ✅ 硬件加速（GPU 渲染）
- ✅ 不依赖动画库

---

### 6. requestAnimationFrame

**使用位置**：时间线页面的滚动监听

**示例**：
```javascript
scrollContainer.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateItemsOpacity();
            ticking = false;
        });
        ticking = true;
    }
});
```

**优势**：
- ✅ 与屏幕刷新率同步（通常 60fps）
- ✅ 避免重复计算，节省性能
- ✅ 页面不可见时自动暂停，节省资源

---

## 二、数据存储

### 1. localStorage

**使用位置**：
- AI 配置（API Endpoint、Key、模型名）
- 日记数据
- 对话记录
- 碎碎念
- 设置项

**优势**：
- ✅ 纯前端存储，无需服务器
- ✅ 关闭浏览器后数据保留
- ✅ API 简单，上手快
- ✅ 同源策略保护，安全

**限制**：
- ⚠️ 容量约 5-10MB
- ⚠️ 只能存字符串，需 JSON 序列化
- ⚠️ 同步操作，大数据可能阻塞

---

### 2. IndexedDB

**使用位置**：自定义视频背景存储

**优势**：
- ✅ 容量大（理论上无限，实际数百 MB 起）
- ✅ 支持存储二进制数据（视频、图片）
- ✅ 异步操作，不阻塞页面
- ✅ 支持索引和事务
- ✅ 纯前端，无需服务器

**适用场景**：
- 大文件存储（视频、图片）
- 结构化数据
- 离线应用

---

## 三、后端技术

### 1. Node.js + http 模块

**使用位置**：`server.js`

**示例**：
```javascript
const http = require('http');
const server = http.createServer((req, res) => {
    // 处理请求
});
```

**优势**：
- ✅ 轻量，无需 Express 等框架
- ✅ Node.js 内置，无需额外安装
- ✅ 足够满足静态文件服务需求
- ✅ 学习成本低

---

### 2. MIME 类型配置

**使用位置**：`server.js` 的 `mimeTypes` 对象

**示例**：
```javascript
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.mp4': 'video/mp4',
    // ...
};
```

**优势**：
- ✅ 浏览器正确识别文件类型
- ✅ 视频、音频等媒体文件正常播放
- ✅ 避免 MIME 类型错误导致的加载失败

---

## 四、AI 服务

### 1. OpenAI 兼容 API 格式

**使用位置**：`ai.js` 和 `server.js` 的 `/api/chat` 接口

**示例**：
```javascript
{
    model: "mimo-7b",
    messages: [{ role: "user", content: "..." }],
    max_tokens: 500
}
```

**优势**：
- ✅ 主流 AI 模型都支持（OpenAI、DeepSeek、Claude 等）
- ✅ 统一接口，切换模型只需改配置
- ✅ 无需学习不同 API 格式

---

### 2. 服务端 API 代理

**使用位置**：`server.js` 的 `/api/chat` 路由

**优势**：
- ✅ 解决浏览器跨域问题（CORS）
- ✅ 保护 API Key 不暴露给前端
- ✅ 可以做请求缓存、限流等

---

## 五、UI/UX 技术

### 1. 深色主题

**使用位置**：所有页面

**优势**：
- ✅ 深夜使用不刺眼
- ✅ 节省电量（OLED 屏幕）
- ✅ 营造安静、沉浸的氛围

---

### 2. 毛玻璃效果（Backdrop Filter）

**使用位置**：设置页面的卡片

```css
.setting-card {
    backdrop-filter: blur(20px);
}
```

**优势**：
- ✅ 现代感设计
- ✅ 半透明效果，不遮挡背景
- ✅ 视觉层次分明

---

### 3. 渐变色按钮

**使用位置**：保存按钮、发送按钮等

```css
background: linear-gradient(135deg, var(--accent-amber), #d4a574);
```

**优势**：
- ✅ 视觉吸引力强
- ✅ 与整体氛围协调
- ✅ 交互反馈明显

---

## 六、技术选型对比

| 需求 | 选择的方案 | 替代方案 | 为什么选当前方案 |
|-----|-----------|---------|----------------|
| 前端框架 | 原生 HTML/CSS/JS | React、Vue | 轻量、无需构建、学习成本低 |
| 动画 | CSS Animation + rAF | GSAP、Anime.js | 无需引入库，足够满足需求 |
| 数据存储 | localStorage + IndexedDB | SQLite、云数据库 | 纯前端、无需服务器、隐私安全 |
| 后端 | Node.js http 模块 | Express、Koa | 足够简单、无需额外依赖 |
| AI 接口 | OpenAI 兼容格式 | 各家私有 API | 统一接口、切换灵活 |
| 视频背景 | HTML5 Video | CSS 动画、Canvas | 真实视频效果更好、性能好 |

---

## 七、总结

### 技术选型原则

1. **够用就好**：不追求最新技术，选择最适合的
2. **轻量优先**：减少依赖，降低复杂度
3. **原生优先**：能用浏览器原生能力就不引入库
4. **隐私安全**：数据纯本地存储，不上传云端

### 技术栈总览

```
前端：HTML5 + CSS3 + JavaScript（原生）
存储：localStorage + IndexedDB
后端：Node.js + http 模块
AI：OpenAI 兼容 API 格式
```

### 适用场景

- ✅ 个人项目
- ✅ 小型工具应用
- ✅ 注重隐私的应用
- ✅ 不需要复杂构建流程的项目

---

**文档版本**：1.0.0

**最后更新**：2026-06-15
