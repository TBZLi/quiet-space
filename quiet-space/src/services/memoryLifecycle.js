/**
 * Memory Life Cycle Engine - 记忆生命周期引擎
 * 让记忆从"被动存储"变成"主动演化"
 */

const MemoryLifecycle = {
    /**
     * 核心入口：用户每次输入时自动触发
     * @param {string} userMessage - 用户消息
     * @returns {Object} Working Memory
     */
    async onUserMessage(userMessage) {
        console.log('[MemoryLifecycle] Processing user message...');

        // 1. 构建上下文（已有）
        const context = await Storage.buildContext(userMessage);

        // 2. 更新 Thread 生命周期（新增）
        const threadUpdates = await this.updateThreadStates(context.activeThreads, userMessage);

        // 3. 更新情绪趋势（新增）
        const emotion = await this.updateEmotionTimeline(userMessage);

        // 4. 检查 Episodic 压缩（新增）
        const compressed = await this.checkEpisodeCompression();

        // 5. 构建最终的 Working Memory
        const workingMemory = {
            ...context,
            emotionContext: emotion,
            episodicUpdates: compressed,
            threadUpdates: threadUpdates
        };

        console.log('[MemoryLifecycle] Context built:', {
            identity: workingMemory.identity?.length || 0,
            threads: workingMemory.activeThreads?.length || 0,
            people: workingMemory.relevantPeople?.length || 0,
            emotion: workingMemory.emotionContext?.currentEmotion || 'none'
        });

        return workingMemory;
    },

    /**
     * Thread State Engine - 线程状态自动流转
     */
    async updateThreadStates(activeThreads, userMessage) {
        if (!activeThreads || activeThreads.length === 0) {
            return { updatedThreads: [], changedStates: [] };
        }

        const changedStates = [];
        const now = new Date();

        for (const thread of activeThreads) {
            const memory = await Storage.getMemory(thread.id);
            if (!memory) continue;

            const oldStatus = memory.status;
            let newStatus = oldStatus;

            // 计算距离上次提及的天数
            const lastMentioned = memory.lastReferencedAt ? new Date(memory.lastReferencedAt) : new Date(memory.createdAt);
            const daysSinceMention = (now - lastMentioned) / (1000 * 60 * 60 * 24);

            // 状态流转规则
            switch (oldStatus) {
                case 'active':
                    // active → ongoing：提及2次以上
                    if ((memory.referenceCount || 0) >= 2) {
                        newStatus = 'ongoing';
                    }
                    break;

                case 'ongoing':
                    // ongoing → paused：超过7天没提及
                    if (daysSinceMention > 7) {
                        newStatus = 'paused';
                    }
                    // ongoing → resolved：用户明确表示结束
                    if (this._containsEndKeywords(userMessage)) {
                        newStatus = 'resolved';
                        memory.temporal = memory.temporal || {};
                        memory.temporal.endDate = now.toISOString();
                    }
                    break;

                case 'paused':
                    // paused → ongoing：用户再次提及
                    if (this._containsThreadKeywords(userMessage, memory)) {
                        newStatus = 'ongoing';
                    }
                    // paused → resolved：超过30天
                    if (daysSinceMention > 30) {
                        newStatus = 'resolved';
                        memory.temporal = memory.temporal || {};
                        memory.temporal.endDate = now.toISOString();
                    }
                    break;

                case 'resolved':
                    // resolved → archived：超过30天
                    if (daysSinceMention > 30) {
                        newStatus = 'archived';
                    }
                    break;
            }

            // 如果状态发生变化，更新数据库
            if (newStatus !== oldStatus) {
                memory.status = newStatus;
                memory.updatedAt = now.toISOString();
                await Storage.saveMemory(memory);

                changedStates.push({
                    id: memory.id,
                    threadKey: memory.threadKey,
                    from: oldStatus,
                    to: newStatus
                });

                console.log(`[ThreadEngine] ${memory.threadKey}: ${oldStatus} → ${newStatus}`);
            }
        }

        return {
            updatedThreads: activeThreads,
            changedStates
        };
    },

    /**
     * 检查消息是否包含结束关键词
     */
    _containsEndKeywords(message) {
        const endKeywords = ['结束了', '完成了', '搞定了', '做完了', '结束了', 'done', 'finished'];
        return endKeywords.some(keyword => message.includes(keyword));
    },

    /**
     * 检查消息是否包含线程相关关键词
     */
    _containsThreadKeywords(message, memory) {
        if (memory.threadKey) {
            const keywords = memory.threadKey.split('_');
            return keywords.some(keyword => message.includes(keyword));
        }
        if (memory.content) {
            const contentKeywords = memory.content.substring(0, 10).split('');
            return contentKeywords.some(keyword => message.includes(keyword));
        }
        return false;
    },

    /**
     * Emotion Update Engine - 情绪趋势更新
     */
    async updateEmotionTimeline(userMessage) {
        // 简单情绪检测（后续可以用 AI 增强）
        const detectedEmotion = this._detectEmotion(userMessage);

        // 获取最近的情绪记录
        const recentEmotions = await this._getRecentEmotions();

        // 计算趋势
        const trend = this._calculateTrend(detectedEmotion, recentEmotions);

        // 保存情绪记录
        await this._saveEmotionRecord(detectedEmotion, trend);

        return {
            currentEmotion: detectedEmotion.emotion,
            intensity: detectedEmotion.intensity,
            trend: trend
        };
    },

    /**
     * 简单情绪检测
     */
    _detectEmotion(message) {
        const emotionPatterns = {
            stress: ['压力', '焦虑', '紧张', '累', '疲惫', '忙'],
            joy: ['开心', '高兴', '棒', '好', '不错', '终于'],
            sadness: ['难过', '伤心', '失望', '糟糕'],
            calm: ['平静', '还好', '一般']
        };

        let detectedEmotion = 'calm';
        let intensity = 0.5;

        for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
            const matchCount = patterns.filter(p => message.includes(p)).length;
            if (matchCount > 0) {
                detectedEmotion = emotion;
                intensity = Math.min(1, 0.5 + matchCount * 0.15);
                break;
            }
        }

        // 积极词汇降低强度
        const positiveWords = ['终于', '完成', '成功', '好'];
        const positiveCount = positiveWords.filter(p => message.includes(p)).length;
        if (positiveCount > 0 && detectedEmotion === 'stress') {
            intensity = Math.max(0.1, intensity - positiveCount * 0.2);
        }

        return { emotion: detectedEmotion, intensity };
    },

    /**
     * 获取最近的情绪记录
     */
    async _getRecentEmotions() {
        await Storage.init();
        const timeline = await DB.getAll('emotionTimeline');
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return timeline
            .filter(r => new Date(r.timestamp) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
    },

    /**
     * 计算情绪趋势
     */
    _calculateTrend(currentEmotion, recentEmotions) {
        if (recentEmotions.length === 0) return 'stable';

        const recentIntensities = recentEmotions.map(e => e.emotions?.intensity || 0.5);
        const avgRecent = recentIntensities.reduce((a, b) => a + b, 0) / recentIntensities.length;

        if (currentEmotion.intensity > avgRecent + 0.1) return 'escalating';
        if (currentEmotion.intensity < avgRecent - 0.1) return 'improving';
        return 'stable';
    },

    /**
     * 保存情绪记录
     */
    async _saveEmotionRecord(detectedEmotion, trend) {
        await Storage.init();
        const record = {
            id: 'emo_' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            sourceType: 'conversation',
            emotions: {
                [detectedEmotion.emotion]: detectedEmotion.intensity
            },
            dominantEmotion: detectedEmotion.emotion,
            trend: trend
        };

        await DB.put('emotionTimeline', record);
    },

    /**
     * Episodic Compression Engine - 情景记忆压缩
     */
    async checkEpisodeCompression() {
        await Storage.init();

        // 获取30天前的情景记忆
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const memories = await DB.getAll('memories');

        const oldEpisodes = memories
            .filter(m => m.memoryCategory === 'event' && new Date(m.createdAt) < thirtyDaysAgo)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (oldEpisodes.length < 3) {
            return { compressed: false, count: 0 };
        }

        // 按时间分组（按月）
        const grouped = this._groupByMonth(oldEpisodes);

        // 压缩每个月的记忆
        const compressedMemories = [];
        for (const [month, episodes] of Object.entries(grouped)) {
            if (episodes.length >= 3) {
                const compressed = await this._compressEpisodes(episodes, month);
                compressedMemories.push(compressed);

                // 删除原始记忆
                for (const ep of episodes) {
                    await Storage.deleteMemory(ep.id);
                }
            }
        }

        if (compressedMemories.length > 0) {
            console.log(`[EpisodicCompression] Compressed ${oldEpisodes.length} episodes into ${compressedMemories.length} summaries`);
        }

        return {
            compressed: compressedMemories.length > 0,
            count: compressedMemories.length,
            memories: compressedMemories
        };
    },

    /**
     * 按月分组
     */
    _groupByMonth(episodes) {
        const grouped = {};
        for (const ep of episodes) {
            const month = ep.createdAt.substring(0, 7); // "2026-06"
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(ep);
        }
        return grouped;
    },

    /**
     * 压缩多个情景记忆为一个总结
     */
    async _compressEpisodes(episodes, month) {
        // 提取关键词
        const allContent = episodes.map(e => e.content).join('；');
        const keywords = this._extractKeyEvents(allContent);

        // 计算平均重要性
        const avgImportance = Math.round(
            episodes.reduce((sum, e) => sum + (e.importance || 5), 0) / episodes.length
        );

        // 创建压缩后的记忆
        const compressed = {
            id: 'compressed_' + Date.now().toString(36),
            type: 'event',
            content: `${month}：${keywords.join('、')}`,
            memoryCategory: 'event',
            importance: Math.min(10, avgImportance + 1), // 压缩后重要性+1
            createdAt: new Date().toISOString(),
            temporal: {
                startDate: `${month}-01`,
                endDate: `${month}-28`,
                timeBucket: month
            },
            isCompressed: true,
            originalCount: episodes.length
        };

        await Storage.saveMemory(compressed);
        return compressed;
    },

    /**
     * 提取关键事件
     */
    _extractKeyEvents(content) {
        const events = [];
        const patterns = [
            /完成[^，。；]+/g,
            /开始[^，。；]+/g,
            /优化[^，。；]+/g,
            /修复[^，。；]+/g,
            /新增[^，。；]+/g
        ];

        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                events.push(...matches.slice(0, 2));
            }
        }

        return events.length > 0 ? events.slice(0, 3) : ['日常记录'];
    }
};

// 导出供全局使用
window.MemoryLifecycle = MemoryLifecycle;
