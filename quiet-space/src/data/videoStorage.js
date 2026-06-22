/**
 * 视频存储层 - 管理多个自定义视频背景
 * 使用 IndexedDB 存储大文件（视频）
 */

window.VideoStorage = {
    DB_NAME: 'QuietSpaceDB',
    DB_VERSION: 2,
    STORE_NAME: 'videoBackground',
    VIDEOS_KEY: 'customVideos',    // 存储所有视频列表
    ACTIVE_KEY: 'activeVideoId',   // 当前选中的视频ID
    AUDIO_KEY: 'customAudio',      // 存储自定义音频
    VIDEO_VOLUME_KEY: 'videoVolume',  // 视频音量（0-1）
    AUDIO_VOLUME_KEY: 'audioVolume',  // 背景音频音量（0-1）
    TIMELINE_EFFECT_KEY: 'timelineEffect',  // 时间线效果

    /**
     * 初始化 IndexedDB
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
        });
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 添加视频
     * @param {File} file - 视频文件对象
     * @returns {Promise<Object>} { status: 'added'|'duplicate_name'|'duplicate_size', video?, existing? }
     */
    async addVideo(file) {
        const db = await this.initDB();
        const videos = await this.getAllVideos();

        // 检查文件名是否重复
        const sameName = videos.find(v => v.name === file.name);
        if (sameName) {
            return { status: 'duplicate_name', existing: sameName };
        }

        // 检查文件大小是否相同
        const sameSize = videos.find(v => v.size === file.size);
        if (sameSize) {
            return { status: 'duplicate_size', existing: sameSize };
        }

        // 没有重复，添加视频
        const id = this.generateId();
        const videoData = {
            id: id,
            blob: file,
            name: file.name,
            type: file.type,
            size: file.size,
            timestamp: Date.now()
        };

        videos.push(videoData);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.put(videos, this.VIDEOS_KEY);
            request.onsuccess = () => resolve({ status: 'added', video: videoData });
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取所有视频列表（不含blob数据）
     * @returns {Promise<Array>}
     */
    async getAllVideos() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.get(this.VIDEOS_KEY);
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取单个视频的blob数据
     * @param {string} id - 视频ID
     * @returns {Promise<Blob|null>}
     */
    async getVideoBlob(id) {
        const videos = await this.getAllVideos();
        const video = videos.find(v => v.id === id);
        return video ? video.blob : null;
    },

    /**
     * 删除视频
     * @param {string} id - 视频ID
     */
    async deleteVideo(id) {
        const db = await this.initDB();
        let videos = await this.getAllVideos();
        videos = videos.filter(v => v.id !== id);

        // 如果删除的是当前选中的视频，清除选中状态
        const activeId = await this.getActiveVideoId();
        if (activeId === id) {
            await this.setActiveVideoId(null);
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.put(videos, this.VIDEOS_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取当前选中的视频ID
     * @returns {Promise<string|null>}
     */
    async getActiveVideoId() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.get(this.ACTIVE_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 设置当前选中的视频ID
     * @param {string|null} id - 视频ID，null表示使用默认视频
     */
    async setActiveVideoId(id) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.put(id, this.ACTIVE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取当前激活的视频blob
     * @returns {Promise<Blob|null>} 视频blob，null表示使用默认视频
     */
    async getActiveVideo() {
        const activeId = await this.getActiveVideoId();
        if (!activeId) return null;
        return await this.getVideoBlob(activeId);
    },

    /**
     * 检查是否有自定义视频
     * @returns {Promise<boolean>}
     */
    async hasCustomVideos() {
        const videos = await this.getAllVideos();
        return videos.length > 0;
    },

    /**
     * 获取视频数量
     * @returns {Promise<number>}
     */
    async getVideoCount() {
        const videos = await this.getAllVideos();
        return videos.length;
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    // ===== 音频相关方法 =====

    /**
     * 保存音频文件
     * @param {File} file - 音频文件对象
     */
    async saveAudio(file) {
        const db = await this.initDB();
        const audioData = {
            blob: file,
            name: file.name,
            type: file.type,
            size: file.size,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(audioData, this.AUDIO_KEY);
            request.onsuccess = () => resolve(audioData);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取音频 blob
     * @returns {Promise<Blob|null>}
     */
    async getAudioBlob() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(this.AUDIO_KEY);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.blob : null);
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取音频信息
     * @returns {Promise<Object|null>}
     */
    async getAudioInfo() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(this.AUDIO_KEY);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve({
                        name: result.name,
                        type: result.type,
                        size: result.size,
                        timestamp: result.timestamp
                    });
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 删除音频
     */
    async deleteAudio() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(this.AUDIO_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 检查是否有自定义音频
     * @returns {Promise<boolean>}
     */
    async hasAudio() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.count(this.AUDIO_KEY);
            request.onsuccess = () => resolve(request.result > 0);
            request.onerror = () => reject(request.error);
        });
    },

    // ===== 音量设置 =====

    /**
     * 获取视频音量（0-1）
     * @returns {Promise<number>}
     */
    async getVideoVolume() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(this.VIDEO_VOLUME_KEY);
            request.onsuccess = () => resolve(request.result ?? 0.5);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 设置视频音量（0-1）
     * @param {number} volume - 音量值
     */
    async setVideoVolume(volume) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(volume, this.VIDEO_VOLUME_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取背景音频音量（0-1）
     * @returns {Promise<number>}
     */
    async getAudioVolume() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(this.AUDIO_VOLUME_KEY);
            request.onsuccess = () => resolve(request.result ?? 0.5);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 设置背景音频音量（0-1）
     * @param {number} volume - 音量值
     */
    async setAudioVolume(volume) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(volume, this.AUDIO_VOLUME_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // ===== 时间线效果设置 =====

    /**
     * 获取时间线效果
     * @returns {Promise<string>}
     */
    async getTimelineEffect() {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(this.TIMELINE_EFFECT_KEY);
            request.onsuccess = () => resolve(request.result ?? 'fade-scale');
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 设置时间线效果
     * @param {string} effect - 效果名称
     */
    async setTimelineEffect(effect) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(effect, this.TIMELINE_EFFECT_KEY);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
