export default {
  JWT_TOKEN_TYPES: {
    REFRESH_TOKEN: "REFRESH_TOKEN",
    ACCESS_TOKEN: "ACCESS_TOKEN",
  },
  AUTH_COOKIE_NAME: "Authorization",
  DEFAULT_EMBEDDINGS_DIMENSION: 1536,
  PROMPTS: {
    SUMMARIZE_WEBPAGE_CONTENT:
      "You will be given the content of a webpage in markdown format, your job is to summarize most useful and relevant content from the markdown. Be concise in your response. Respond only with the resulting markdown. Do not add anything in the response that wasn't already in the source content. And also format the resulting markdown",
    DEFAULT_QUERY_PROMPT: "You are a helpful assistant.",
  },
} as const;
