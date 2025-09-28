const express = require('express');
const pushServiceManager = require('../services/pushServiceManager');
const router = express.Router();

/**
 * 统一消息推送路由
 * 支持 Telegram 和 Bark 推送
 */
router.post('/push', async (req, res) => {
  try {
    const { type, message, title, body, chatId, chatIds, deviceKeys, options } = req.body;
    
    // 推送类型验证
    if (!type || !['telegram', 'bark'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: '必须指定推送类型: telegram 或 bark',
        code: 'MISSING_OR_INVALID_TYPE'
      });
    }

    // 根据推送类型进行参数验证
    if (type === 'telegram') {
      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: '消息内容不能为空',
          code: 'MISSING_MESSAGE'
        });
      }

      if (!chatId && !chatIds) {
        return res.status(400).json({
          status: 'error',
          message: '必须提供chatId或chatIds',
          code: 'MISSING_TARGET'
        });
      }
    } else if (type === 'bark') {
      if (!title && !body) {
        return res.status(400).json({
          status: 'error',
          message: 'Bark推送必须提供标题或内容',
          code: 'MISSING_TITLE_OR_BODY'
        });
      }
    }

    // 检查指定类型的服务是否可用
    if (!pushServiceManager.isServiceAvailable(type)) {
      return res.status(503).json({
        status: 'error',
        message: `${type}服务未配置或不可用`,
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    console.log('📥 收到推送请求:', { 
      type,
      message: message ? message.substring(0, 50) + (message.length > 50 ? '...' : '') : undefined,
      title: title ? title.substring(0, 30) + (title.length > 30 ? '...' : '') : undefined,
      chatId,
      chatIds: chatIds ? `${chatIds.length}个目标` : undefined,
      deviceKeys: deviceKeys ? `${deviceKeys.length}个设备` : undefined
    });

    // 构建推送参数
    let pushParams = {};
    if (type === 'telegram') {
      pushParams = { message, chatId, chatIds };
    } else if (type === 'bark') {
      pushParams = { 
        title: title || '通知', 
        body: body || message || '新消息', 
        deviceKeys, 
        options: options || {} 
      };
    }

    // 使用统一推送服务管理器发送消息
    const result = await pushServiceManager.sendMessage(type, pushParams);

    // 处理推送结果
    if (Array.isArray(result)) {
      // 批量推送结果
      const successCount = result.filter(r => r.success).length;
      const failureCount = result.filter(r => !r.success).length;
      
      res.json({
        status: successCount > 0 ? 'success' : 'error',
        message: `${type}消息推送完成，成功: ${successCount}，失败: ${failureCount}`,
        data: {
          type,
          pushParams,
          results: result,
          summary: {
            total: result.length,
            success: successCount,
            failure: failureCount
          }
        }
      });
    } else {
      // 单个推送结果
      if (result.success) {
        res.json({
          status: 'success',
          message: `${type}消息推送成功`,
          data: {
            type,
            pushParams,
            messageId: result.messageId
          }
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: result.error,
          code: result.code || 'PUSH_FAILED',
          data: {
            type,
            pushParams,
            details: result.details
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ 推送请求处理失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
  }
});

/**
 * 获取推送服务状态
 */
router.get('/push/status', (req, res) => {
  try {
    const status = pushServiceManager.getServicesStatus();
    
    res.json({
      status: 'success',
      message: '推送服务状态查询成功',
      data: status
    });
  } catch (error) {
    console.error('❌ 服务状态查询失败:', error);
    res.status(500).json({
      status: 'error',
      message: '服务状态查询失败',
      code: 'STATUS_ERROR',
      details: error.message
    });
  }
});

module.exports = router;
