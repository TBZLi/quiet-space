# 交互动效示例

本文档展示项目中使用的交互动效。

---

## 1. 爱心填充动画

### 效果说明
- 点击爱心图标触发填充动画
- 三种填充方式：左→右、中心扩散、底→顶
- 填充完成后有弹跳和粒子效果

### 动画流程
```
点击 → 填充动画(0.45s) → 弹跳效果(0.55s) → 粒子散开(0.35s)
```

### 技术实现
- 使用 `clip-path` 实现填充效果
- 使用 `cubic-bezier(0.34, 1.56, 0.64, 1)` 实现弹性缓动
- 使用 `scale()` 变换实现果冻弹跳
- 使用 DOM 动态创建粒子元素

### 原型演示

> **注意**：以下 iframe 需要在支持 HTML 的 Markdown 渲染器中查看（如 GitHub Pages、Notion 等）

```html
<!-- 在支持 HTML 的平台中嵌入 -->
<iframe src="file:///E:/KTV/KTVsystem/web/prototype/heart-fill.html" 
        width="100%" 
        height="400" 
        style="border: 1px solid #333; border-radius: 8px;">
</iframe>
```

**本地查看方式**：
1. 直接在浏览器中打开：`E:\KTV\KTVsystem\web\prototype\heart-fill.html`
2. 或启动本地服务器后访问

---

## 2. 时间线淡入淡出

### 效果说明
- 页面滚动时，内容随位置淡入淡出
- 到视口中心时最清晰（opacity: 1, scale: 1）
- 向边缘移动时逐渐淡出（opacity降低, scale缩小）

### 动画流程
```
滚动 → 计算元素位置 → 更新 opacity 和 scale → requestAnimationFrame 优化
```

### 技术实现
- 使用 `requestAnimationFrame` 优化滚动性能
- 使用 `easeOutCubic` 缓动函数
- 移除 `transition` 避免与 JS 更新冲突

### 代码示例
```javascript
function updateItemsOpacity() {
    const items = document.querySelectorAll('.timeline-item');
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const rect = item.getBoundingClientRect();
        const itemCenter = scrollTop + rect.top + rect.height / 2;
        const distance = viewportCenter - itemCenter;
        const absDistance = Math.abs(distance);
        
        const ratio = Math.min(absDistance / maxDistance, 1);
        const easedRatio = easeOutCubic(ratio);
        
        const opacity = 1 - (easedRatio * 0.85);
        const scale = 1 - (easedRatio * 0.1);
        
        item.style.opacity = opacity;
        item.style.transform = `scale(${scale})`;
    }
}
```

---

## 3. 页面过渡动画

### 效果说明
- 页面切换时有淡入淡出过渡
- 禁止生硬的硬切（hard cut）
- 过渡风格：缓慢、柔和、有呼吸感

### 动画流程
```
点击链接 → 添加 active 类 → 页面淡入黑色(0.6s) → 跳转新页面
```

### 技术实现
```css
.page-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.6s ease;
}

.page-transition.active {
    opacity: 1;
    pointer-events: all;
}
```

---

## 4. 拖拽上传

### 效果说明
- 支持拖拽文件到上传区域
- 拖拽时边框高亮显示
- 支持多文件上传

### 动画流程
```
拖入文件 → 边框变为琥珀色 → 松开 → 上传文件 → 显示视频列表
```

### 技术实现
```javascript
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) uploadVideos(files);
});
```

---

## 5. 果冻弹跳效果

### 效果说明
- 元素点击后有弹性效果
- 模拟物理世界的弹性碰撞
- 用于按钮点击反馈

### 动画流程
```
点击 → 放大(1.25x) → 缩小(0.88x) → 恢复原状
```

### 技术实现
```css
@keyframes jelly {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.25, 0.8); }   /* 放大 */
    50%  { transform: scale(0.88, 1.12); }  /* 缩小 */
    70%  { transform: scale(1.1, 0.92); }   /* 微调 */
    85%  { transform: scale(0.97, 1.03); }  /* 微调 */
    100% { transform: scale(1, 1); }        /* 恢复 */
}

.heart-btn.filling .heart-icon {
    animation: jelly 0.55s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

---

## 6. 粒子散开效果

### 效果说明
- 点击后从中心散开多个小圆点
- 用于点击反馈和视觉增强

### 动画流程
```
点击 → 创建8个粒子 → 沿不同方向飞散 → 350ms后消失
```

### 技术实现
```javascript
function spawnParticles(btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.className = 'particle';
        const size = 3 + Math.random() * 4;
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        dot.style.left = cx + 'px';
        dot.style.top = cy + 'px';
        document.body.appendChild(dot);
        
        const angle = (Math.PI * 2 * i) / 8;
        const dist = 20 + Math.random() * 15;
        dot.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 },
        ], { duration: 350, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
        
        setTimeout(() => dot.remove(), 400);
    }
}
```

---

**文档版本**：1.0.0

**最后更新**：2026-06-15
