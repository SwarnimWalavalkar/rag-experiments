import { ChatModel } from "openai/resources/index.mjs";
import constants from "./constants";

export default {
  name: "rag-service",
  version: process.env.VERSION ?? "v1",
  domain: process.env.DOMAIN ?? "localhost",
  port: process.env.PORT ?? 4000,
  isDevelopment: process.env.NODE_ENV === "development",
  db: {
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
  },
  jwt: {
    tokenSecret: process.env.JWT_TOKEN_SECRET ?? "supersecretrandomstring",
  },
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    embeddings: {
      model: process.env.OPENAI_EMBEDDINGS_MODEL ?? "text-embedding-3-small",
      dimension: Number(process.env.OPENAI_EMBEDDINGS_DIMENSION ?? 1536),
    },
    chatCompletions: {
      model: (process.env.OPENAI_CHAT_COMPLETIONS_MODEL ??
        "gpt-4-turbo") as ChatModel,
      rateLimitTPM: Number(process.env.OPENAI_RATE_LIMIT_TPM ?? 30000),
    },
  },
  groq: {
    rateLimitTPM: Number(process.env.GROQ_RATE_LIMIT_TPM ?? 5000),
    apiKey: process.env.GROQ_API_KEY ?? "",
    webpageContentSummarizationModel:
      process.env.GROQ_MODEL ?? "mixtral-8x7b-32768",
    modelMaxContentWindow: Number(
      process.env.GROQ_MODEL_CONTEXT_WINDOW ?? 32_768
    ),
  },
  transformerJs: {
    embeddings: {
      model: process.env.TRANSFORMERS_JS_EMBEDDINGS_MODEL ?? "Xenova/bge-m3",
      dimension: Number(
        process.env.TRANSFORMERS_JS_EMBEDDINGS_DIMENSION ?? 1024
      ),
    },
  },
  chromium: {
    host: process.env.CHROMIUM_HOST ?? "localhost",
    port: Number(process.env.CHROMIUM_PORT ?? 3000),
    token: process.env.CHROMIUM_TOKEN ?? "supersecretrandomstring",
  },
  constants,
} as const;
