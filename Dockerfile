# 多阶段构建 - 依赖安装阶段
FROM node:18-alpine AS dependencies

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（现在有package-lock.json可以使用npm ci）
RUN npm ci --only=production && npm cache clean --force

# 生产运行阶段
FROM node:18-alpine AS runtime

# 安装dumb-init用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# 设置工作目录
WORKDIR /app

# 从依赖阶段复制node_modules
COPY --from=dependencies --chown=nodeuser:nodejs /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=nodeuser:nodejs . .

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3019

# 暴露端口
EXPOSE 3019

# 切换到非root用户
USER nodeuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: process.env.PORT || 3019, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# 使用dumb-init启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
