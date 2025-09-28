const axios = require('axios');

/**
 * Telegram消息推送服务
 */
class TelegramService {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseURL = `https://api.telegram.org/bot${botToken}`;
    
    if (!botToken) {
      throw new Error('Telegram Bot Token 未配置');
    }
  }

  /**
   * 发送文本消息
   * @param {string|number} chatId - 目标聊天ID
   * @param {string} message - 消息内容
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} API响应结果
   */
  async sendMessage(chatId, message, options = {}) {
    try {
      const params = {
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: options.disableWebPagePreview || false,
        disable_notification: options.disableNotification || false,
        ...options
      };

      console.log(`📤 发送Telegram消息到 ${chatId}:`, message);

      const response = await axios.post(`${this.baseURL}/sendMessage`, params, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.ok) {
        console.log('✅ Telegram消息发送成功:', response.data.result.message_id);
        return {
          success: true,
          messageId: response.data.result.message_id,
          data: response.data.result
        };
      } else {
        throw new Error(response.data.description || 'Telegram API响应失败');
      }

    } catch (error) {
      console.error('❌ Telegram消息发送失败:', error.message);
      
      let errorMessage = '消息发送失败';
      if (error.response) {
        // API错误响应
        const apiError = error.response.data;
        errorMessage = apiError.description || `HTTP ${error.response.status}`;
      } else if (error.code === 'ECONNABORTED') {
        // 超时错误
        errorMessage = '请求超时，请稍后重试';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络状态';
      }

      return {
        success: false,
        error: errorMessage,
        details: error.message
      };
    }
  }

  /**
   * 发送消息到多个聊天
   * @param {Array<string|number>} chatIds - 目标聊天ID数组
   * @param {string} message - 消息内容
   * @param {Object} options - 可选配置
   * @returns {Promise<Array>} 发送结果数组
   */
  async sendMessageToMultiple(chatIds, message, options = {}) {
    const results = [];
    
    for (const chatId of chatIds) {
      const result = await this.sendMessage(chatId, message, options);
      results.push({
        chatId,
        ...result
      });
      
      // 避免过于频繁的API调用
      if (chatIds.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * 验证Bot Token是否有效
   * @returns {Promise<Object>} 验证结果
   */
  async validateToken() {
    try {
      const response = await axios.get(`${this.baseURL}/getMe`, {
        timeout: 5000
      });

      if (response.data.ok) {
        const botInfo = response.data.result;
        console.log('✅ Telegram Bot Token验证成功:', botInfo.username);
        return {
          valid: true,
          botInfo
        };
      } else {
        return {
          valid: false,
          error: response.data.description
        };
      }
    } catch (error) {
      console.error('❌ Telegram Bot Token验证失败:', error.message);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = TelegramService;
