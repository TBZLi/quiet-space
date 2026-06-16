/**
 * 聊天UI层 - 处理聊天界面的DOM操作
 * 视觉改动只需要改这个文件
 */

const ChatUI = {
    container: null,
    input: null,
    sendBtn: null,
    emptyHint: null,

    /**
     * 初始化
     */
    init() {
        this.container = document.getElementById('messagesContainer');
        this.input = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.emptyHint = document.getElementById('emptyHint');

        // 自动调整输入框高度
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
        });

        // 回车发送
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.onSend) this.onSend();
            }
        });
    },

    /**
     * 回调函数，由页面设置
     */
    onSend: null,

    /**
     * 添加消息到界面
     * @param {string} text - 消息内容
     * @param {string} sender - 'user' 或 'ai'
     * @param {boolean} skipAnimation - 是否跳过动画
     */
    addMessage(text, sender, skipAnimation = false) {
        if (this.emptyHint) {
            this.emptyHint.style.display = 'none';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (skipAnimation) {
            messageDiv.style.animation = 'none';
            messageDiv.style.opacity = '1';
        } else {
            messageDiv.style.animationDelay = '0.1s';
        }

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();

        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);
        this.container.appendChild(messageDiv);

        setTimeout(() => {
            this.container.scrollTop = this.container.scrollHeight;
        }, 50);

        return messageDiv;
    },

    /**
     * 显示思考中动画
     */
    showThinking() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai';
        thinkingDiv.id = 'thinkingIndicator';
        thinkingDiv.style.animation = 'none';

        const thinkingBubble = document.createElement('div');
        thinkingBubble.className = 'thinking-indicator';
        thinkingBubble.innerHTML = `
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
        `;

        thinkingDiv.appendChild(thinkingBubble);
        this.container.appendChild(thinkingDiv);
        this.container.scrollTop = this.container.scrollHeight;
    },

    /**
     * 隐藏思考中动画
     */
    hideThinking() {
        const thinking = document.getElementById('thinkingIndicator');
        if (thinking) {
            thinking.style.opacity = '0';
            thinking.style.transition = 'opacity 0.3s ease';
            setTimeout(() => thinking.remove(), 300);
        }
    },

    /**
     * 清空消息列表
     */
    clearMessages() {
        this.container.innerHTML = '';
        if (this.emptyHint) {
            this.emptyHint.style.display = 'block';
        }
    },

    /**
     * 获取所有消息（用于保存）
     * @returns {Array} 消息数组
     */
    getMessages() {
        const messages = [];
        this.container.querySelectorAll('.message').forEach(msg => {
            const isUser = msg.classList.contains('user');
            const text = msg.querySelector('.message-bubble')?.textContent;

            // 过滤系统消息
            if (text && !text.includes('要把今天的对话整理成日记吗') &&
                !text.includes('正在整理日记') && !text.includes('好的，对话已保存')) {
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    content: text
                });
            }
        });
        return messages;
    },

    /**
     * 加载历史消息
     * @param {Array} messages - 消息数组
     */
    loadHistory(messages) {
        this.clearMessages();
        messages.forEach(msg => {
            this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'ai', true);
        });
    },

    /**
     * 显示模态框
     * @param {string} title - 标题
     * @param {string} desc - 描述
     * @param {Array} buttons - 按钮数组 [{text, onClick, primary}]
     */
    showModal(title, desc, buttons) {
        const modal = document.createElement('div');
        modal.id = 'diaryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const buttonsHtml = buttons.map(btn => `
            <button onclick="ChatUI.closeModal()" style="
                padding: 12px 32px;
                border-radius: 20px;
                background: ${btn.primary ? 'linear-gradient(135deg, var(--accent-amber), #d4a574)' : 'rgba(255, 255, 255, 0.05)'};
                border: ${btn.primary ? 'none' : '1px solid var(--border-subtle)'};
                color: ${btn.primary ? 'var(--bg-deep)' : 'var(--text-muted)'};
                font-size: 14px;
                cursor: pointer;
            ">${btn.text}</button>
        `).join('');

        modal.innerHTML = `
            <div style="
                background: var(--bg-panel);
                backdrop-filter: blur(24px);
                border: 1px solid var(--border-subtle);
                border-radius: 20px;
                padding: 32px;
                max-width: 400px;
                text-align: center;
            ">
                <div style="font-size: 18px; margin-bottom: 8px;">${title}</div>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">${desc}</div>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    ${buttonsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定按钮事件
        buttons.forEach((btn, i) => {
            modal.querySelectorAll('button')[i].addEventListener('click', () => {
                this.closeModal();
                if (btn.onClick) btn.onClick();
            });
        });
    },

    /**
     * 关闭模态框
     */
    closeModal() {
        const modal = document.getElementById('diaryModal');
        if (modal) modal.remove();
    },

    /**
     * 获取当前时间字符串
     */
    getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
};

// 导出供全局使用
window.ChatUI = ChatUI;
