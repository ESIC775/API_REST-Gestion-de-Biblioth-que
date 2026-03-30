require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./docs/swagger");
const router = require("./routes/index");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API opérationnelle." });
});

// Routes API
app.use("/api", router);

// Middlewares d'erreurs
app.use(notFound);
app.use(errorHandler);

module.exports = app;
