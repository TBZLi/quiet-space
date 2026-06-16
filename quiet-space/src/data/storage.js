/**
 * 数据层 - 统一管理 IndexedDB
 * 从 localStorage 迁移，提供更大容量和事务支持
 */

const Storage = {
    _initialized: false,

    /**
     * 初始化存储层（自动迁移 localStorage 数据）
     */
    async init() {
        if (this._initialized) return;

        // 等待 IndexedDB 初始化
        await DB.init();

        // 检查是否需要迁移 localStorage 数据
        await this._migrateFromLocalStorage();

        this._initialized = true;
    },

    /**
     * 数据迁移：从 localStorage 迁移到 IndexedDB
     */
    async _migrateFromLocalStorage() {
        // 检查是否已经迁移过
        const migrated = await DB.getSetting('migratedFromLocalStorage');
        if (migrated) return;

        console.log('开始迁移 localStorage 数据到 IndexedDB...');

        // 迁移日记
        const diaries = JSON.parse(localStorage.getItem('quietSpaceDiaries') || '[]');
        for (const diary of diaries) {
            await DB.put('diaries', diary);
        }

        // 迁移对话
        const chats = JSON.parse(localStorage.getItem('quietSpaceChats') || '[]');
        for (const chat of chats) {
            await DB.put('chats', chat);
        }

        // 迁移碎碎念
        const fragments = JSON.parse(localStorage.getItem('quietSpaceFragments') || '[]');
        for (const fragment of fragments) {
            await DB.put('fragments', fragment);
        }

        // 迁移设置
        const settings = JSON.parse(localStorage.getItem('quietSpaceSettings') || '{}');
        if (Object.keys(settings).length > 0) {
            await DB.putSetting('userSettings', settings);
        }

        // 迁移当前编辑状态
        const currentDiary = localStorage.getItem('currentDiary');
        if (currentDiary) {
            await DB.putSetting('currentDiary', JSON.parse(currentDiary));
        }

        // 标记迁移完成
        await DB.putSetting('migratedFromLocalStorage', true);

        console.log('localStorage 数据迁移完成');
    },

    // ========== 日记 ==========
    async getDiaries() {
        await this.init();
        const diaries = await DB.getAll('diaries');
        // 按日期降序排列
        return diaries.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async saveDiary(diary) {
        await this.init();
        return await DB.put('diaries', diary);
    },

    async getDiary(id) {
        await this.init();
        return await DB.get('diaries', id);
    },

    async deleteDiary(id) {
        await this.init();
        return await DB.delete('diaries', id);
    },

    // ========== 对话 ==========
    async getChats() {
        await this.init();
        const chats = await DB.getAll('chats');
        return chats.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async saveChat(chat) {
        await this.init();
        return await DB.put('chats', chat);
    },

    async getChat(id) {
        await this.init();
        return await DB.get('chats', id);
    },

    async deleteChat(id) {
        await this.init();
        return await DB.delete('chats', id);
    },

    // ========== 碎碎念 ==========
    async getFragments() {
        await this.init();
        const fragments = await DB.getAll('fragments');
        return fragments.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async saveFragment(fragment) {
        await this.init();
        return await DB.put('fragments', fragment);
    },

    async deleteFragment(id) {
        await this.init();
        return await DB.delete('fragments', id);
    },

    // ========== 记忆 ==========
    async getMemories() {
        await this.init();
        const memories = await DB.getAll('memories');
        return memories.sort((a, b) => b.importance - a.importance);
    },

    async getMemoriesByType(type) {
        await this.init();
        const memories = await DB.getAll('memories');
        return memories.filter(m => m.type === type).sort((a, b) => b.importance - a.importance);
    },

    async saveMemory(memory) {
        await this.init();
        // 设置默认值
        if (!memory.createdAt) memory.createdAt = new Date().toISOString();
        memory.updatedAt = new Date().toISOString();
        if (!memory.referenceCount) memory.referenceCount = 0;
        return await DB.put('memories', memory);
    },

    async getMemory(id) {
        await this.init();
        return await DB.get('memories', id);
    },

    async deleteMemory(id) {
        await this.init();
        return await DB.delete('memories', id);
    },

    async searchMemories(query) {
        await this.init();
        const memories = await DB.getAll('memories');
        const lowerQuery = query.toLowerCase();
        return memories.filter(m =>
            m.content.toLowerCase().includes(lowerQuery) ||
            (m.tags && m.tags.some(t => t.toLowerCase().includes(lowerQuery)))
        ).sort((a, b) => b.importance - a.importance);
    },

    /**
     * 更新记忆引用信息
     */
    async referenceMemory(id) {
        await this.init();
        const memory = await DB.get('memories', id);
        if (!memory) return null;
        memory.lastReferencedAt = new Date().toISOString();
        memory.referenceCount = (memory.referenceCount || 0) + 1;
        return await DB.put('memories', memory);
    },

    /**
     * 批量保存记忆（从 Extraction 结果）
     */
    async saveMemories(memories) {
        await this.init();
        const results = [];
        for (const memory of memories) {
            results.push(await this.saveMemory(memory));
        }
        return results;
    },

    /**
     * 执行记忆合并操作（从 Consolidation 结果）
     */
    async executeConsolidation(actions) {
        await this.init();
        for (const action of actions) {
            switch (action.action) {
                case 'create':
                    await this.saveMemory(action.memory);
                    break;
                case 'update':
                    if (action.memoryId) {
                        const existing = await DB.get('memories', action.memoryId);
                        if (existing) {
                            const updated = { ...existing, ...action.memory, updatedAt: new Date().toISOString() };
                            await DB.put('memories', updated);
                        }
                    }
                    break;
                case 'delete':
                    if (action.memoryId) {
                        await DB.delete('memories', action.memoryId);
                    }
                    break;
            }
        }
    },

    /**
     * 记忆衰减：更新所有记忆的 decayScore
     * 应用在对话开始时调用
     */
    async applyMemoryDecay() {
        await this.init();
        const memories = await DB.getAll('memories');
        const now = new Date();

        for (const memory of memories) {
            const lastRef = memory.lastReferencedAt ? new Date(memory.lastReferencedAt) : null;
            const daysSinceLastRef = lastRef ? (now - lastRef) / (1000 * 60 * 60 * 24) : 365;

            // 每30天未引用，decayScore -0.1
            if (daysSinceLastRef > 30) {
                const decayAmount = Math.floor(daysSinceLastRef / 30) * 0.1;
                memory.decayScore = Math.max(0.1, (memory.decayScore || 1) - decayAmount);

                // 衰减 importance
                if (memory.decayScore < 0.3) {
                    memory.status = 'archived';
                }

                await DB.put('memories', memory);
            }
        }
    },

    /**
     * 获取活跃记忆（按衰减分数和重要性排序）
     */
    async getActiveMemories() {
        await this.init();
        const memories = await DB.getAll('memories');
        return memories
            .filter(m => m.status !== 'archived')
            .sort((a, b) => {
                // 综合分数 = importance * 0.6 + decayScore * 0.4
                const scoreA = (a.importance || 5) * 0.6 + (a.decayScore || 1) * 0.4;
                const scoreB = (b.importance || 5) * 0.6 + (b.decayScore || 1) * 0.4;
                return scoreB - scoreA;
            });
    },

    // ========== 情绪时间线 ==========
    async getEmotionTimeline() {
        await this.init();
        const timeline = await DB.getAll('emotionTimeline');
        return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    async addEmotionRecord(record) {
        await this.init();
        return await DB.put('emotionTimeline', record);
    },

    async getEmotionsBySource(sourceId) {
        await this.init();
        const timeline = await DB.getAll('emotionTimeline');
        return timeline.filter(r => r.sourceId === sourceId);
    },

    async getEmotionsByDateRange(startDate, endDate) {
        await this.init();
        const timeline = await DB.getAll('emotionTimeline');
        return timeline.filter(r => {
            const date = new Date(r.timestamp);
            return date >= startDate && date <= endDate;
        });
    },

    // ========== 设置 ==========
    async getSettings() {
        await this.init();
        const settings = await DB.getSetting('userSettings');
        return settings || {};
    },

    async saveSettings(settings) {
        await this.init();
        return await DB.putSetting('userSettings', settings);
    },

    // ========== 当前编辑状态 ==========
    async getCurrentDiary() {
        await this.init();
        const data = await DB.getSetting('currentDiary');
        return data || null;
    },

    async setCurrentDiary(diary) {
        await this.init();
        return await DB.putSetting('currentDiary', diary);
    },

    async clearCurrentDiary() {
        await this.init();
        return await DB.putSetting('currentDiary', null);
    }
};

// 导出供全局使用
window.Storage = Storage;
