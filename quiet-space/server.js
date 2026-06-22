const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 8080;
const ROOT_DIR = __dirname;
const CONFIG_FILE = path.join(__dirname, 'db-config.json');

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 静态文件
app.use(express.static(ROOT_DIR));

// 数据库连接池
let dbPool = null;

/**
 * 加载数据库配置
 */
function loadDbConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('加载数据库配置失败:', error.message);
    }
    return null;
}

/**
 * 保存数据库配置
 */
function saveDbConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('保存数据库配置失败:', error.message);
        return false;
    }
}

/**
 * 连接数据库
 */
async function connectDatabase(config) {
    try {
        // 先尝试连接（不指定数据库）
        const tempPool = await mysql.createPool({
            host: config.host,
            port: config.port || 3306,
            user: config.user,
            password: config.password,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // 创建数据库（如果不存在）
        await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await tempPool.end();

        // 连接到指定数据库
        dbPool = await mysql.createPool({
            host: config.host,
            port: config.port || 3306,
            user: config.user,
            password: config.password,
            database: config.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('数据库连接成功:', config.host + ':' + config.port + '/' + config.database);
        return { success: true, message: '连接成功' };
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        return { success: false, message: error.message };
    }
}

/**
 * 自动建表
 */
async function createTables() {
    if (!dbPool) {
        return { success: false, message: '数据库未连接' };
    }

    const tables = [
        // 日记表
        `CREATE TABLE IF NOT EXISTS diaries (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            emotions JSON,
            date DATETIME,
            source ENUM('chat', 'manual', 'fragment') DEFAULT 'manual',
            messages JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // 对话表
        `CREATE TABLE IF NOT EXISTS chats (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255),
            messages JSON,
            date DATETIME,
            emotion_summary JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // 碎碎念表
        `CREATE TABLE IF NOT EXISTS fragments (
            id VARCHAR(36) PRIMARY KEY,
            text TEXT,
            date DATETIME,
            emotion VARCHAR(50),
            organized BOOLEAN DEFAULT FALSE,
            diary_id VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE SET NULL
        )`,

        // AI记忆表
        `CREATE TABLE IF NOT EXISTS memories (
            id VARCHAR(36) PRIMARY KEY,
            type ENUM('event', 'person', 'preference', 'thread') NOT NULL,
            content TEXT NOT NULL,
            importance INT DEFAULT 5,
            confidence DECIMAL(3,2) DEFAULT 0.50,
            is_confirmed BOOLEAN DEFAULT FALSE,
            source_id VARCHAR(36),
            tags JSON,
            last_referenced_at DATETIME,
            reference_count INT DEFAULT 0,
            decay_score DECIMAL(3,2) DEFAULT 1.00,
            status ENUM('active', 'archived') DEFAULT 'active',
            temporal JSON,
            thread_key VARCHAR(100),
            instance VARCHAR(100),
            parent_thread_id VARCHAR(36),
            memory_category ENUM('identity', 'relationship', 'project', 'event', 'emotion') DEFAULT 'event',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // 情绪时间线表
        `CREATE TABLE IF NOT EXISTS emotion_timeline (
            id VARCHAR(36) PRIMARY KEY,
            timestamp DATETIME,
            source_id VARCHAR(36),
            source_type ENUM('chat', 'diary', 'fragment'),
            emotions JSON,
            dominant_emotion VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 设置表
        `CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // 索引（忽略已存在的错误）
        `CREATE INDEX idx_diaries_date ON diaries(date)`,
        `CREATE INDEX idx_chats_date ON chats(date)`,
        `CREATE INDEX idx_fragments_date ON fragments(date)`,
        `CREATE INDEX idx_memories_thread_key ON memories(thread_key)`,
        `CREATE INDEX idx_memories_status ON memories(status)`,
        `CREATE INDEX idx_emotion_timeline_timestamp ON emotion_timeline(timestamp)`
    ];

    try {
        for (const sql of tables) {
            try {
                await dbPool.execute(sql);
            } catch (err) {
                // 忽略"索引已存在"的错误
                if (!err.message.includes('Duplicate key name') && !err.message.includes('already exists')) {
                    console.error('执行 SQL 失败:', sql.substring(0, 50), err.message);
                }
            }
        }
        console.log('数据表创建/验证完成');
        return { success: true, message: '数据表创建成功' };
    } catch (error) {
        console.error('创建数据表失败:', error.message);
        return { success: false, message: error.message };
    }
}

// ==================== API 路由 ====================

/**
 * 测试数据库连接
 */
app.post('/api/db/test', async (req, res) => {
    const config = req.body;
    const result = await connectDatabase(config);
    res.json(result);
});

/**
 * 保存数据库配置并连接
 */
app.post('/api/db/connect', async (req, res) => {
    const config = req.body;

    // 测试连接
    const connectResult = await connectDatabase(config);
    if (!connectResult.success) {
        return res.json(connectResult);
    }

    // 自动建表
    const tableResult = await createTables();
    if (!tableResult.success) {
        return res.json({ success: false, message: '连接成功但建表失败: ' + tableResult.message });
    }

    // 保存配置
    saveDbConfig(config);

    res.json({ success: true, message: '数据库连接成功，表结构已初始化' });
});

/**
 * 获取数据库状态
 */
app.get('/api/db/status', async (req, res) => {
    const config = loadDbConfig();
    if (!config) {
        return res.json({ connected: false, configured: false });
    }

    if (!dbPool) {
        const result = await connectDatabase(config);
        if (!result.success) {
            return res.json({ connected: false, configured: true, error: result.message });
        }
    }

    try {
        const [rows] = await dbPool.execute('SELECT 1 as test');
        res.json({ connected: true, configured: true, database: config.database });
    } catch (error) {
        res.json({ connected: false, configured: true, error: error.message });
    }
});

// ==================== 通用 CRUD API ====================

/**
 * 获取所有记录
 */
app.get('/api/:table', async (req, res) => {
    if (!dbPool) {
        return res.status(500).json({ error: '数据库未连接' });
    }

    const table = req.params.table;
    const allowedTables = ['diaries', 'chats', 'fragments', 'memories', 'emotion_timeline', 'settings'];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: '无效的表名' });
    }

    try {
        const [rows] = await dbPool.execute(`SELECT * FROM \`${table}\``);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取单条记录
 */
app.get('/api/:table/:id', async (req, res) => {
    if (!dbPool) {
        return res.status(500).json({ error: '数据库未连接' });
    }

    const table = req.params.table;
    const id = req.params.id;
    const allowedTables = ['diaries', 'chats', 'fragments', 'memories', 'emotion_timeline'];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: '无效的表名' });
    }

    try {
        const [rows] = await dbPool.execute(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: '记录不存在' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 保存记录（新增或更新）
 */
app.post('/api/:table', async (req, res) => {
    if (!dbPool) {
        return res.status(500).json({ error: '数据库未连接' });
    }

    const table = req.params.table;
    const data = req.body;
    const allowedTables = ['diaries', 'chats', 'fragments', 'memories', 'emotion_timeline', 'settings'];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: '无效的表名' });
    }

    try {
        if (table === 'settings') {
            // 设置表特殊处理：键值对
            const key = data.key || data.setting_key;
            const value = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
            await dbPool.execute(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
            res.json({ success: true, key });
        } else {
            // 其他表：使用 INSERT ... ON DUPLICATE KEY UPDATE
            const fields = Object.keys(data);
            const values = fields.map(f => {
                const val = data[f];
                return typeof val === 'object' ? JSON.stringify(val) : val;
            });

            const placeholders = fields.map(() => '?').join(', ');
            const updateClause = fields.map(f => `\`${f}\` = VALUES(\`${f}\`)`).join(', ');

            await dbPool.execute(
                `INSERT INTO \`${table}\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`,
                values
            );
            res.json({ success: true, id: data.id });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 删除记录
 */
app.delete('/api/:table/:id', async (req, res) => {
    if (!dbPool) {
        return res.status(500).json({ error: '数据库未连接' });
    }

    const table = req.params.table;
    const id = req.params.id;
    const allowedTables = ['diaries', 'chats', 'fragments', 'memories', 'emotion_timeline'];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: '无效的表名' });
    }

    try {
        await dbPool.execute(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== AI 代理路由 ====================

app.post('/api/chat', async (req, res) => {
    const data = req.body;

    try {
        const apiUrl = new URL(data.endpoint);
        const postData = JSON.stringify({
            model: data.model,
            max_tokens: data.max_tokens || 300,
            messages: data.messages
        });

        const requestPath = '/v1/chat/completions';
        console.log('Making request to:', apiUrl.hostname + requestPath);

        const options = {
            hostname: apiUrl.hostname,
            port: apiUrl.port || 443,
            path: requestPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 120000,
            rejectUnauthorized: false
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let responseData = '';
            proxyRes.on('data', chunk => responseData += chunk);
            proxyRes.on('end', () => {
                console.log('API Response status:', proxyRes.statusCode);
                res.status(proxyRes.statusCode).json(JSON.parse(responseData));
            });
        });

        proxyReq.on('timeout', () => {
            console.log('Request timeout');
            proxyReq.destroy();
            if (!res.headersSent) {
                res.status(504).json({ error: 'Request timeout' });
            }
        });

        proxyReq.on('error', (error) => {
            console.error('Proxy error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            }
        });

        proxyReq.write(postData);
        proxyReq.end();
    } catch (error) {
        console.error('Parse error:', error);
        res.status(400).json({ error: error.message });
    }
});

// ==================== 启动服务器 ====================

async function startServer() {
    // 尝试加载已有配置并连接
    const config = loadDbConfig();
    if (config) {
        console.log('发现已有数据库配置，尝试连接...');
        const result = await connectDatabase(config);
        if (result.success) {
            await createTables();
        }
    }

    app.listen(PORT, () => {
        console.log(`Quiet Space server running at http://localhost:${PORT}`);
        console.log('数据库状态:', dbPool ? '已连接' : '未配置');
    });
}

startServer();
