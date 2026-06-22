/**
 * 数据库层 - 支持 MySQL（通过 API）和 IndexedDB（降级方案）
 * 自动检测后端连接状态，选择合适的存储方式
 */

const DB = {
    NAME: 'QuietSpaceDB',
    VERSION: 2,
    _db: null,
    _useMySQL: false,
    _initialized: false,

    /**
     * 初始化数据库
     */
    async init() {
        if (this._initialized) return;

        // 先检查 MySQL 连接状态
        try {
            const response = await fetch('/api/db/status');
            const status = await response.json();
            if (status.connected) {
                console.log('使用 MySQL 数据库');
                this._useMySQL = true;
                this._initialized = true;
                return;
            }
        } catch (error) {
            console.log('MySQL 不可用，降级到 IndexedDB');
        }

        // 降级到 IndexedDB
        console.log('使用 IndexedDB 数据库');
        this._useMySQL = false;
        await this._initIndexedDB();
        this._initialized = true;
    },

    /**
     * 初始化 IndexedDB
     */
    async _initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.NAME, this.VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this._db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 视频存储仓库
                if (!db.objectStoreNames.contains('videoBackground')) {
                    db.createObjectStore('videoBackground');
                }

                // 日记仓库
                if (!db.objectStoreNames.contains('diaries')) {
                    const diariesStore = db.createObjectStore('diaries', { keyPath: 'id' });
                    diariesStore.createIndex('date', 'date', { unique: false });
                    diariesStore.createIndex('emotion', 'emotion', { unique: false });
                }

                // 对话仓库
                if (!db.objectStoreNames.contains('chats')) {
                    const chatsStore = db.createObjectStore('chats', { keyPath: 'id' });
                    chatsStore.createIndex('date', 'date', { unique: false });
                }

                // 碎碎念仓库
                if (!db.objectStoreNames.contains('fragments')) {
                    const fragmentsStore = db.createObjectStore('fragments', { keyPath: 'id' });
                    fragmentsStore.createIndex('date', 'date', { unique: false });
                }

                // 记忆仓库
                if (!db.objectStoreNames.contains('memories')) {
                    const memoriesStore = db.createObjectStore('memories', { keyPath: 'id' });
                    memoriesStore.createIndex('type', 'type', { unique: false });
                    memoriesStore.createIndex('importance', 'importance', { unique: false });
                    memoriesStore.createIndex('isConfirmed', 'isConfirmed', { unique: false });
                    memoriesStore.createIndex('lastReferencedAt', 'lastReferencedAt', { unique: false });
                    memoriesStore.createIndex('referenceCount', 'referenceCount', { unique: false });
                    memoriesStore.createIndex('decayScore', 'decayScore', { unique: false });
                    memoriesStore.createIndex('status', 'status', { unique: false });
                    memoriesStore.createIndex('startDate', 'startDate', { unique: false });
                    memoriesStore.createIndex('threadKey', 'threadKey', { unique: false });
                    memoriesStore.createIndex('instance', 'instance', { unique: false });
                    memoriesStore.createIndex('memoryCategory', 'memoryCategory', { unique: false });
                    memoriesStore.createIndex('tags', 'tags', { multiEntry: true });
                }

                // 情绪时间线
                if (!db.objectStoreNames.contains('emotionTimeline')) {
                    const emotionStore = db.createObjectStore('emotionTimeline', { keyPath: 'id' });
                    emotionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    emotionStore.createIndex('sourceId', 'sourceId', { unique: false });
                }

                // 设置仓库
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
        });
    },

    /**
     * 获取数据库实例（IndexedDB）
     */
    async getDB() {
        if (!this._db) {
            await this._initIndexedDB();
        }
        return this._db;
    },

    // ==================== 通用 CRUD ====================

    /**
     * 获取所有数据
     */
    async getAll(storeName) {
        await this.init();

        if (this._useMySQL) {
            const response = await fetch(`/api/${storeName}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            // MySQL 返回的字段名是 snake_case，需要转换为 camelCase
            return data.map(item => this._snakeToCamel(item));
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取单条数据
     */
    async get(storeName, id) {
        await this.init();

        if (this._useMySQL) {
            const response = await fetch(`/api/${storeName}/${id}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            return this._snakeToCamel(data);
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 保存（新增或更新）
     */
    async put(storeName, data) {
        await this.init();

        if (this._useMySQL) {
            const response = await fetch(`/api/${storeName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this._camelToSnake(data))
            });
            if (!response.ok) throw new Error('Failed to save');
            return data;
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 删除
     */
    async delete(storeName, id) {
        await this.init();

        if (this._useMySQL) {
            const response = await fetch(`/api/${storeName}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete');
            return;
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 清空仓库
     */
    async clear(storeName) {
        await this.init();

        if (this._useMySQL) {
            // MySQL 不支持清空所有，需要逐条删除
            const items = await this.getAll(storeName);
            for (const item of items) {
                await this.delete(storeName, item.id);
            }
            return;
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // ==================== 设置专用 ====================

    /**
     * 获取键值设置
     */
    async getSetting(key) {
        await this.init();

        if (this._useMySQL) {
            const settings = await this.getAll('settings');
            const setting = settings.find(s => s.settingKey === key);
            if (!setting) return null;
            try {
                return JSON.parse(setting.settingValue);
            } catch {
                return setting.settingValue;
            }
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 保存键值设置
     */
    async putSetting(key, value) {
        await this.init();

        if (this._useMySQL) {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: key,
                    value: typeof value === 'string' ? value : JSON.stringify(value)
                })
            });
            if (!response.ok) throw new Error('Failed to save setting');
            return;
        }

        // IndexedDB
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // ==================== 工具方法 ====================

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * snake_case 转 camelCase
     */
    _snakeToCamel(obj) {
        if (obj === null || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this._snakeToCamel(item));
        }

        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
                let value = obj[camelKey] || obj[key];

                // 尝试解析 JSON 字段
                if (typeof value === 'string' && (key.includes('emotions') || key.includes('messages') || key.includes('tags') || key.includes('temporal') || key.includes('emotion_summary'))) {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        // 保持原值
                    }
                }

                result[camelKey] = this._snakeToCamel(value);
            }
        }
        return result;
    },

    /**
     * camelCase 转 snake_case
     */
    _camelToSnake(obj) {
        if (obj === null || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this._camelToSnake(item));
        }

        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                let value = obj[key];

                // 对象转 JSON 字符串
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }

                result[snakeKey] = value;
            }
        }
        return result;
    }
};

// 导出供全局使用
window.DB = DB;
