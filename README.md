# 豆浆消息推送服务

一个支持多种推送方式的统一消息推送服务，目前支持 Telegram 和 Bark 推送。

## ✨ 特性

- 🚀 **统一API接口** - 一个接口支持多种推送方式
- 📱 **Telegram推送** - 支持单个和批量消息推送
- 🔔 **Bark推送** - 支持iOS Bark应用推送通知
- 🐳 **Docker支持** - 提供完整的Docker化部署方案
- 📊 **服务监控** - 内置健康检查和状态查询
- 🛡️ **错误处理** - 完善的错误处理和日志记录

## 📦 安装部署

### 环境要求

- Node.js 18+
- npm 或 yarn
- Docker (可选)

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd doujiang-message-push
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp config.env.template .env
   ```
   
   编辑 `.env` 文件，填入相应的配置：
   ```env
   # Telegram Bot Token - 从 @BotFather 获取
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   
   # 默认聊天ID
   CHAT_ID=your_chat_id_here
   
   # Bark 服务器地址
   BARK_SERVER_URL=https://api.day.app
   
   # Bark 设备密钥 - 从 Bark 应用获取
   BARK_DEVICE_KEY=your_bark_device_key_here
   ```

4. **启动服务**
   ```bash
   npm start
   ```

服务将在 `http://localhost:3019` 启动。

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d

# 或构建镜像
docker build -t doujiang-message-push .
docker run -p 3019:3019 --env-file .env doujiang-message-push
```

## 🚀 API 使用

### 推送消息

**端点**: `POST /push`

#### Telegram 推送

```bash
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "telegram",
    "message": "Hello Telegram!",
    "chatId": "your_chat_id"
  }'
```

**批量推送**:
```bash
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "telegram",
    "message": "群发消息",
    "chatIds": ["chat_id1", "chat_id2", "chat_id3"]
  }'
```

#### Bark 推送

```bash
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bark",
    "title": "重要通知",
    "body": "这是一条Bark推送消息"
  }'
```

**批量推送**:
```bash
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bark",
    "title": "群发通知",
    "body": "这是群发消息",
    "deviceKeys": ["device_key1", "device_key2"]
  }'
```

### 服务状态

**端点**: `GET /push/status`

```bash
curl http://localhost:3019/push/status
```

### 健康检查

**端点**: `GET /health`

```bash
curl http://localhost:3019/health
```

## 📋 API 参数说明

### 推送接口参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 推送类型: `telegram` 或 `bark` |

#### Telegram 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `message` | string | ✅ | 消息内容 |
| `chatId` | string/number | ✅* | 单个聊天ID |
| `chatIds` | array | ✅* | 多个聊天ID数组 |

*注: `chatId` 和 `chatIds` 至少提供一个

#### Bark 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | string | ✅* | 通知标题 |
| `body` | string | ✅* | 通知内容 |
| `deviceKeys` | array | ❌ | 多个设备密钥数组（批量推送时使用） |
| `options` | object | ❌ | 附加选项（sound, icon, group, url等） |

*注: `title` 和 `body` 至少提供一个

### 响应格式

**成功响应**:
```json
{
  "status": "success",
  "message": "消息推送成功",
  "data": {
    "type": "telegram",
    "pushParams": {...},
    "messageId": 42
  }
}
```

**错误响应**:
```json
{
  "status": "error",
  "message": "错误描述",
  "code": "ERROR_CODE",
  "data": {...}
}
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | ❌ | 3019 | 服务端口 |
| `NODE_ENV` | ❌ | development | 运行环境 |
| `TELEGRAM_BOT_TOKEN` | ✅ | - | Telegram Bot Token |
| `CHAT_ID` | ❌ | - | 默认聊天ID |
| `BARK_SERVER_URL` | ✅ | - | Bark服务器地址 |
| `BARK_DEVICE_KEY` | ✅ | - | Bark设备密钥 |

### 获取配置信息

#### Telegram Bot Token
1. 在Telegram中找到 @BotFather
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称
4. 获取返回的Token

#### Telegram Chat ID
1. 将机器人添加到群组或私聊
2. 发送消息给机器人
3. 访问 `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. 在返回结果中找到 `chat.id`

#### Bark设备密钥
1. 在iPhone上安装Bark应用
2. 打开应用获取设备密钥
3. 可选择使用官方服务器或自建服务器

## 📁 项目结构

```
doujiang-message-push/
├── src/
│   ├── bark/                 # Bark推送模块
│   │   ├── barkService.js    # Bark核心服务
│   │   └── index.js          # Bark工厂函数
│   ├── routes/               # 路由处理
│   │   ├── basicRoutes.js    # 基础路由
│   │   └── pushRoutes.js     # 推送路由
│   ├── services/             # 服务管理
│   │   ├── barkService.js    # Bark服务管理器
│   │   ├── pushServiceManager.js # 统一推送管理器
│   │   └── telegramService.js # Telegram服务管理器
│   └── telegram/             # Telegram推送模块
│       ├── index.js          # Telegram工厂函数
│       └── telegramService.js # Telegram核心服务
├── config.env.template       # 环境变量模板
├── docker-compose.yml        # Docker Compose配置
├── Dockerfile               # Docker镜像配置
├── package.json             # 项目依赖
└── server.js               # 应用入口
```

## 🔧 开发

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 查看日志
tail -f logs/app.log
```

### 测试

```bash
# 测试Telegram推送
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{"type": "telegram", "message": "测试消息", "chatId": "your_chat_id"}'

# 测试Bark推送  
curl -X POST http://localhost:3019/push \
  -H "Content-Type: application/json" \
  -d '{"type": "bark", "title": "测试", "body": "测试消息"}'

# 检查服务状态
curl http://localhost:3019/push/status
```

## 📊 监控

### 日志

应用日志输出到控制台，包含以下信息：
- 服务启动信息
- 推送请求详情
- 推送结果状态
- 错误信息

### 健康检查

- **端点**: `GET /health`
- **Docker健康检查**: 内置健康检查机制
- **服务状态**: `GET /push/status` 查看各推送服务状态

## 🤝 贡献

欢迎提交Issue和Pull Request来完善项目。

## 📄 许可证

ISC License

## 🔗 相关链接

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Bark官方文档](https://github.com/Finb/Bark)
- [Docker官方文档](https://docs.docker.com/)

---

如有问题，请查看日志输出或提交Issue。