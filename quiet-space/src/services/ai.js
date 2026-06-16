/**
 * AI服务层 - 处理所有AI相关调用
 * 集成 Memory Engine（记忆系统）
 */

const AIService = {
    /**
     * 陪伴人格系统提示词
     */
    _companionPrompt: `你是 Quiet Space 的陪伴朋友。

核心原则：
1. 陪伴优先于解决问题：用户需要的是被理解，不是被教育
2. 自然引用记忆：像朋友聊天一样自然，绝不展示"记忆行为"
3. 情绪同步：感知用户情绪，调整回应方式
4. 不抢戏：先理解，再回应。不主动给解决方案，不长篇大论

回复风格：
- 简短、温暖、有耐心
- 像朋友一样自然
- 不要使用"根据记录"、"根据记忆库"等AI感表达
- 可以说"我记得你提过"、"好像之前聊过"

禁止：
- 给建议（除非用户明确要求）
- 长篇大论
- 说教
- 展示"记忆行为"`,

    /**
     * 聊天对话（带记忆系统）
     * @param {string} message - 用户消息
     * @param {Array} history - 历史消息（可选）
     * @param {boolean} enableMemory - 是否启用记忆系统
     * @returns {Promise<string>} AI回复
     */
    async chat(message, history = [], enableMemory = true) {
        const settings = Storage.getSettings();

        if (!settings.apiEndpoint || !settings.apiKey) {
            return "请先在设置中配置API Key。";
        }

        try {
            // 构建消息
            const messages = [];

            // 如果启用记忆系统，添加系统提示词 + 记忆上下文
            if (enableMemory && typeof MemoryService !== 'undefined') {
                // 加载记忆上下文
                const memoryContext = await this._loadMemoryContext(message);

                // 构建系统提示词
                let systemPrompt = this._companionPrompt;

                if (memoryContext.memories.length > 0) {
                    systemPrompt += `\n\n关于用户的重要记忆：\n${memoryContext.memories.map((m, i) => `${i + 1}. ${m.content}`).join('\n')}`;
                }

                if (memoryContext.recallSuggestions.length > 0) {
                    systemPrompt += `\n\n可以自然引用的记忆：\n${memoryContext.recallSuggestions.map(s => `- ${s.suggestedPhrasing} (相关度: ${s.context})`).join('\n')}`;
                }

                messages.push({ role: 'system', content: systemPrompt });
            }

            // 添加历史消息
            messages.push(...history.map(h => ({ role: h.role, content: h.content })));

            // 添加当前用户消息
            messages.push({ role: 'user', content: message });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: settings.apiEndpoint,
                    apiKey: settings.apiKey,
                    model: settings.modelName || 'mimo-v2.5',
                    messages: messages,
                    max_tokens: 300
                })
            });

            const data = await response.json();

            let reply = "我暂时无法回应，但我在听。";

            // OpenAI格式
            if (data.choices && data.choices[0]) {
                reply = data.choices[0].message.content;
            }

            // Anthropic格式
            if (data.content && data.content[0]) {
                const textBlock = data.content.find(c => c.type === 'text');
                if (textBlock) reply = textBlock.text;
            }

            // 更新记忆引用
            if (enableMemory && memoryContext?.recallSuggestions) {
                for (const suggestion of memoryContext.recallSuggestions) {
                    await MemoryService.referenceMemory(suggestion.memoryId);
                }
            }

            return reply;
        } catch (error) {
            console.error('AI Chat Error:', error);
            return "网络有问题，但你说的话我都记着。";
        }
    },

    /**
     * 加载记忆上下文
     */
    async _loadMemoryContext(userMessage) {
        try {
            // 获取活跃记忆
            const memories = await MemoryService.getActiveMemories();

            // 召回相关记忆
            const recallResult = await MemoryService.recallMemories(userMessage, memories);

            return {
                memories: memories.slice(0, 10),  // 最多10条记忆
                recallSuggestions: recallResult.recallSuggestions || []
            };
        } catch (error) {
            console.error('Load Memory Context Error:', error);
            return { memories: [], recallSuggestions: [] };
        }
    },

    /**
     * 处理对话结束（触发记忆提取）
     * @param {Array} conversation - 完整对话记录
     */
    async endConversation(conversation) {
        if (typeof MemoryService !== 'undefined' && conversation.length > 0) {
            try {
                await MemoryService.processConversationEnd(conversation);
            } catch (error) {
                console.error('End Conversation Error:', error);
            }
        }
    },

    /**
     * 生成日记
     * @param {Array} messages - 对话内容
     * @returns {Promise<Object>} 日记对象 {title, content, emotions}
     */
    async generateDiary(messages) {
        const settings = Storage.getSettings();

        if (!settings.apiEndpoint || !settings.apiKey) {
            return {
                title: '今天的记录',
                content: '请先配置API。',
                emotions: ['平静']
            };
        }

        const prompt = `你是一个温柔的日记助手。请根据以下对话内容，整理成一篇日记。

要求：
1. 生成一个简短的标题（不超过10个字）
2. 整理对话内容为流畅的日记正文
3. 提取2-3个情绪标签（如：平静、开心、难过、焦虑等）
4. 保持用户原话的情感，不要夸大或缩小

对话内容：
${messages.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`).join('\n')}

请用JSON格式返回：
{
    "title": "日记标题",
    "content": "日记正文",
    "emotions": ["情绪1", "情绪2"]
}`;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: settings.apiEndpoint,
                    apiKey: settings.apiKey,
                    model: settings.modelName || 'mimo-v2.5',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                title: '今天的记录',
                content: content,
                emotions: ['平静']
            };
        } catch (error) {
            console.error('AI Generate Diary Error:', error);
            return {
                title: '今天的记录',
                content: '日记生成失败，请手动编辑。',
                emotions: ['平静']
            };
        }
    },

    /**
     * 整理碎碎念为日记
     * @param {Array} fragments - 碎碎念内容
     * @returns {Promise<Object>} 日记对象 {title, content, emotions}
     */
    async organizeFragments(fragments) {
        const settings = Storage.getSettings();

        if (!settings.apiEndpoint || !settings.apiKey) {
            return null;
        }

        const prompt = `你是一个温柔的日记助手。请根据以下零碎想法，整理成一篇连贯的日记。

要求：
1. 生成一个简短的标题（不超过10个字）
2. 把零碎想法串联成流畅的日记正文
3. 提取2-3个情绪标签
4. 保持用户原话的情感

零碎想法：
${fragments.map((f, i) => `${i + 1}. ${f.text}`).join('\n')}

请用JSON格式返回：
{
    "title": "日记标题",
    "content": "日记正文",
    "emotions": ["情绪1", "情绪2"]
}`;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: settings.apiEndpoint,
                    apiKey: settings.apiKey,
                    model: settings.modelName || 'mimo-v2.5',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                title: '碎碎念整理',
                content: content,
                emotions: ['平静']
            };
        } catch (error) {
            console.error('AI Organize Fragments Error:', error);
            return null;
        }
    },

    /**
     * 测试API连接
     * @returns {Promise<boolean>} 是否成功
     */
    async testConnection() {
        const settings = Storage.getSettings();

        if (!settings.apiEndpoint || !settings.apiKey) {
            return false;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: settings.apiEndpoint,
                    apiKey: settings.apiKey,
                    model: settings.modelName || 'mimo-v2.5',
                    messages: [{ role: 'user', content: 'hi' }],
                    max_tokens: 50
                })
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// 导出供全局使用
window.AIService = AIService;
