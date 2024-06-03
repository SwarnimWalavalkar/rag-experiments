import pino from "pino";
import als from "../lib/als";
import config from "../config";

const logger = pino({
  name: config.name,
  mixin() {
    return { traceId: als.getStore() };
  },
  level:
    process.env.NODE_ENV === "development"
      ? "debug"
      : process.env.NODE_ENV === "test" || process.env.NODE_ENV === "cli"
      ? "error"
      : "info",
  redact: {
    paths: [
      "password",
      "*.password",
      "*.body.password",
      "event.data.password",
      "req.headers['authorization']",
      "req.cookies['authorization']",
    ],
    censor: "**SENSETIVE INFORMATION**",
  },
});

export default logger;
