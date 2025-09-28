const { createTelegramService } = require('../telegram');

/**
 * Telegram服务管理器
 * 提供单例模式的Telegram服务实例管理
 */
class TelegramServiceManager {
  constructor() {
    this.telegramService = null;
    this.isInitialized = false;
  }

  /**
   * 初始化Telegram服务
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        this.telegramService = createTelegramService(process.env.TELEGRAM_BOT_TOKEN);
        this.isInitialized = true;
        console.log('📱 Telegram服务已初始化');
      } catch (error) {
        console.error('❌ Telegram服务初始化失败:', error.message);
      }
    } else {
      console.warn('⚠️  未配置TELEGRAM_BOT_TOKEN，Telegram推送功能不可用');
    }
  }

  /**
   * 获取Telegram服务实例
   * @returns {Object|null} Telegram服务实例
   */
  getService() {
    return this.telegramService;
  }

  /**
   * 检查服务是否可用
   * @returns {boolean} 服务是否可用
   */
  isServiceAvailable() {
    return this.telegramService !== null;
  }
}

// 创建单例实例
const telegramServiceManager = new TelegramServiceManager();

module.exports = telegramServiceManager;
