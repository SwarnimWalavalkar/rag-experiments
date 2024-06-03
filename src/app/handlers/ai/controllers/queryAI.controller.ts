import { openAIRequest } from "../../../services/ai/openai.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { APIError, Unauthorized } from "../../../../shared/errors";
import { z } from "zod";
import { retrieveContextFromQueryEmbedding } from "../../../services/user_embeddings/user_embeddings.service";
import { openAIEmbedText } from "../../../services/ai/openai.embeddings.service";

const body = z.object({
  query: z.string(),
  skipCache: z.boolean().optional(),
  skipRAG: z.boolean().optional(),
});

export default {
  schema: {
    body,
  },
  async handler(
    req: FastifyRequest<{
      Body: z.infer<typeof body>;
    }>,
    reply: FastifyReply
  ) {
    if (!req.user.uuid) {
      throw new Unauthorized("User not authenticated");
    }

    const { query, skipCache, skipRAG } = req.body;

    let systemPrompt;
    let relatedURL;

    if (!skipRAG) {
      const queryEmbedding = await openAIEmbedText(query);

      if (!queryEmbedding.ok) {
        throw new APIError(queryEmbedding.error.message);
      }

      const context = await retrieveContextFromQueryEmbedding(
        req.user.uuid,
        queryEmbedding.value
      );

      if (context.ok) {
        relatedURL = context.value.url;
        systemPrompt = `Your job is to answer queries based on some provided context. Be direct and concise, don't say 'based on the context'.\n\n Context:\n${context.value.content} \nAnswer this question based on the context. Question: ${query}\nAnswer:`;
      }
    }

    const aiResponseResult = await openAIRequest(query, {
      skipCache,
      systemPrompt,
      model: "gpt-4o",
    });

    if (!aiResponseResult.ok) {
      throw new APIError(aiResponseResult.error.message);
    }

    return reply.send({
      human: query,
      ai: aiResponseResult.value,
      relatedURL: relatedURL,
    });
  },
};
