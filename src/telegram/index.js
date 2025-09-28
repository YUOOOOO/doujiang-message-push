const TelegramService = require('./telegramService');

/**
 * 创建Telegram服务实例
 * @param {string} botToken - Bot Token
 * @returns {TelegramService} Telegram服务实例
 */
function createTelegramService(botToken) {
  return new TelegramService(botToken);
}

/**
 * 快速发送消息的便捷函数
 * @param {string} botToken - Bot Token
 * @param {string|number} chatId - 聊天ID
 * @param {string} message - 消息内容
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} 发送结果
 */
async function sendMessage(botToken, chatId, message, options = {}) {
  const service = new TelegramService(botToken);
  return await service.sendMessage(chatId, message, options);
}

/**
 * 快速发送消息到多个聊天的便捷函数
 * @param {string} botToken - Bot Token
 * @param {Array<string|number>} chatIds - 聊天ID数组
 * @param {string} message - 消息内容
 * @param {Object} options - 可选配置
 * @returns {Promise<Array>} 发送结果数组
 */
async function sendMessageToMultiple(botToken, chatIds, message, options = {}) {
  const service = new TelegramService(botToken);
  return await service.sendMessageToMultiple(chatIds, message, options);
}

module.exports = {
  TelegramService,
  createTelegramService,
  sendMessage,
  sendMessageToMultiple
};
