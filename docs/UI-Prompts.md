# UI 原型图提示词 (UI Prompts)

本文档包含根据 Product-Spec.md v1.4.0 生成的原型图提示词，可用于 Midjourney、DALL-E、Gemini 等工具生成设计稿。

---

## 氛围宣言：这个产品的核心不是功能，是氛围

**Quiet Space 不是一个日记工具。它是一个空间。**

用户打开它不是为了"完成任务"，而是为了"待一会儿"。就像深夜走进一个安静的房间，点一盏暖灯，什么都不做，只是坐着。

**所有设计决策必须服从一个原则：氛围感。**

- 功能可以少，氛围不能差
- 按钮可以难找，但空间不能不安静
- 交互可以慢，但不能不温柔
- UI 可以不存在，但情绪不能不存在

**具体标准：**

| 维度 | 要求 | 反面教材 |
|------|------|---------|
| 视觉 | 深色、暖光、粒子呼吸、玻璃态 | 亮白背景、刺眼高饱和色、密集信息 |
| 节奏 | 慢、缓、有呼吸感 | 快速弹跳、瞬间切换、急促动画 |
| 信息 | 极低密度、一次一件事 | 满屏按钮、信息流、任务列表 |
| 交互 | 温柔、不打扰、像朋友递东西 | 弹窗、红点、通知、强制引导 |
| 声音 | 白噪音、环境音、安静 | 提示音、叮咚声、系统音效 |
| 文字 | 短、柔、不说教 | 长篇教程、功能说明、营销文案 |

**灵感参照：**
- 电影《Her》—— 暖色调的孤独，AI陪伴的情感调性
- Rainy Typewriter —— 环境主导，UI退后，用户沉浸在氛围里
- Claudio FM —— 数字电台的私人空间感
- mmguo.dev —— Cinematic Minimalism，像电影静帧的界面
- 深夜2点的窗边 —— 安静、黑暗、只有远处的微光

---

## 设计风格与配色

**视觉风格**：Cinematic Particle Dark（电影感粒子深色）

**风格说明**：
- Three.js 粒子系统是核心视觉层，贯穿所有页面
- 粒子不是装饰，是空间本身——它呼吸、流动、响应情绪
- 用户上传的图片、预设背景、日记/对话封面都以粒子形式呈现
- 所有页面切换必须有视觉过渡动画，禁止硬切
- UI 元素是氛围的延伸，不是独立于氛围之外的功能控件
- 像深夜窗边，用户"待在里面"而不是"使用工具"

**配色方案**：
- **主色**：`#0a0a0f`（深夜黑）- 全局背景基调，像深夜的房间
- **辅助色**：`#1a1a2e`（深靛蓝）- 卡片、面板、弹窗，像窗户玻璃的反光
- **强调色**：`#c9a96e`（暖琥珀）- 交互元素，像远处壁炉的光
- **文字色**：`#e8e8e8`（柔白）- 正文文字，像月光照在纸上
- **弱文字色**：`#666680`（灰紫）- 次要信息，像阴影里的东西
- **边框色**：`rgba(255,255,255,0.08)` - 卡片边框，几乎看不见
- **粒子色**：根据图片内容动态生成，整体偏暖色调，像远处的星光

---

## 核心 UI 提示词

### 界面 1：首页（Home Screen）- 版本 A

**功能描述**：用户打开 Quiet Space 后看到的第一个界面。三个主入口（回忆、倾诉、碎碎念）平等分布，背景是缓慢呼吸的粒子效果，齿轮图标进入设置。

**提示词**：
```
Desktop application home screen, cinematic dark UI, 1920x1080.

Deep black background (#0a0a0f) with a subtle 3D particle system in the center — warm amber and soft blue particles slowly floating and breathing, forming an abstract gentle shape. The particles have depth, some closer some farther, with subtle noise movement.

Three equal-size entry cards arranged horizontally in the center of the screen:
- Left card: "回忆" (Recall) with a book icon, glassmorphism panel with dark translucent background
- Center card: "倾诉" (Confide) with a speech bubble icon, same glassmorphism style
- Right card: "碎碎念" (Fragments) with a puzzle piece icon, same glassmorphism style

Each card has warm amber (#c9a96e) icon, soft white text, rounded corners (16px), subtle border glow on hover. Cards float above the particle layer with depth separation.

Top-right corner: small gear icon for settings, minimal and unobtrusive.

Overall mood: late night, quiet, warm, like sitting by a fireplace alone. No harsh edges, no bright colors, no clutter. The UI feels like it's part of the darkness, not imposed on it.

Cinematic minimalism, Her movie aesthetic, high-quality, award-winning desktop app design, dark theme, glassmorphism, subtle animation hints.
```

**使用建议**：生成时加 `--ar 16:9`。重点看粒子背景和三个入口的视觉权重是否平等。

---

### 界面 1：首页（Home Screen）- 版本 B

**功能描述**：三个入口不是卡片，而是三个粒子组成的图案，用户直接点击粒子图案进入。

**提示词**：
```
Desktop application home screen, immersive dark UI, 1920x1080.

Full-screen 3D particle scene on deep black background. Three distinct particle formations float in the center of the screen, each forming a subtle recognizable shape:
- Left: particles forming an open book shape, warm amber tones
- Center: particles forming a speech bubble shape, soft gold tones
- Right: particles forming scattered notes/papers shape, warm copper tones

Each particle formation slowly breathes and moves with noise-based animation. The shapes are recognizable but not literal — artistic, abstract, like distant constellations.

Below each formation, a minimal text label in soft white: "回忆", "倾诉", "碎碎念". Text has subtle glow, not harsh.

Top-right: tiny gear icon, barely visible, for settings.

No cards, no borders, no panels. The particles ARE the interface. Everything floats in dark space.

Mood: planetarium, stargazing, deep night solitude. Cinematic, atmospheric, ethereal.

Three.js particle aesthetic, cinematic dark, Her movie warmth, desktop app, 1920x1080, high-quality, award-winning.
```

**使用建议**：更沉浸但开发难度更高。适合验证"粒子即界面"的方向。

---

### 界面 1：首页（Home Screen）- 版本 C

**功能描述**：极简方案——三个入口用纯文字+微光效果，粒子只作为背景呼吸。

**提示词**：
```
Desktop application home screen, ultra-minimal dark UI, 1920x1080.

Deep black background with extremely subtle particle breathing — barely visible specks of warm light slowly drifting, like dust in a dim room.

Center of screen: three Chinese text entries stacked vertically with generous spacing:
- "回忆" in soft warm white
- "倾诉" in soft warm white
- "碎碎念" in soft warm white

Each text has a subtle warm glow underneath, like candlelight reflection. On hover, the glow intensifies and the text slightly brightens. No icons, no cards, no borders.

Top-right: single small gear icon in muted grey.

The entire screen is mostly empty black space. The particle breathing is so subtle you might not notice it at first.

Mood: empty room, single candle, silence. Extreme minimalism.

Cinematic minimalism, editorial design, negative space, Her movie still frames, 1920x1080, desktop app, high-quality.
```

**使用建议**：最极简，开发成本最低。适合验证"少即是多"的方向。

---

### 界面 2：3D粒子时间线展廊（Particle Timeline Gallery）- 版本 A

**功能描述**：三个入口共用的时间线浏览界面。每个条目以粒子组成的图片形式展示在3D时间轴上，鼠标控制视角，点击弹出预览卡片。

**提示词**：
```
Desktop application 3D timeline gallery, cinematic dark UI, 1920x1080.

Deep black scene with Three.js 3D particle system. Multiple particle-formed images floating in 3D space along a subtle timeline axis (left to right or in a gentle arc).

Each timeline entry is a cluster of particles that form a recognizable image — like a photo dissolving into thousands of tiny glowing points. The particles have warm amber and soft blue tones, with depth (some particles closer, some farther).

The timeline has a subtle horizontal line or curve connecting entries. Date labels float near each entry in muted grey text.

Mouse controls the 3D camera — moving mouse rotates the view slightly, revealing depth. Scrolling moves along the timeline axis.

One entry is selected (centered, slightly larger, with a warm glow halo). A glassmorphism preview card floats next to it showing: title, emotion tags, date, content preview text.

Bottom-left: back button (subtle arrow). Top-right: settings gear.

Mood: walking through a gallery of memories, each one a constellation of light particles. Deeply atmospheric, cinematic, slow-paced.

Three.js particle gallery, cinematic dark, Her movie aesthetic, 3D depth, glassmorphism cards, desktop app, 1920x1080, high-quality, award-winning.
```

**使用建议**：三个入口共用组件。生成后可用于回忆（日记）、倾诉（对话）、碎碎念（碎片）。

---

### 界面 2：3D粒子时间线展廊 - 版本 B

**功能描述**：更紧凑的水平时间线，粒子图片水平排列，带左右导航。

**提示词**：
```
Desktop application horizontal timeline, cinematic dark UI, 1920x1080.

Deep black background. A horizontal timeline runs through the center of the screen with a subtle glowing line.

Along the timeline, 5-7 particle-formed images are evenly spaced. Each image is a cluster of 3D particles forming a small photo-like composition. Particles are warm amber, soft gold, and muted copper tones.

Each entry has: particle image above the timeline, date label below in muted grey, emotion emoji tag next to the date.

The center entry is slightly larger and has a soft amber glow. Left and right arrow buttons (minimal, translucent) for navigation.

Clicking an entry causes a glassmorphism preview card to slide up from below.

3D depth is subtle — particles have z-axis variation but overall layout is mostly horizontal, like a photo reel with depth.

Mood: flipping through a photo album made of light. Warm, nostalgic, quiet.

Cinematic timeline, particle images, dark UI, glassmorphism, desktop app, 1920x1080, high-quality.
```

**使用建议**：更实用，开发难度适中。适合MVP阶段。

---

### 界面 3：倾诉聊天界面（Chat Interface）- 版本 A

**功能描述**：用户与AI对话。背景是粒子效果（用户上传图片转化或预设），对话气泡浮在粒子层之上，由用户先开口。

**提示词**：
```
Desktop application chat interface, cinematic dark UI, 1920x1080.

Full-screen 3D particle background — warm-toned particles forming an abstract image, slowly breathing and moving with noise animation. The particles fill the entire background with depth.

Chat messages float over the particle background in a centered column (max-width 700px):
- User messages: right-aligned, glassmorphism bubble with warm amber border, soft white text
- AI messages: left-aligned, glassmorphism bubble with subtle blue-grey border, soft white text

The chat starts empty — just the particle background and a minimal input bar at the bottom: a translucent text input with "想聊点什么..." placeholder in muted grey, and a small send button.

No AI greeting, no suggestions, no prompts. The user initiates. The emptiness is intentional.

Top-left: back arrow to return to timeline. Top-right: minimal info icon.

The particle background subtly shifts as messages are sent — like the conversation is influencing the atmosphere.

Mood: late night phone call with a close friend, warm darkness, intimate space.

Cinematic chat UI, particle background, glassmorphism bubbles, dark theme, Her movie chat aesthetic, desktop app, 1920x1080, high-quality, award-winning.
```

**使用建议**：重点看粒子背景和聊天气泡的层次关系——粒子在底层，对话浮在上面。

---

### 界面 3：倾诉聊天界面 - 版本 B

**功能描述**：更极简的聊天界面，粒子背景更弱化，对话内容更突出。

**提示词**：
```
Desktop application chat interface, ultra-minimal dark UI, 1920x1080.

Deep black background with very subtle particle breathing — barely visible warm specks drifting slowly.

Center column (max-width 650px) with generous vertical spacing:
- Messages appear one by one with smooth fade-in animation
- User text: right-aligned, no bubble, just soft white text with a tiny warm dot indicator
- AI text: left-aligned, no bubble, just slightly dimmer white text with a tiny blue-grey dot indicator

The conversation feels like text floating in darkness — no containers, no borders, no backgrounds on messages. Just words in space.

Bottom: a single minimal input line with warm amber cursor, "想聊点什么..." placeholder. No send button — press Enter to send.

Top-left: faint back arrow. No other UI elements.

Mood: journaling in the dark, stream of consciousness, words dissolving into night.

Ultra-minimal chat, dark editorial, Her movie text aesthetic, negative space, desktop app, 1920x1080, high-quality.
```

**使用建议**：极简方案，验证"文字即界面"。开发成本低。

---

### 界面 4：回忆日记预览卡片（Journal Preview Card）

**功能描述**：用户在时间线展廊点击日记后弹出的预览卡片。玻璃态面板浮在粒子时间线背景之上。

**提示词**：
```
Desktop application preview card overlay, cinematic dark UI, 1920x1080.

The 3D particle timeline gallery is visible in the background, slightly blurred and dimmed.

A glassmorphism card floats in the center of the screen (600x500px):
- Background: rgba(26, 26, 46, 0.7) with backdrop-filter blur(24px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 20px
- Box-shadow: deep black shadow with subtle warm glow

Card content:
- Top: diary title in soft white, bold, 20px
- Below title: date in muted grey, 12px
- Below date: emotion tags as small rounded chips with warm amber background
- Source tag: "对话生成" or "手写" as a small label
- Main content: diary preview text in soft white, 14px, comfortable line-height
- Bottom: three action buttons — "编辑" (warm amber), "导出" (translucent), "删除" (muted red)

Clicking outside the card dismisses it with a smooth fade-out.

The card has depth — it floats above the timeline with clear visual hierarchy.

Mood: opening a letter in a dark room, warm light spilling from the card. Intimate, focused, unhurried.

Glassmorphism overlay, cinematic dark, preview card, desktop app, 1920x1080, high-quality.
```

**使用建议**：预览卡片是三个入口共用的交互模式，可用于回忆、倾诉、碎碎念。

---

### 界面 5：回忆日记编辑器（Journal Editor）

**功能描述**：全屏富文本编辑界面，用户编辑AI生成的日记或自己手写的日记。

**提示词**：
```
Desktop application rich text editor, cinematic dark UI, 1920x1080.

Deep black background, no particles in this view — clean, focused writing environment.

Center column (max-width 750px) with generous padding:
- Top: editable title field, large soft white text (24px), no border, just a subtle underline on focus in warm amber
- Below title: metadata bar — date, emotion tags, source label in muted grey
- Main area: rich text editor with comfortable typography
  - Body text: soft white (#e8e8e8), 16px, 1.8 line-height
  - Headings: slightly larger, warm amber accent
  - Bold/italic controls: floating toolbar that appears on text selection
  - Lists: clean bullet/number style with warm amber markers

Top-left: back arrow to return to timeline
Top-right: save button (warm amber), export button (translucent), more options (three dots)

The editor is distraction-free — no sidebars, no panels, no clutter. Just the text and minimal chrome.

Mood: writing late at night, the world is quiet, just you and the page.

Cinematic editor, dark theme, distraction-free writing, rich text, desktop app, 1920x1080, high-quality, editorial design.
```

**使用建议**：编辑器需要干净专注，不适合加粒子背景。重点看排版和交互的克制。

---

### 界面 6：碎碎念界面（Fragment Notes）- 版本 A

**功能描述**：用户记录零碎想法的地方。时间线展廊展示碎片，点击碎片进入编辑，AI整理预览从侧面弹出。

**提示词**：
```
Desktop application fragment notes, cinematic dark UI, 1920x1080.

3D particle timeline gallery in the background showing fragment entries — smaller than diary entries, like scattered post-it notes made of particles.

A large glassmorphism editing area occupies the center-right (60% width):
- Background: rgba(26, 26, 46, 0.5) with backdrop blur
- Clean text input area, no title field — just a placeholder "随便写点什么..."
- Bottom of editing area: emotion tag selector (small emoji icons in a row), color picker (small color dots), and a "帮我整理" button in warm amber

Left side: fragment list — vertical list of previous fragments with:
- Date in muted grey
- Content preview (first line) in soft white
- Emotion emoji next to each
- "已整理" badge on processed fragments

When AI finishes organizing, a preview panel slides in from the right side:
- Shows the organized diary draft
- Two buttons: "转为日记" (warm amber) and "再改改" (translucent)

Mood: scattered thoughts on a desk, each one a small glowing note. Organized chaos, gentle, forgiving.

Fragment notes UI, particle timeline, glassmorphism, dark theme, desktop app, 1920x1080, high-quality.
```

**使用建议**：碎碎念的核心是"低门槛"，界面要感觉轻松随意。

---

### 界面 7：设置页 - API配置

**功能描述**：引导式三步配置AI模型API。

**提示词**：
```
Desktop application settings page, cinematic dark UI, 1920x1080.

Deep black background, no particles — clean settings environment.

Center panel (max-width 600px):
- Step indicator at top: three dots connected by a line, current step highlighted in warm amber
- Step 1: Provider selection — three large cards (OpenAI, DeepSeek, Custom) with provider icons, glassmorphism style
- Step 2: API Key input — large text field with masked input, warm amber focus border
- Step 3: Test connection — "测试连接" button, loading spinner, success/fail indicator

Each step has a clear title, description in muted grey, and "下一步"/"上一步" navigation buttons.

Top-left: back arrow to home.

The overall feel is like setting up a new device — guided, simple, reassuring.

Settings UI, glassmorphism, dark theme, guided flow, desktop app, 1920x1080, high-quality.
```

**使用建议**：设置页不需要粒子背景，重点看引导流程的清晰度。

---

### 界面 8：设置页 - AI人格配置

**功能描述**：预设人格选择 + 自定义参数调节。

**提示词**：
```
Desktop application AI personality settings, cinematic dark UI, 1920x1080.

Deep black background.

Center panel (max-width 700px):
- Section 1: "选择AI人格" — five preset cards in a row:
  - 深夜陪伴 (moon icon)
  - 温柔姐姐 (flower icon)
  - 理性朋友 (compass icon)
  - 安静倾听者 (ear icon)
  - 轻松幽默 (sparkle icon)
  Each card: glassmorphism, icon in warm amber, selected card has warm glow border

- Section 2: "自定义参数" — five sliders with labels:
  - 主动性, 回复长度, 安慰程度, 追问程度, 建议倾向
  Sliders: warm amber track, white thumb, muted grey labels

- Section 3: "AI自适应" — toggle switch (off by default) with description text

- Bottom: "重置为默认" button (translucent), "保存" button (warm amber)

Personality settings, glassmorphism, dark theme, slider controls, desktop app, 1920x1080, high-quality.
```

**使用建议**：预设卡片要有吸引力，让用户愿意探索不同人格。

---

### 界面 9：情绪时间线（Emotion Timeline）

**功能描述**：可视化过去一段时间的情绪变化。

**提示词**：
```
Desktop application UI, dark emotion timeline, cinematic dark UI, 1920x1080.

Horizontal timeline spanning 30 days, multiple emotion layers as thin colored ribbons:
- Blue for calm, orange for anxiety, yellow for joy, purple for sadness
- Ribbons vary in thickness based on intensity
- The visualization looks like sound waves or aurora, extremely subtle and artistic

Date labels in tiny gray text below. Hover shows daily detail.

Background black with subtle particle breathing. No grid lines, no axes.

The emotion data feels like music — organic, flowing, not clinical.

Date range selector at top: "本周" / "本月" / "全部" as minimal text tabs.

Emotion timeline, data visualization, cinematic dark, particle background, desktop app, 1920x1080, artistic, high-quality.
```

**使用建议**：情绪可视化要"艺术化"而非"数据化"，像看一幅画而不是看报表。

---

## 交互流程提示词

### 流程 1：首页 → 倾诉 → 新对话

**流程描述**：用户从首页进入倾诉，选择开启新对话，上传图片作为开题，进入聊天界面。

**关键界面**：
- 首页：三个入口选择
- 倾诉时间线：浏览历史对话，选择"新对话"
- 图片上传：上传开题图片或选择预设背景
- 聊天界面：用户开始对话

**提示词**：
```
A sequence of 4 desktop UI screens showing a user flow, cinematic dark theme, 1920x1080 each.

Screen 1: Home — three glowing particle entry cards (回忆, 倾诉, 碎碎念) on dark background. Center card "倾诉" has warm glow indicating selection.

Screen 2: Timeline Gallery — 3D particle entries floating in dark space. A "新对话" button (warm amber, plus icon) is prominent at the center. Past conversation entries visible as particle images along the timeline.

Screen 3: Image Upload — a glassmorphism modal in the center: "上传一张图片作为开题" with drag-drop area, or "选择预设背景" with small preset thumbnails. "跳过" button for using default particles.

Screen 4: Chat Interface — full-screen particle background (uploaded image converted to particles), minimal input bar at bottom with "想聊点什么..." placeholder. Empty, waiting for user.

Each screen has a smooth transition hint. Consistent dark theme, warm amber accents, glassmorphism panels.

User flow sequence, cinematic dark, particle system, desktop app, 1920x1080, high-quality.
```

---

### 流程 2：碎碎念 → AI整理 → 转日记

**流程描述**：用户写碎片，AI自动预览整理结果，用户确认后转为日记。

**关键界面**：
- 碎碎念编辑：用户输入碎片
- AI预览面板：整理结果从侧面弹出
- 确认转日记：用户确认并编辑日记草稿

**提示词**：
```
A sequence of 3 desktop UI screens showing the fragment-to-diary flow, cinematic dark theme, 1920x1080 each.

Screen 1: Fragment editing — dark background, glassmorphism editing area in center. User has typed scattered thoughts. Emotion tags below, "帮我整理" button glowing warm amber. A small floating indicator shows "AI正在整理..." with gentle pulse animation.

Screen 2: AI preview — the editing area stays in center, and a glassmorphism preview panel slides in from the right side. The preview shows the organized diary with title, structured paragraphs, emotion tags. Two buttons: "转为日记" (warm amber) and "再改改" (translucent).

Screen 3: Diary editor — full transition to diary editor view. The organized content is now in a rich text editor. Title is editable, content is formatted. "保存" button in warm amber.

Smooth transitions between screens. Consistent dark theme.

Fragment-to-diary flow, cinematic dark, glassmorphism, AI interaction, desktop app, 1920x1080, high-quality.
```

---

### 流程 3：页面过渡动画

**流程描述**：所有页面切换的视觉过渡效果。过渡是产品体验的核心——用户应该感觉不到"切换"，只感觉到"流动"。

**提示词**：
```
A sequence of 5 desktop UI frames showing page transition effects, cinematic dark theme, 1920x1080 each. The sequence shows a 600-800ms transition from home screen to timeline gallery.

Frame 1 (0ms): Home screen with three entry cards (回忆, 倾诉, 碎碎念) floating above particles. User hovers over "倾诉" card — card glows warmer, particles nearby gently respond.

Frame 2 (200ms): User clicks "倾诉". The card's glow expands outward like warm light spilling into darkness. Other cards begin to fade. Particles start to shift and reorganize.

Frame 3 (400ms): The glow dissolves into the particle field. Home screen elements (cards, gear icon) are now 30% opacity and fading. Timeline gallery elements are beginning to appear — faint particle-formed images emerging from the morphing particles. The transition is mid-point — both old and new elements coexist in a dreamlike overlap.

Frame 4 (600ms): Home elements are gone. Timeline gallery is 80% visible — particle images are forming along the timeline axis. The last traces of the home glow are fading into the new scene.

Frame 5 (800ms): Timeline gallery fully visible. Particle entries float in 3D space along the timeline. The transition is complete — it feels like the same continuous space, just rearranged.

The entire sequence feels like a slow, organic morph — not a cut, not a slide, not a wipe. Like water flowing from one shape to another. Like waking from one dream into another. The particles are continuous — they don't disappear and reappear, they transform.

Key detail: the particle field is the CONTINUITY ELEMENT. It never cuts. UI elements (cards, panels, text) fade in and out ON TOP of the ever-present particle field. The particles are the constant; the UI is the variable.

Page transition morphing, cinematic dark, particle continuity, smooth 600ms animation, desktop app, 1920x1080, high-quality, storyboard format.
```

**使用建议**：提示词中强调粒子是"连续性元素"——它从不切断，UI 在粒子之上流动。这是过渡流畅的关键。

---

## AI 交互界面提示词

### AI 功能 1：对话中的AI回复

**AI 交互特点**：AI不抢戏，先理解再回应。回复简短温暖，不给解决方案。

**提示词**：
```
Desktop chat interface detail, cinematic dark UI, showing AI response pattern.

Close-up of chat messages on dark particle background:
- User message (right): "今天项目延期了，很烦" — soft white text, warm amber dot
- AI response (left): "听起来今天挺不容易的。想多说说吗？" — slightly dimmer white text, blue-grey dot. Response is short, warm, asks a gentle question without giving solutions.

The AI response feels like a friend listening, not a therapist analyzing. No bullet points, no "建议你...", no numbered lists.

The particle background subtly shifts warmer after the emotional exchange.

Chat detail, AI response style, cinematic dark, warm tone, desktop app, close-up, high-quality.
```

---

### AI 功能 2：日记生成确认

**AI 交互特点**：对话结束后，AI询问是否整理成日记。

**提示词**：
```
Desktop chat interface, cinematic dark UI, showing diary generation prompt.

The chat shows the end of a conversation. The last AI message is:
"要把今天的对话整理成日记吗？"

Below this message, two elegant buttons appear:
- "好的，帮我整理" — warm amber, slightly larger
- "不用了" — translucent, smaller

After user clicks "好的", a loading state appears: particles gently swirling with "正在整理你的故事..." text in muted grey.

Then a diary preview card slides up from the bottom, showing generated title, organized paragraphs, emotion tags, and "编辑" / "保存" buttons.

The transition from chat to diary preview feels natural and unhurried.

Diary generation flow, cinematic dark, glassmorphism, AI interaction, desktop app, 1920x1080, high-quality.
```

---

### AI 功能 3：碎碎念AI自动预览

**AI 交互特点**：用户停笔90秒后，AI在旁边弹出整理预览，不打断用户。

**提示词**：
```
Desktop fragment notes interface, cinematic dark UI, showing AI auto-preview.

The editing area is in the center with user's scattered thoughts typed in. The user has stopped typing.

From the right side, a glassmorphism preview panel gently slides in (not abruptly — smooth 600ms ease-out). The panel has:
- Header: "帮你整理了一下" in muted warm text
- Content: organized version of the scattered thoughts
- Subtle particle animation in the panel background
- Two buttons at bottom: "转为日记" (warm amber) and "继续写" (translucent)

The panel feels like a gentle suggestion from a friend sitting next to you — not a popup, not a notification, not an interruption. The user can ignore it and keep writing.

A tiny timer icon shows "90秒后自动整理" in the bottom-right corner of the editing area.

AI auto-preview, cinematic dark, glassmorphism, gentle suggestion, desktop app, 1920x1080, high-quality.
```

---

### 环境场景 1：壁炉夜谈（Fireplace Night）

**提示词**：
```
Desktop application UI, deep dark background with subtle fireplace scene, warm amber glow from a small fireplace at bottom left corner, tiny floating embers drifting upward slowly at very low opacity, faint warm light casting soft shadows, ambient mood layer at 15% opacity behind all UI content, cinematic lighting, 1920x1440, atmospheric, intimate, Her movie aesthetic
```

---

### 环境场景 2：夜雨窗边（Rainy Window）

**提示词**：
```
Desktop application UI, deep dark background with subtle rainy window scene, faint rain droplets sliding down an invisible window surface, soft blue-gray ambient light suggesting city lights through rain, ambient mood layer at 15% opacity behind all UI content, cinematic moodiness, 1920x1440, atmospheric, contemplative
```

---

## 设计建议

### 氛围感检查清单（每个界面必须通过）

生成任何界面的设计稿前，用这个清单检查：

- [ ] **第一眼看到的是氛围，不是功能** —— 用户的目光应该先被粒子/光影/空间吸引，然后才注意到按钮
- [ ] **UI 元素像是从氛围中"浮现"出来的** —— 不是"贴"在背景上的，而是"长"在空间里的
- [ ] **颜色不会打断情绪** —— 没有刺眼的高饱和色，没有冷白光，没有荧光色
- [ ] **动画有呼吸感** —— 所有运动都是缓慢的、有机的、像呼吸一样有节奏
- [ ] **信息密度极低** —— 同一屏幕只做一件事，留白是主角
- [ ] **用户会觉得"安静"** —— 如果截图让人觉得"吵"或"忙"，就重来

### 布局建议
- **粒子层在最底层**：所有页面的粒子效果都在 z-index: 1，UI 内容浮在其上
- **内容居中**：主要内容区域居中，最大宽度 700-800px，两侧大量留白
- **层级分明**：背景（粒子/氛围）→ 中层（面板/卡片）→ 顶层（弹窗/工具栏）
- **信息密度极低**：同一屏幕只展示一件事，宁可多翻页也不要挤
- **UI 要"轻"**：面板用玻璃态、半透明，不要实色大块，让氛围透过来

### 交互建议
- **悬停反馈**：所有可点击元素悬停时有温暖发光效果，像远处的灯火微微变亮
- **点击反馈**：点击时微弱涟漪扩散，像触碰水面，不是"啪"的按钮感
- **滚动反馈**：时间线滚动时粒子有轻微视差效果，像在空间中穿行
- **无弹窗**：所有提示以嵌入式轻提示出现，不弹窗打断沉浸
- **无强制引导**：用户可以什么都不做，就待在空间里，不被催促
- **AI的回应像朋友递东西**：不是"弹出通知"，而是"轻轻放到你面前"

### 动效建议
- **页面过渡**：fade + scale 组合，400-600ms，ease-in-out，像水流动、像雾散开
- **元素入场**：fade-in-up，300ms，元素依次出现有 50ms 间隔，像晨光逐渐照亮房间
- **粒子动画**：simplex noise 驱动，速度极慢（0.001-0.003），不刻意注意感知不到
- **呼吸效果**：粒子整体 0.05-0.1 透明度波动，周期 3-5 秒，像空间在呼吸
- **情绪响应**：对话中出现负面情绪时，粒子色温微微变冷；出现积极情绪时，微微变暖

### 过渡与交互流畅规范

这个产品的"慢"不是卡，是刻意的从容。所有过渡必须流畅到用户感觉不到"切换"，只感觉到"流动"。

**页面级过渡（首页 ↔ 各入口）：**

| 操作 | 过渡方式 | 时长 | 缓动曲线 | 视觉效果 |
|------|---------|------|---------|---------|
| 首页 → 倾诉/回忆/碎碎念 | 粒子morph + fade | 600-800ms | ease-in-out | 点击的入口卡片发光→粒子扩散→旧页面元素淡出→新页面粒子重组→新元素淡入 |
| 各入口 → 首页 | reverse morph | 500-700ms | ease-out | 新页面元素淡出→粒子收缩回入口位置→首页卡片重新浮现 |
| 首页 → 设置 | fade + slide-up | 400ms | ease-out | 设置面板从底部滑入，首页粒子在背景中继续呼吸 |

**面板级过渡（预览卡片、AI预览）：**

| 操作 | 过渡方式 | 时长 | 缓动曲线 | 视觉效果 |
|------|---------|------|---------|---------|
| 时间线 → 预览卡片 | scale-up + fade-in | 350ms | ease-out | 从点击位置缩放展开，背景变暗模糊 |
| 预览卡片 → 编辑器 | fade + expand | 500ms | ease-in-out | 卡片内容扩展为全屏编辑器，粒子背景淡入 |
| AI预览面板弹出 | slide-in-right + fade | 400ms | cubic-bezier(0.16,1,0.3,1) | 从右侧滑入，带轻微弹性，像有人递过来一张纸 |
| 面板关闭 | fade-out + scale-down | 300ms | ease-in | 淡出缩小，背景恢复清晰 |

**元素级过渡（列表、卡片、按钮）：**

| 操作 | 过渡方式 | 时长 | 视觉效果 |
|------|---------|------|---------|
| 时间线条目 hover | 微放大 + 光晕 | 200ms | 粒子图片微微放大1.05倍，边缘散发暖光 |
| 时间线条目 click | 微缩 + 涟漪 | 150ms | 缩至0.97倍，点击位置扩散暖色涟漪 |
| 列表项入场 | fade-in-up | 300ms | 从下方20px处淡入上移，各项间隔50ms |
| 按钮 hover | glow + 微亮 | 200ms | 边框发光，背景透明度从0.05升至0.1 |
| 按钮 click | 微缩 + 色温变化 | 100ms | 缩至0.95，色温微暖 |
| 输入框 focus | 边框亮 + 光晕 | 300ms | 边框从透明渐变为暖琥珀，带柔和光晕 |
| 情绪标签出现 | pop-in | 250ms | 从0缩放到1，带轻微弹性 |

**聊消息过渡：**

| 操作 | 过渡方式 | 时长 | 视觉效果 |
|------|---------|------|---------|
| 用户消息出现 | fade-in + slide-left | 300ms | 从右侧30px处淡入左移到位 |
| AI消息出现 | 逐字淡入 | 每字30-50ms | 文字像墨水在纸上逐渐显现，不逐字打字机，而是渐进透明度 |
| AI思考中 | 三点呼吸 | 周期1.5s | 三个暖色点依次淡入淡出，像平静的呼吸 |
| 日记生成中 | 粒子漩涡 + 文字淡入 | 2000ms | 粒子缓慢旋转成漩涡，日记文字从漩涡中心逐渐浮现 |

**时间线滚动过渡：**

| 操作 | 过渡方式 | 视觉效果 |
|------|---------|---------|
| 时间线滚动 | 惯性滚动 + 粒子视差 | 鼠标停止后继续滑行一段距离，粒子前景和背景有不同滚动速度，产生深度感 |
| 滚动到新月份 | 月份标签 fade-in | 月份文字从透明渐变为可见，不闪烁不跳变 |
| 精确定位到某条目 | smooth scroll + 光晕 | 平滑滚动到目标位置，目标条目微微发光确认定位 |

**过渡禁忌（绝对不能出现）：**
- 硬切：没有动画直接跳到新页面
- 弹跳：元素到达位置后回弹（除非是刻意的微弹性）
- 闪烁：opacity 在 0 和 1 之间快速切换
- 延迟卡顿：动画开始前有明显等待
- 不一致：同类操作有的有过渡有的没有

### 响应式设计
- **桌面端（1920x1080）**：主要目标，粒子 8000-15000，全功能
- **小桌面（1366x768）**：粒子 5000-8000，布局紧凑但不变形
- **最小窗口（800x600）**：粒子 2000-3000，时间线切换为列表模式

---

## 使用指南

### 生成设计稿的步骤

1. **选择提示词版本**：每个界面有多个版本，选择最符合你直觉的
2. **复制提示词**：完整复制到图像生成工具
3. **调整参数**：建议 `--ar 16:9` 保持桌面比例，`--style raw` 减少默认美化
4. **生成 3-4 个版本**：对比后选择最符合"深夜安静陪伴"氛围的
5. **反馈调整**：调整情绪关键词（如"温暖"→"冷清"）重新生成

### 推荐工具

- **Midjourney**：最适合本项目的电影感氛围，`--style raw --ar 16:9 --v 6`
- **DALL-E**：适合快速迭代，深色主题表现不如Midjourney
- **Gemini**：适合生成带中文文字的界面预览

### 注意事项
- **AI生成的UI容易"太满"** —— 反复强调 minimal、empty、void、atmospheric、quiet
- **AI容易加太多功能按钮** —— 提示词中强调 "no chrome", "no toolbar", "no sidebar"
- **粒子效果**用 "particle system", "constellation of light points", "scattered glowing dots" 描述
- **氛围关键词**：每条提示词都必须包含 atmosphere、quiet、intimate、cinematic、breathing、warm
- **保持所有界面风格一致**：cinematic dark, glassmorphism, warm amber accents
- **如果设计稿看起来像"一个App"就重来** —— 它应该看起来像"一个空间"

---

## 版本历史

- v1.1.0 - 2026-05-27：根据 Product-Spec.md v1.2.0 生成
  - 初始版本：开场场景、聊天界面、日记编辑器、日记浏览、记忆面板、情绪时间线、AI人格设置、API配置

- v1.2.0 - 2026-05-28：根据 Product-Spec.md v1.4.0 重写，新增氛围宣言
  - 新增：首页三入口、3D粒子时间线展廊、碎碎念界面、页面过渡动画
  - 重写：倾诉聊天界面（加入粒子背景）、回忆预览卡片、日记编辑器
  - 新增：交互流程（首页→倾诉新对话、碎碎念→AI整理→转日记、页面过渡）
  - 新增：AI交互（碎碎念自动预览）
  - 设计风格从 Cinematic Dark Minimalism 更新为 Cinematic Particle Dark

- v1.3.0 - 2026-05-28：强化过渡流畅规范
  - 新增：完整的过渡与交互流畅规范（页面级/面板级/元素级/聊消息/时间线滚动）
  - 更新：页面过渡动画提示词（5帧分解，强调粒子是连续性元素）
  - 新增：过渡禁忌清单

---

**文档版本**：1.3.0

**最后更新**：2026-05-28

**对应的产品文档**：Product-Spec.md v1.4.0

**下次更新计划**：MVP核心界面设计稿确认后更新
