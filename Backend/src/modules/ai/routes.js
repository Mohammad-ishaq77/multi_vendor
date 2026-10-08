import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { validate } from "../../common/middleware/validate.js";
import { config } from "../../config/env.js";
import { repo } from "../../config/db.js";

const router = Router();

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
});

/**
  Fetch marketplace context snapshot (popular categories, active shops, featured products)
  so the AI chatbot has ground-truth context about NearMart.
 */
async function getMarketplaceContext() {
  try {
    const [categories, shops, products] = await Promise.all([
      repo("Category").find({ take: 10 }),
      repo("Shop").find({ where: { isApproved: true }, take: 8 }),
      repo("Product").find({ where: { isAvailable: true }, take: 15 }),
    ]);

    const catNames = categories.map((c) => c.name).join(", ");
    const shopList = shops.map((s) => `${s.name} (${s.city || "Local"})`).join(", ");
    const prodList = products.map((p) => `${p.name} - Ôé¦${p.price}`).join("; ");

    return `Available Categories: ${catNames || "General Store, Groceries, Electronics"}.
Featured Approved Shops: ${shopList || "Local Express, Daily Mart"}.
Sample Available Products: ${prodList || "Fresh Vegetables, Fruits, Daily Essentials"}.`;
  } catch (err) {
    return "NearMart is a hyper-local multi-vendor e-commerce marketplace connecting buyers with nearby shops.";
  }
}

/**
 * Fallback response generator when Ollama service is unreachable or not running locally.
 */
function getFallbackResponse(message, contextInfo) {
  const query = message.toLowerCase();

  if (query.includes("delivery") || query.includes("shipping") || query.includes("time")) {
    return "NearMart offers fast local delivery directly from nearby approved vendors! Delivery typically takes between 30 to 60 minutes depending on your distance from the shop.";
  }
  if (query.includes("return") || query.includes("refund") || query.includes("cancel")) {
    return "You can easily check your order status or request cancellations from your Account > Orders dashboard. For shop-specific return policies, please contact the seller via the shop page.";
  }
  if (query.includes("add") && (query.includes("shop") || query.includes("store") || query.includes("vendor") || query.includes("sell"))) {
    return "To add your shop and start selling on NearMart, simply register an account and select 'Shopkeeper' as your role. You can then submit your shop details for quick approval!";
  }
  if (query.includes("shop") || query.includes("vendor") || query.includes("store")) {
    const shops = contextInfo.split("Featured Approved Shops: ")[1]?.split("\n")[0];
    return `We have many active verified shops on NearMart! ${shops ? `Some of our top stores include: ${shops}. ` : ""}Explore our Marketplace page to discover all local shops.`;
  }
  if (query.includes("product") || query.includes("price") || query.includes("item") || query.includes("buy")) {
    const products = contextInfo.split("Sample Available Products: ")[1];
    return `Looking for items? ${products ? `Some of the items available right now are: ${products.replace(".", "")}. ` : ""}You can use the search bar above to instantly find products by voice or text!`;
  }
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! Welcome to NearMart Assistant. How can I help you find products, local shops, or track orders today?";
  }

  if (query.includes("contact") || query.includes("phone") || query.includes("email") || query.includes("support")) {
    return "You can reach out to NearMart support via email at support@nearmart.in or call us at +91-9876543210 for any assistance.";
  }
  if (query.includes("frontend") || query.includes("backend") || query.includes("database") || query.includes("tech") || query.includes("stack") || query.includes("project")) {
    return "NearMart is built with a modern tech stack: React.js and Tailwind CSS for the frontend, Node.js and Express for the backend, and PostgreSQL as the database.";
  }

  return `Thanks for reaching out! NearMart is your hyper-local marketplace. You can search products, browse categories, or check active shops. ${contextInfo}`;
}

/**
 * POST /api/ai/chat ÔÇö Send user prompt & history to backend AI (Ollama with fallback)
 */
router.post(
  "/chat",
  validate({ body: chatSchema }),
  asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;
    const contextInfo = await getMarketplaceContext();

    const systemPrompt = `You are NearMart Assistant, a helpful, polite, and knowledgeable AI assistant for NearMart, a multi-vendor e-commerce marketplace.
Your goal is to assist customers with products, shop recommendations, ordering process, delivery information, and general customer support.
Keep your responses concise, clear, friendly, and structured.

Project Information:
- Tech Stack: Frontend (React.js, Tailwind CSS), Backend (Node.js, Express), Database (PostgreSQL).
- Contact Info: Email (support@nearmart.in), Phone (+91-9876543210).

Here is real-time catalog context from the NearMart database:
${contextInfo}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    try {
      console.log("OLLAMA REQUEST:", {
        host: config.ai.ollamaHost,
        model: config.ai.model,
        hasApiKey: Boolean(config.ai.apiKey),
      });

      const response = await fetch(`${config.ai.ollamaHost}/api/chat`, {
        method: "POST",
        headers: {
      "Content-Type": "application/json",
      ...(config.ai.apiKey
        ? { Authorization: `Bearer ${config.ai.apiKey}` }
        : {}),
    },
        body: JSON.stringify({
          model: config.ai.model,
          messages,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data?.message?.content || data?.response;
        if (reply) {
          return res.json({
            ok: true,
            data: {
              reply: reply.trim(),
              provider: "ollama",
              model: config.ai.model,
            },
          });
        }
      }
      throw new Error(`Ollama status ${response.status}`);
    } catch (error) {
      console.error("OLLAMA AI ERROR:", {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        cause: error?.cause?.message,
        causeCode: error?.cause?.code,
        causeName: error?.cause?.name,
      });
      // Graceful fallback response if Ollama is not running locally
      const fallbackReply = getFallbackResponse(message, contextInfo);
      return res.json({
        ok: true,
        data: {
          reply: fallbackReply,
          provider: "fallback-assistant",
          note: "Ollama service offline. Used intelligent local assistant fallback.",
        },
      });
    }
  })
);

export default router;





