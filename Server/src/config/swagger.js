import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NearMart API",
      version: "2.0.0",
      description:
        "Multi-vendor marketplace API — auth, catalog, cart, orders, payments (Razorpay), delivery, admin.",
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/modules/**/routes.js", "./src/index.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
