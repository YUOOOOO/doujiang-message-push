require('dotenv').config();
const express = require('express');
const pushServiceManager = require('./src/services/pushServiceManager');
const basicRoutes = require('./src/routes/basicRoutes');
const pushRoutes = require('./src/routes/pushRoutes');

const app = express();
const port = process.env.PORT || 3019;

// 初始化推送服务
pushServiceManager.initialize();

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use('/', basicRoutes);
app.use('/', pushRoutes);

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 豆浆消息推送服务已启动`);
  console.log(`📡 服务地址: http://localhost:${port}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
});
