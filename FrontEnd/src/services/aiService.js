import apiClient from "./apiClient";

export const aiService = {
  /**
   * Send chat prompt and history to the NestJS/Express Backend AI endpoint
   * @param {string} message 
   * @param {Array<{role: string, content: string}>} history 
   * @returns {Promise<{reply: string, provider: string}>}
   */
  async sendMessage(message, history = []) {
    return apiClient.post("/ai/chat", {
      message,
      history,
    });
  },
};

export default aiService;
