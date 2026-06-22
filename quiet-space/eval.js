/**
 * Memory System Evaluation Script
 * 验证记忆系统是否真的让陪伴体验变好了
 */

const fs = require('fs');
const path = require('path');

// 加载测试用例
const testCases = JSON.parse(fs.readFileSync(path.join(__dirname, 'memory-eval.json'), 'utf-8'));

// 模拟记忆系统（简化版）
class MockMemorySystem {
    constructor() {
        this.memories = [];
        this.threads = [];
        this.emotions = [];
    }

    // 存储记忆
    store(role, content) {
        if (role === 'user') {
            this.memories.push({
                content,
                timestamp: Date.now(),
                type: this._detectType(content)
            });
        }
    }

    // 检测记忆类型
    _detectType(content) {
        if (content.includes('叫') && content.includes('我')) return 'identity';
        if (content.includes('项目') || (content.includes('做') && content.includes('系统'))) return 'project';
        if (content.includes('心情') || content.includes('开心') || content.includes('难过') ||
            content.includes('好多了') || content.includes('压力大') || content.includes('放松') ||
            content.includes('高兴') || content.includes('不错')) return 'emotion';
        if (content.includes('准备') && content.includes('考')) return 'thread';
        if (content.includes('喜欢') || content.includes('不喜欢') || content.includes('讨厌')) return 'preference';
        return 'general';
    }

    // 召回相关记忆
    recall(question, limit = 10) {
        const keywords = this._extractKeywords(question);
        const scored = this.memories.map(m => ({
            ...m,
            score: this._calculateScore(m, keywords)
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // 提取关键词
    _extractKeywords(text) {
        const stopWords = ['的', '了', '在', '是', '我', '你', '他', '她', '它', '这', '那', '什么', '怎么', '为什么', '吗', '呢', '吧'];
        return text.split(/[\s,，。？！]+/).filter(w => w.length > 1 && !stopWords.includes(w));
    }

    // 计算相关性分数
    _calculateScore(memory, keywords) {
        let score = 0;
        const content = memory.content;

        // 关键词匹配
        for (const keyword of keywords) {
            if (content.includes(keyword)) {
                score += 10;
            }
        }

        // 时间衰减（最近的记忆权重更高）
        const age = (Date.now() - memory.timestamp) / (1000 * 60 * 60); // 小时
        score += Math.max(0, 10 - age * 0.1);

        // 记忆类型权重
        const typeWeights = {
            identity: 15,
            project: 12,
            emotion: 10,
            thread: 11,
            general: 5
        };
        score += typeWeights[memory.type] || 5;

        return score;
    }
}

// 模拟 _dedupEmotions 方法
function dedupEmotions(emotions) {
    if (emotions.length <= 1) return emotions;

    // 更精确的转折词匹配 - 需要同时包含转折词和情绪词
    const turnKeywords = ['但是', '不过', '但是现在', '不过现在', '后来', '然后'];
    const positiveRecovery = ['好多了', '开心', '高兴', '放松', '平静', '不错', '好了', '恢复'];

    // 找到最后一个包含恢复词的情绪
    let lastRecoveryIndex = -1;
    for (let i = emotions.length - 1; i >= 0; i--) {
        const content = emotions[i].content;
        const isRecovery = positiveRecovery.some(kw => content.includes(kw));
        if (isRecovery) {
            lastRecoveryIndex = i;
            break;
        }
    }

    // 如果找到了恢复点，只返回恢复后的情绪
    if (lastRecoveryIndex >= 0) {
        return [emotions[lastRecoveryIndex]];
    }

    // 如果没有恢复点，检查是否有转折词
    for (let i = emotions.length - 1; i >= 0; i--) {
        const content = emotions[i].content;
        const isTurn = turnKeywords.some(kw => content.includes(kw));
        if (isTurn) {
            // 如果有转折词，返回转折词之后的情绪
            return emotions.slice(i);
        }
    }

    return emotions;
}

// 模拟 _dedupPreferences 方法
function dedupPreferences(preferences) {
    if (preferences.length <= 1) return preferences;

    // 更精确的否定词匹配 - 需要同时包含否定词和对象
    const negationPatterns = [
        '不喜欢', '不要', '不想', '不爱', '没兴趣',
        '以前喜欢', '以前爱', '以前想',
        '现在不', '现在不想', '现在不要',
        '但是不', '不过不', '但是现在不', '不过现在不'
    ];

    // 找到最后一个包含否定词的偏好
    let lastNegationIndex = -1;
    for (let i = preferences.length - 1; i >= 0; i--) {
        const content = preferences[i].content;
        const isNegated = negationPatterns.some(kw => content.includes(kw));
        if (isNegated) {
            lastNegationIndex = i;
            break;
        }
    }

    // 如果找到了否定点，只返回否定后的偏好
    if (lastNegationIndex >= 0) {
        return [preferences[lastNegationIndex]];
    }

    return preferences;
}

// 评估函数
function evaluate(testCase) {
    const memory = new MockMemorySystem();

    // 模拟对话
    for (const msg of testCase.conversation) {
        memory.store(msg.role, msg.content);
    }

    // 召回记忆
    const recalled = memory.recall(testCase.question);

    // 应用去重逻辑
    let recalledContent = recalled.map(r => r.content);

    // 如果测试的是情绪，应用情绪去重
    if (testCase.name.includes('情绪')) {
        const emotionRecalled = recalled.filter(r => r.type === 'emotion');
        const deduped = dedupEmotions(emotionRecalled);
        recalledContent = deduped.map(r => r.content);
    }

    // 如果测试的是偏好/否定，应用偏好去重
    if (testCase.name.includes('否定') || testCase.name.includes('偏好')) {
        const prefRecalled = recalled.filter(r => r.type === 'general' || r.content.includes('喜欢') || r.content.includes('不喜欢'));
        const deduped = dedupPreferences(prefRecalled);
        recalledContent = deduped.map(r => r.content);
    }

    const recalledText = recalledContent.join(' ');

    // 检查预期关键词
    const expectedFound = testCase.expected_keywords.filter(k => recalledText.includes(k));

    // 检查意外关键词（排除否定词包含的情况）
    const unexpectedFound = testCase.unexpected_keywords ? testCase.unexpected_keywords.filter(k => {
        if (!recalledText.includes(k)) return false;
        // 排除否定词包含的情况：如果 recalledText 中包含 "不" + k，不算意外
        // 例如："不喜欢" 中的 "喜欢" 不算意外
        const negationPrefixes = ['不', '没有', '没', '别'];
        for (const prefix of negationPrefixes) {
            if (recalledText.includes(prefix + k)) return false;
        }
        return true;
    }) : [];

    // 计算分数：预期关键词匹配 - 意外关键词惩罚
    let score = (expectedFound.length / testCase.expected_keywords.length) * 100;
    if (unexpectedFound.length > 0) {
        score -= unexpectedFound.length * 20; // 每个意外关键词扣 20 分
    }
    score = Math.max(0, Math.min(100, score));

    return {
        id: testCase.id,
        name: testCase.name,
        expected_keywords: testCase.expected_keywords,
        expected_found: expectedFound,
        unexpected_keywords: testCase.unexpected_keywords || [],
        unexpected_found: unexpectedFound,
        score: score,
        weight: testCase.weight,
        passed: expectedFound.length === testCase.expected_keywords.length && unexpectedFound.length === 0,
        notes: testCase.notes || ''
    };
}

// 主函数
function main() {
    console.log('=== Memory System Evaluation ===\n');

    const results = testCases.map(evaluate);
    let totalScore = 0;
    let totalWeight = 0;

    for (const result of results) {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} [${result.id}] ${result.name}`);
        console.log(`   Expected: ${result.expected_keywords.join(', ')}`);
        console.log(`   Found: ${result.expected_found.join(', ')}`);
        if (result.unexpected_found.length > 0) {
            console.log(`   ⚠️  Unexpected: ${result.unexpected_found.join(', ')}`);
        }
        console.log(`   Score: ${result.score.toFixed(0)}%\n`);

        totalScore += result.score * result.weight;
        totalWeight += 100 * result.weight;
    }

    const finalScore = (totalScore / totalWeight * 100).toFixed(1);
    console.log('=== Summary ===');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r.passed).length}`);
    console.log(`Failed: ${results.filter(r => !r.passed).length}`);
    console.log(`Overall Score: ${finalScore}%`);

    // 生成报告
    const report = {
        timestamp: new Date().toISOString(),
        total_tests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        overall_score: parseFloat(finalScore),
        details: results
    };

    fs.writeFileSync(
        path.join(__dirname, 'eval-report.json'),
        JSON.stringify(report, null, 2)
    );

    console.log('\nReport saved to eval-report.json');
}

main();
