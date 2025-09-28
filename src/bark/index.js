const BarkService = require('./barkService');

/**
 * 创建Bark服务实例
 * @param {string} serverUrl - Bark服务器地址
 * @param {string} deviceKey - 设备密钥
 * @returns {BarkService} Bark服务实例
 */
function createBarkService(serverUrl, deviceKey) {
  return new BarkService(serverUrl, deviceKey);
}

/**
 * 快速发送Bark通知的便捷函数
 * @param {string} serverUrl - Bark服务器地址
 * @param {string} deviceKey - 设备密钥
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} 发送结果
 */
async function sendBarkNotification(serverUrl, deviceKey, title, body, options = {}) {
  const service = new BarkService(serverUrl, deviceKey);
  return await service.sendNotification(title, body, options);
}

/**
 * 快速发送通知到多个设备的便捷函数
 * @param {string} serverUrl - Bark服务器地址
 * @param {Array<string>} deviceKeys - 设备密钥数组
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 * @param {Object} options - 可选配置
 * @returns {Promise<Array>} 发送结果数组
 */
async function sendBarkNotificationToMultiple(serverUrl, deviceKeys, title, body, options = {}) {
  // 使用第一个设备密钥创建服务实例
  const service = new BarkService(serverUrl, deviceKeys[0]);
  return await service.sendNotificationToMultiple(deviceKeys, title, body, options);
}

module.exports = {
  BarkService,
  createBarkService,
  sendBarkNotification,
  sendBarkNotificationToMultiple
};
