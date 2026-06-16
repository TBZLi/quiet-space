/**
 * Memory System Debug Mode - 记忆系统调试层
 * 让系统"可解释 + 可控"
 */

const MemoryDebug = {
    // 调试日志存储
    logs: [],

    /**
     * 运行调试分析
     * @param {string} userMessage - 用户消息
     * @param {Object} lifecycleResult - MemoryLifecycle 的结果
     * @returns {Object} 调试报告
     */
    run(userMessage, lifecycleResult) {
        const debugReport = {
            timestamp: new Date().toISOString(),
            userMessage,

            // Context Debug
            contextDebug: this._debugContext(userMessage, lifecycleResult),

            // Thread Debug
            threadDebug: this._debugThreads(lifecycleResult),

            // Emotion Debug
            emotionDebug: this._debugEmotion(userMessage, lifecycleResult),

            // Episodic Debug
            episodicDebug: this._debugEpisodic(lifecycleResult),

            // Final Working Memory（带来源）
            finalWorkingMemory: this._buildDebugWorkingMemory(lifecycleResult)
        };

        // 存储日志
        this.logs.push(debugReport);
        if (this.logs.length > 100) {
            this.logs.shift();
        }

        // 控制台输出
        this._printDebugReport(debugReport);

        return debugReport;
    },

    /**
     * Context Debug - 解释每条记忆为什么被选中
     */
    _debugContext(userMessage, result) {
        const wm = result.workingMemory || result;
        const debug = {
            identity: [],
            activeThreads: [],
            relevantPeople: [],
            emotionalContext: [],
            recentEpisodes: [],
            relevantPreferences: []
        };

        // Identity - 永远包含
        if (wm.identity) {
            debug.identity = wm.identity.map(m => ({
                ...m,
                reason: "always_include_identity",
                weight: 1.0
            }));
        }

        // Active Threads - 解释为什么被选中
        if (wm.activeThreads) {
            debug.activeThreads = wm.activeThreads.map(m => {
                const score = m.score || 0;
                const reason = this._explainThreadSelection(m, userMessage);
                return {
                    content: m.content,
                    threadKey: m.threadKey,
                    status: m.status,
                    score,
                    reason
                };
            });
        }

        // Relevant People - 解释相关性
        if (wm.relevantPeople) {
            debug.relevantPeople = wm.relevantPeople.map(m => ({
                content: m.content,
                name: m.name,
                score: m.relevance,
                reason: this._explainPersonRelevance(m, userMessage)
            }));
        }

        // Emotional Context
        if (wm.emotionalContext) {
            debug.emotionalContext = wm.emotionalContext.map(m => ({
                content: m.content,
                emotion: m.emotion,
                intensity: m.intensity,
                reason: "recent_emotion_within_7_days"
            }));
        }

        // Recent Episodes
        if (wm.recentEpisodes) {
            debug.recentEpisodes = wm.recentEpisodes.map(m => ({
                content: m.content,
                date: m.date,
                reason: "recent_event_within_7_days"
            }));
        }

        // Relevant Preferences
        if (wm.relevantPreferences) {
            debug.relevantPreferences = wm.relevantPreferences.map(m => ({
                content: m.content,
                reason: this._explainPreferenceRelevance(m, userMessage)
            }));
        }

        return debug;
    },

    /**
     * 解释线程选择原因
     */
    _explainThreadSelection(thread, userMessage) {
        const reasons = [];

        // 检查关键词匹配
        if (thread.threadKey) {
            const keywords = thread.threadKey.split('_');
            const matched = keywords.filter(k => userMessage.includes(k));
            if (matched.length > 0) {
                reasons.push(`keyword_match: '${matched.join("', '")}'`);
            }
        }

        // 检查状态
        if (thread.status === 'ongoing') {
            reasons.push("status: ongoing");
        }

        // 检查分数
        if (thread.score > 0.7) {
            reasons.push("high_relevance_score");
        }

        return reasons.length > 0 ? reasons : ["selected_by_default"];
    },

    /**
     * 解释人物相关性
     */
    _explainPersonRelevance(person, userMessage) {
        if (person.name && userMessage.includes(person.name)) {
            return `name_mentioned_in_message: '${person.name}'`;
        }
        return "relationship_memory_selected";
    },

    /**
     * 解释偏好相关性
     */
    _explainPreferenceRelevance(preference, userMessage) {
        const content = preference.content || '';
        if (content.includes('不喜欢') && userMessage.includes('建议')) {
            return "negative_preference_relevant_to_advice_request";
        }
        return "general_preference";
    },

    /**
     * Thread Debug - 解释状态变化
     */
    _debugThreads(result) {
        const threadUpdates = result.threadUpdates || result.workingMemory?.threadUpdates;
        const debug = [];

        if (!threadUpdates?.changedStates) {
            return debug;
        }

        for (const change of threadUpdates.changedStates) {
            const reasons = [];

            // 解释为什么变化
            if (change.to === 'ongoing' && change.from === 'active') {
                reasons.push("reference_count >= 2");
            }

            if (change.to === 'paused') {
                reasons.push("no_activity_for > 7 days");
            }

            if (change.to === 'resolved') {
                reasons.push("user_explicit_completion");
            }

            if (change.to === 'archived') {
                reasons.push("resolved_for > 30 days");
            }

            debug.push({
                threadId: change.id,
                threadKey: change.threadKey,
                from: change.from,
                to: change.to,
                reason: reasons,
                confidence: 0.9
            });
        }

        // 没有变化的线程
        if (threadUpdates.updatedThreads) {
            for (const thread of threadUpdates.updatedThreads) {
                if (!debug.find(d => d.threadId === thread.id)) {
                    debug.push({
                        threadId: thread.id,
                        threadKey: thread.threadKey,
                        status: thread.status,
                        reason: ["no_trigger"]
                    });
                }
            }
        }

        return debug;
    },

    /**
     * Emotion Debug - 防止乱推断
     */
    _debugEmotion(userMessage, result) {
        const emotion = result.emotionContext || result.workingMemory?.emotionContext;
        if (!emotion) {
            return {
                detected: "unknown",
                intensity: 0,
                signals: [],
                trend: { direction: "unknown" }
            };
        }

        // 分析信号来源
        const signals = [];
        const emotionPatterns = {
            stress: ['压力', '焦虑', '紧张', '累', '疲惫'],
            joy: ['开心', '高兴', '棒', '好', '终于'],
            sadness: ['难过', '伤心', '失望', '糟糕'],
            calm: ['平静', '还好', '一般']
        };

        for (const [emotionType, patterns] of Object.entries(emotionPatterns)) {
            const matched = patterns.filter(p => userMessage.includes(p));
            if (matched.length > 0) {
                signals.push({
                    type: "keyword",
                    value: matched.join("', '"),
                    weight: Math.min(1, matched.length * 0.2)
                });
            }
        }

        // 检查是否过度推断
        const isOverInference = signals.length === 0 && emotion.intensity > 0.5;

        return {
            detected: emotion.currentEmotion || emotion.emotion || 'unknown',
            intensity: emotion.intensity || 0.5,
            signals,
            trend: {
                direction: emotion.trend || 'stable'
            },
            warning: isOverInference ? "possible_over_inference" : null
        };
    },

    /**
     * Episodic Debug - 压缩透明化
     */
    _debugEpisodic(result) {
        const compressed = result.episodicUpdates || result.workingMemory?.episodicUpdates;

        if (!compressed || !compressed.compressed) {
            return {
                triggered: false,
                reason: "no_compression_needed"
            };
        }

        return {
            triggered: true,
            reason: "older_than_30_days",
            count: compressed.count || 0,
            memories: (compressed.memories || []).map(m => ({
                content: m.content,
                originalCount: m.originalCount,
                importance: m.importance
            }))
        };
    },

    /**
     * 构建带来源的 Working Memory
     */
    _buildDebugWorkingMemory(result) {
        const wm = result.workingMemory || result;
        const debug = {};

        if (wm.identity) {
            debug.identity = wm.identity.map(m => ({
                content: m.content,
                source: "contextBuilder.identity"
            }));
        }

        if (wm.activeThreads) {
            debug.activeThreads = wm.activeThreads.map(m => ({
                content: m.content,
                threadKey: m.threadKey,
                source: "contextBuilder.activeThreads"
            }));
        }

        if (wm.relevantPeople) {
            debug.relevantPeople = wm.relevantPeople.map(m => ({
                content: m.content,
                source: "contextBuilder.relevantPeople"
            }));
        }

        if (wm.emotionalContext) {
            debug.emotionalContext = wm.emotionalContext.map(m => ({
                content: m.content || m.currentEmotion,
                source: "emotionEngine"
            }));
        }

        if (wm.recentEpisodes) {
            debug.recentEpisodes = wm.recentEpisodes.map(m => ({
                content: m.content,
                source: "contextBuilder.recentEpisodes"
            }));
        }

        return debug;
    },

    /**
     * 打印调试报告
     */
    _printDebugReport(report) {
        console.log('='.repeat(60));
        console.log('[MemoryDebug] User Message:', report.userMessage);
        console.log('='.repeat(60));

        // Context Summary
        const ctx = report.contextDebug;
        console.log('\n[Context Builder]');
        console.log('  Identity:', ctx.identity?.length || 0, 'items');
        console.log('  Active Threads:', ctx.activeThreads?.length || 0);
        console.log('  People:', ctx.relevantPeople?.length || 0);
        console.log('  Emotion:', ctx.emotionalContext?.[0]?.emotion || 'none');

        // Thread Changes
        if (report.threadDebug.length > 0) {
            console.log('\n[Thread Engine]');
            for (const t of report.threadDebug) {
                if (t.from) {
                    console.log(`  ${t.threadKey}: ${t.from} → ${t.to} (${t.reason.join(', ')})`);
                } else {
                    console.log(`  ${t.threadKey}: ${t.status} (no change)`);
                }
            }
        }

        // Emotion
        const emo = report.emotionDebug;
        console.log('\n[Emotion Engine]');
        console.log('  Detected:', emo.detected, `(${emo.intensity})`);
        console.log('  Trend:', emo.trend?.direction || 'unknown');
        if (emo.warning) {
            console.log('  ⚠️ Warning:', emo.warning);
        }

        // Episodic
        if (report.episodicDebug.triggered) {
            console.log('\n[Episodic Compression]');
            console.log('  Compressed:', report.episodicDebug.count, 'episodes');
        }

        console.log('='.repeat(60));
    },

    /**
     * 获取最近的调试日志
     */
    getRecentLogs(count = 10) {
        return this.logs.slice(-count);
    },

    /**
     * 清空调试日志
     */
    clearLogs() {
        this.logs = [];
    }
};

// 导出供全局使用
window.MemoryDebug = MemoryDebug;
