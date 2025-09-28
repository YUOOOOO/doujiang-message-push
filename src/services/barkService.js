const { createBarkService } = require('../bark');

/**
 * Bark服务管理器
 * 提供单例模式的Bark服务实例管理
 */
class BarkServiceManager {
  constructor() {
    this.barkService = null;
    this.isInitialized = false;
  }

  /**
   * 初始化Bark服务
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    const serverUrl = process.env.BARK_SERVER_URL;
    const deviceKey = process.env.BARK_DEVICE_KEY;

    if (serverUrl && deviceKey) {
      try {
        this.barkService = createBarkService(serverUrl, deviceKey);
        this.isInitialized = true;
        console.log('🔔 Bark服务已初始化');
      } catch (error) {
        console.error('❌ Bark服务初始化失败:', error.message);
      }
    } else {
      console.warn('⚠️  未配置BARK_SERVER_URL或BARK_DEVICE_KEY，Bark推送功能不可用');
    }
  }

  /**
   * 获取Bark服务实例
   * @returns {Object|null} Bark服务实例
   */
  getService() {
    return this.barkService;
  }

  /**
   * 检查服务是否可用
   * @returns {boolean} 服务是否可用
   */
  isServiceAvailable() {
    return this.barkService !== null;
  }

  /**
   * 获取服务配置信息
   * @returns {Object} 配置信息
   */
  getConfig() {
    if (!this.barkService) {
      return {
        available: false,
        serverUrl: null,
        deviceKey: null
      };
    }

    return {
      available: true,
      serverUrl: this.barkService.serverUrl,
      deviceKey: this.barkService.deviceKey ? '***配置' : null
    };
  }
}

// 创建单例实例
const barkServiceManager = new BarkServiceManager();

module.exports = barkServiceManager;
