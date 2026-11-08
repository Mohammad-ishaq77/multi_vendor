import apiClient from "./apiClient";

export const contactService = {
  /**
   * Deliver a public contact-form message to the NearMart inbox.
   * @param {{name: string, email: string, phone?: string, subject: string, message: string}} payload
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async sendMessage(payload) {
    return apiClient.post("/contact", payload, { auth: false, retry: false });
  },
};

export default contactService;
