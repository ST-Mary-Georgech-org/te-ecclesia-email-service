import swaggerJsdoc from "swagger-jsdoc";
import { API_DESCRIPTION, API_URL } from "../config/env.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Email Service API",
      version: "1.0.0",
      description: "Simple API documentation for email service",
    },
    servers: [
      {
        url: API_URL || "http://localhost:8080/api/v1",
        description: API_DESCRIPTION || "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], // where Swagger will look for docs
};

export const swaggerSpec = swaggerJsdoc(options);
