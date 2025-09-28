const axios = require('axios');

/**
 * Bark推送服务
 */
class BarkService {
  constructor(serverUrl, deviceKey) {
    this.serverUrl = serverUrl;
    this.deviceKey = deviceKey;
    
    if (!serverUrl) {
      throw new Error('Bark Server URL 未配置');
    }
    
    if (!deviceKey) {
      throw new Error('Bark Device Key 未配置');
    }
    
    // 确保serverUrl以https://或http://开头
    if (!this.serverUrl.startsWith('http://') && !this.serverUrl.startsWith('https://')) {
      this.serverUrl = `https://${this.serverUrl}`;
    }
    
    // 移除末尾的斜杠
    this.serverUrl = this.serverUrl.replace(/\/$/, '');
  }

  /**
   * 发送Bark推送通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} 发送结果
   */
  async sendNotification(title, body, options = {}) {
    try {
      // URL编码标题和内容
      const encodedTitle = encodeURIComponent(title);
      const encodedBody = encodeURIComponent(body);
      
      // 构建请求URL
      let url = `${this.serverUrl}/${this.deviceKey}/${encodedTitle}/${encodedBody}`;
      
      // 添加可选参数
      const params = new URLSearchParams();
      if (options.sound) {
        params.append('sound', options.sound);
      }
      if (options.icon) {
        params.append('icon', options.icon);
      }
      if (options.group) {
        params.append('group', options.group);
      }
      if (options.url) {
        params.append('url', options.url);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`📤 发送Bark通知:`, { title, body });

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'doujiang-message-push/1.0.0'
        }
      });

      if (response.data.code === 200) {
        console.log('✅ Bark通知发送成功');
        return {
          success: true,
          messageId: response.data.timestamp || Date.now(),
          data: response.data
        };
      } else {
        throw new Error(response.data.message || 'Bark API响应失败');
      }

    } catch (error) {
      console.error('❌ Bark通知发送失败:', error.message);
      
      let errorMessage = '通知发送失败';
      if (error.response) {
        // API错误响应
        const apiError = error.response.data;
        errorMessage = apiError.message || `HTTP ${error.response.status}`;
      } else if (error.code === 'ECONNABORTED') {
        // 超时错误
        errorMessage = '请求超时，请稍后重试';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        // 网络错误
        errorMessage = '网络连接失败，请检查Bark服务器地址';
      }

      return {
        success: false,
        error: errorMessage,
        details: error.message
      };
    }
  }

  /**
   * 发送通知到多个设备（如果有多个设备密钥）
   * @param {Array<string>} deviceKeys - 设备密钥数组
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   * @param {Object} options - 可选配置
   * @returns {Promise<Array>} 发送结果数组
   */
  async sendNotificationToMultiple(deviceKeys, title, body, options = {}) {
    const results = [];
    
    for (const deviceKey of deviceKeys) {
      // 临时创建新的服务实例
      const tempService = new BarkService(this.serverUrl, deviceKey);
      const result = await tempService.sendNotification(title, body, options);
      results.push({
        deviceKey,
        ...result
      });
      
      // 避免过于频繁的API调用
      if (deviceKeys.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }

  /**
   * 验证Bark服务配置是否正确
   * @returns {Promise<Object>} 验证结果
   */
  async validateConfig() {
    try {
      // 发送测试通知
      const result = await this.sendNotification('配置验证', '豆浆消息推送服务配置验证');
      
      if (result.success) {
        console.log('✅ Bark配置验证成功');
        return {
          valid: true,
          message: 'Bark配置验证成功'
        };
      } else {
        return {
          valid: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ Bark配置验证失败:', error.message);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = BarkService;
