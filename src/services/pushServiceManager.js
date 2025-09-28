const telegramServiceManager = require('./telegramService');
const barkServiceManager = require('./barkService');

/**
 * 统一推送服务管理器
 * 管理所有推送服务的初始化和调用
 */
class PushServiceManager {
  constructor() {
    this.services = {
      telegram: telegramServiceManager,
      bark: barkServiceManager
    };
  }

  /**
   * 初始化所有推送服务
   */
  initialize() {
    console.log('📡 正在初始化推送服务...');
    
    // 初始化Telegram服务
    this.services.telegram.initialize();
    
    // 初始化Bark服务
    this.services.bark.initialize();
    
    console.log('📡 推送服务初始化完成');
  }

  /**
   * 获取指定类型的推送服务
   * @param {string} type - 服务类型 ('telegram' | 'bark')
   * @returns {Object|null} 服务实例
   */
  getService(type) {
    const serviceManager = this.services[type];
    return serviceManager ? serviceManager.getService() : null;
  }

  /**
   * 检查指定类型的服务是否可用
   * @param {string} type - 服务类型 ('telegram' | 'bark')
   * @returns {boolean} 服务是否可用
   */
  isServiceAvailable(type) {
    const serviceManager = this.services[type];
    return serviceManager ? serviceManager.isServiceAvailable() : false;
  }

  /**
   * 获取所有服务的状态
   * @returns {Object} 服务状态信息
   */
  getServicesStatus() {
    return {
      telegram: {
        available: this.isServiceAvailable('telegram'),
        config: this.services.telegram.getConfig ? this.services.telegram.getConfig() : null
      },
      bark: {
        available: this.isServiceAvailable('bark'),
        config: this.services.bark.getConfig ? this.services.bark.getConfig() : null
      }
    };
  }

  /**
   * 统一推送消息接口
   * @param {string} type - 推送类型 ('telegram' | 'bark')
   * @param {Object} params - 推送参数
   * @returns {Promise<Object>} 推送结果
   */
  async sendMessage(type, params) {
    if (!this.isServiceAvailable(type)) {
      return {
        success: false,
        error: `${type}服务未配置或不可用`,
        code: 'SERVICE_UNAVAILABLE'
      };
    }

    const service = this.getService(type);
    
    try {
      switch (type) {
        case 'telegram':
          return await this.sendTelegramMessage(service, params);
        case 'bark':
          return await this.sendBarkMessage(service, params);
        default:
          return {
            success: false,
            error: `不支持的推送类型: ${type}`,
            code: 'UNSUPPORTED_TYPE'
          };
      }
    } catch (error) {
      console.error(`❌ ${type}推送失败:`, error);
      return {
        success: false,
        error: error.message,
        code: 'PUSH_ERROR'
      };
    }
  }

  /**
   * 发送Telegram消息
   * @param {Object} service - Telegram服务实例
   * @param {Object} params - 参数
   * @returns {Promise<Object>} 推送结果
   */
  async sendTelegramMessage(service, params) {
    const { message, chatId, chatIds } = params;
    
    if (chatIds && Array.isArray(chatIds)) {
      return await service.sendMessageToMultiple(chatIds, message);
    } else {
      return await service.sendMessage(chatId, message);
    }
  }

  /**
   * 发送Bark消息
   * @param {Object} service - Bark服务实例
   * @param {Object} params - 参数
   * @returns {Promise<Object>} 推送结果
   */
  async sendBarkMessage(service, params) {
    const { title, body, deviceKeys, options = {} } = params;
    
    if (deviceKeys && Array.isArray(deviceKeys)) {
      return await service.sendNotificationToMultiple(deviceKeys, title, body, options);
    } else {
      return await service.sendNotification(title, body, options);
    }
  }

  /**
   * 批量推送到多种服务
   * @param {Array} pushRequests - 推送请求数组
   * @returns {Promise<Array>} 推送结果数组
   */
  async sendMultipleMessages(pushRequests) {
    const results = [];
    
    for (const request of pushRequests) {
      const { type, params } = request;
      const result = await this.sendMessage(type, params);
      results.push({
        type,
        ...result
      });
    }
    
    return results;
  }
}

// 创建单例实例
const pushServiceManager = new PushServiceManager();

module.exports = pushServiceManager;
