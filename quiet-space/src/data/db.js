/**
 * IndexedDB 数据库配置和基础操作
 * 替代 localStorage，提供更大的容量和事务支持
 */

const DB = {
    NAME: 'QuietSpaceDB',
    VERSION: 2,  // 升级版本，新增数据存储仓库

    /**
     * 初始化数据库
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.NAME, this.VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 视频存储仓库（已存在）
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

                // 记忆仓库 - 核心：AI长期记忆
                if (!db.objectStoreNames.contains('memories')) {
                    const memoriesStore = db.createObjectStore('memories', { keyPath: 'id' });
                    memoriesStore.createIndex('type', 'type', { unique: false });  // event/person/preference/thread
                    memoriesStore.createIndex('importance', 'importance', { unique: false });
                    memoriesStore.createIndex('isConfirmed', 'isConfirmed', { unique: false });
                    memoriesStore.createIndex('lastReferencedAt', 'lastReferencedAt', { unique: false });
                    memoriesStore.createIndex('referenceCount', 'referenceCount', { unique: false });
                    memoriesStore.createIndex('decayScore', 'decayScore', { unique: false });
                    memoriesStore.createIndex('status', 'status', { unique: false });  // active/archived
                    memoriesStore.createIndex('startDate', 'startDate', { unique: false });
                    memoriesStore.createIndex('threadKey', 'threadKey', { unique: false });
                    memoriesStore.createIndex('instance', 'instance', { unique: false });
                }

                // 情绪时间线 - 记录每次对话/日记的情绪变化
                if (!db.objectStoreNames.contains('emotionTimeline')) {
                    const emotionStore = db.createObjectStore('emotionTimeline', { keyPath: 'id' });
                    emotionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    emotionStore.createIndex('sourceId', 'sourceId', { unique: false });
                }

                // 设置仓库（键值对存储）
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
        });
    },

    /**
     * 获取数据库实例
     */
    async getDB() {
        if (!this._db) {
            this._db = await this.init();
        }
        return this._db;
    },

    /**
     * 通用：获取所有数据
     */
    async getAll(storeName) {
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
     * 通用：获取单条数据
     */
    async get(storeName, id) {
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
     * 通用：保存（新增或更新）
     */
    async put(storeName, data) {
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
     * 通用：删除
     */
    async delete(storeName, id) {
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
     * 通用：清空仓库
     */
    async clear(storeName) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 设置仓库专用：获取键值
     */
    async getSetting(key) {
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
     * 设置仓库专用：保存键值
     */
    async putSetting(key, value) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// 导出供全局使用
window.DB = DB;
