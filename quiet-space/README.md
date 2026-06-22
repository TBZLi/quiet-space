# Quiet Space v3.0.0

有温度的AI日记Web应用

## 新功能：MySQL 数据库支持

v3.0.0 新增了 MySQL 数据库支持，数据不再绑定浏览器，可以跨浏览器/设备使用。

### 快速开始

#### 1. 安装 MySQL

如果还没有安装 MySQL，请先安装：
- Windows: https://dev.mysql.com/downloads/installer/
- macOS: `brew install mysql`
- Linux: `sudo apt install mysql-server`

#### 2. 安装依赖

```bash
cd quiet-space
npm install
```

#### 3. 启动服务

```bash
npm start
```

#### 4. 配置数据库

1. 打开 http://localhost:8080
2. 点击右上角齿轮进入设置
3. 在"数据库配置"部分填写：
   - Host: `localhost`
   - Port: `3306`
   - User: `root`（你的 MySQL 用户名）
   - Password: 你的 MySQL 密码
   - Database: `quiet_space`（会自动创建）
4. 点击"连接并初始化"

#### 5. 迁移旧数据（可选）

如果你之前在浏览器中有数据，可以点击"开始迁移"将 IndexedDB 数据迁移到 MySQL。

### 系统架构

```
浏览器(前端) → 本地后端服务(Node.js + Express) → 用户本地数据库(MySQL)
```

### 数据库表结构

- `diaries` - 日记表
- `chats` - 对话表
- `fragments` - 碎碎念表
- `memories` - AI记忆表
- `emotion_timeline` - 情绪时间线表
- `settings` - 设置表

### API 接口

- `POST /api/db/test` - 测试数据库连接
- `POST /api/db/connect` - 连接并初始化数据库
- `GET /api/db/status` - 获取数据库状态
- `POST /api/db/migrate` - 数据迁移

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 注意事项

1. **视频背景**：由于视频文件较大，不存储在数据库中。换浏览器后需要重新上传视频。
2. **自动建表**：首次连接数据库时会自动创建所有表和索引。
3. **数据安全**：数据库配置加密存储在本地 `db-config.json` 文件中。
4. **降级方案**：如果没有配置 MySQL，系统会自动降级使用 IndexedDB。

### 版本历史

- v3.0.0 - 新增 MySQL 数据库支持，支持跨浏览器/设备使用
- v2.7.0 - Memory Engine V2 架构
- v2.0.0 - 从 Tauri 桌面应用改为纯 Web 应用
