/**
 * 记忆服务 - 处理记忆提取、合并、召回
 * 这是 Quiet Space Memory Engine 的核心
 */

const MemoryService = {
    /**
     * 获取 AI API 配置
     */
    async _getApiConfig() {
        const settings = await Storage.getSettings();
        if (!settings.apiEndpoint || !settings.apiKey) {
            return null;
        }
        return {
            endpoint: settings.apiEndpoint,
            apiKey: settings.apiKey,
            model: settings.modelName || 'mimo-v2.5'
        };
    },

    /**
     * 调用 AI API
     */
    async _callAI(prompt, maxTokens = 1000) {
        const config = await this._getApiConfig();
        if (!config) return null;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: config.endpoint,
                    apiKey: config.apiKey,
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens
                })
            });

            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
        } catch (error) {
            console.error('Memory AI Error:', error);
            return null;
        }
    },

    /**
     * 解析 JSON 响应
     */
    _parseJSON(text) {
        if (!text) return null;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('JSON parse error:', e);
                return null;
            }
        }
        return null;
    },

    /**
     * Memory Extraction - 记忆提取
     * 从对话中识别值得记住的信息
     */
    async extractMemories(conversation, existingMemories = []) {
        const config = this._getApiConfig();
        if (!config) return [];

        const prompt = `你是 Quiet Space 的记忆提取系统。从对话中识别值得长期记住的信息。

记忆宪法：
1. 宁缺毋滥：只记对未来陪伴有价值的信息
2. 事实优先：区分用户明确说的 vs AI猜的
3. 人生线程优先：长期事件比单次事件更重要
4. 情绪节点值得记：情绪变化是人生时间线的重要组成

输入：
最近对话：${conversation.slice(-20).map(m => `${m.role}: ${m.content}`).join('\n')}

已有记忆：${existingMemories.map(m => `[${m.type}] ${m.content}`).join('\n') || '无'}

规则：
- 每次最多输出 3 条新记忆
- 如果没有值得记住的信息，输出空数组
- 不要重复已有的记忆

输出格式（JSON）：
{
  "memories": [
    {
      "type": "event|person|preference|thread",
      "content": "记忆内容",
      "importance": 1-10,
      "confidence": 0.0-1.0,
      "isConfirmed": true|false,
      "tags": ["标签"],
      "temporal": {
        "startDate": "日期或null",
        "endDate": "日期或null",
        "isRecurring": false,
        "periodLabel": "时间标签或null"
      }
    }
  ]
}`;

        const result = await this._callAI(prompt);
        const parsed = this._parseJSON(result);

        if (parsed && parsed.memories) {
            // 为每条记忆生成 ID
            return parsed.memories.map(m => ({
                ...m,
                id: 'mem_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                referenceCount: 0,
                lastReferencedAt: null,
                decayScore: 1,
                status: 'active'
            }));
        }

        return [];
    },

    /**
     * Memory Consolidation - 记忆合并
     * 合并新记忆与已有记忆
     */
    async consolidateMemories(newMemories, existingMemories) {
        const config = this._getApiConfig();
        if (!config) return { actions: [] };

        const prompt = `你是 Quiet Space 的记忆合并系统。将新记忆与已有记忆进行合并。

新记忆：
${newMemories.map(m => `[${m.type}] ${m.content} (importance: ${m.importance})`).join('\n')}

已有记忆：
${existingMemories.map(m => `[${m.id}] [${m.type}] ${m.content} (status: ${m.status || 'active'})`).join('\n') || '无'}

规则：
- 避免重复：相似记忆应该合并
- Thread 状态：active → ongoing → paused → resolved
- Person 状态化：关系变化更新状态，不删除记忆
- 时间更新：事件结束时设置 endDate

输出格式（JSON）：
{
  "actions": [
    {
      "action": "create|update",
      "memoryId": "existing_id 或 null",
      "memory": { ... }
    }
  ]
}`;

        const result = await this._callAI(prompt);
        const parsed = this._parseJSON(result);

        return parsed || { actions: [] };
    },

    /**
     * Memory Recall - 记忆召回
     * 识别哪些记忆与当前对话相关
     */
    async recallMemories(userMessage, relevantMemories) {
        if (!relevantMemories || relevantMemories.length === 0) {
            return { recallSuggestions: [] };
        }

        const config = this._getApiConfig();
        if (!config) return { recallSuggestions: [] };

        const prompt = `你是 Quiet Space 的记忆召回系统。识别哪些记忆与用户当前消息相关。

用户消息：${userMessage}

相关记忆：
${relevantMemories.map(m => `[${m.id}] [${m.type}] ${m.content} (importance: ${m.importance}, referenced: ${m.referenceCount || 0}次)`).join('\n')}

规则：
- 优先引用当前时间相关的记忆
- 区分不同时间的同类事件
- referenceCount 越高，引用权重越低
- 每次最多建议 2 条记忆

输出格式（JSON）：
{
  "recallSuggestions": [
    {
      "memoryId": "mem_xxx",
      "recallType": "direct|indirect|emotional",
      "suggestedPhrasing": "建议的引用方式",
      "context": "为什么这条记忆相关"
    }
  ]
}`;

        const result = await this._callAI(prompt, 500);
        const parsed = this._parseJSON(result);

        return parsed || { recallSuggestions: [] };
    },

    /**
     * 获取活跃记忆（按重要性和衰减排序）
     */
    async getActiveMemories() {
        await Storage.init();
        return await Storage.getActiveMemories();
    },

    /**
     * 处理对话结束后的记忆流程
     */
    async processConversationEnd(conversation) {
        // 1. 获取已有记忆
        const existingMemories = await this.getActiveMemories();

        // 2. 提取新记忆
        const newMemories = await this.extractMemories(conversation, existingMemories);

        if (newMemories.length === 0) {
            console.log('No new memories extracted');
            return;
        }

        // 3. 合并记忆
        const consolidationResult = await this.consolidateMemories(newMemories, existingMemories);

        // 4. 执行合并操作
        if (consolidationResult.actions && consolidationResult.actions.length > 0) {
            await Storage.executeConsolidation(consolidationResult.actions);
        }

        // 5. 保存新记忆
        for (const memory of newMemories) {
            await Storage.saveMemory(memory);
        }

        console.log(`Extracted ${newMemories.length} new memories`);
    },

    /**
     * 处理对话开始时的记忆加载
     */
    async processConversationStart() {
        // 应用记忆衰减
        await Storage.applyMemoryDecay();

        // 获取活跃记忆
        const memories = await this.getActiveMemories();

        // 返回用于注入 Prompt 的记忆摘要
        return memories.slice(0, 20).map(m => ({
            type: m.type,
            content: m.content,
            importance: m.importance,
            temporal: m.temporal
        }));
    },

    /**
     * 更新记忆引用
     */
    async referenceMemory(memoryId) {
        return await Storage.referenceMemory(memoryId);
    }
};

// 导出供全局使用
window.MemoryService = MemoryService;
