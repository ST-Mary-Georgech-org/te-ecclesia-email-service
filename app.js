import express from "express";
import { PORT } from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import emailRouter from "./routes/email.route.js";
import whatsappRouter from "./routes/whatsapp.route.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import { renderSwaggerUiPage } from "./docs/swaggerUiPage.js";

const app = express();
const isDevelopment = process.env.NODE_ENV === "development";
const DOCS_PATH = "/api/v1/docs";
const DOCS_SPEC_PATH = `${DOCS_PATH}/swagger.json`;

app.set("trust proxy", true);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.redirect(`${DOCS_PATH}/`);
});

app.get(DOCS_SPEC_PATH, (req, res) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const origin = `${protocol}://${host}`;

  return res.status(200).json({
    ...swaggerSpec,
    servers: [
      {
        url: origin,
        description: "Current server",
      },
    ],
  });
});

if (isDevelopment) {
  app.use(
    DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: DOCS_SPEC_PATH,
        validatorUrl: null,
      },
      explorer: true,
    }),
  );
} else {
  app.get(`${DOCS_PATH}/`, (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(renderSwaggerUiPage(DOCS_SPEC_PATH));
  });
}

app.use("/api/v1", emailRouter);
app.use("/api/v1/whatsapp", whatsappRouter);

app.use(errorMiddleware);

if (isDevelopment) {
  app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
  });
}

export default app;
