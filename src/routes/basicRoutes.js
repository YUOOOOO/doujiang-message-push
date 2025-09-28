const express = require('express');
const router = express.Router();

/**
 * 根路由 - 服务信息
 */
router.get('/', (req, res) => {
  res.json({
    name: 'doujiang-message-push',
    version: '1.0.0',
    description: '豆浆消息推送服务',
    status: 'running'
  });
});

/**
 * 健康检查路由
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
