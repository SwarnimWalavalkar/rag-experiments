import { eq, sql } from "drizzle-orm";
import { db } from "../../../dependencies/db";
import {
  UserEmbedding,
  UserEmbeddingInsert,
  user_embeddings,
} from "../../../schema/user_embeddings";
import { ServiceError } from "../../../shared/errors";
import { Err, Ok, Result } from "../../../shared/result";
import logger from "../../../utils/logger";
import { fetchUser } from "../user/user.service";

class UserEmbeddingsServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("User Service Error", message, source);
    this.name = this.constructor.name;
  }
}

export async function retrieveContextFromQueryEmbedding(
  userUUID: string,
  queryEmbedding: Array<number>
): Promise<
  Result<{ content: string; url: string }, UserEmbeddingsServiceError>
> {
  try {
    const user = await fetchUser(userUUID);
    if (!user.ok) {
      return Err(user.error);
    }

    const userEmbeddings = await db
      .select()
      .from(user_embeddings)
      .where(eq(user_embeddings.user_id, user.value.id))
      .orderBy(
        sql`${user_embeddings.embedding} <=> ${JSON.stringify(
          queryEmbedding
        )} DESC`
      )
      .limit(1);

    if (!userEmbeddings[0]) {
      return Err(
        new UserEmbeddingsServiceError(
          "No user embeddings found",
          retrieveContextFromQueryEmbedding.name
        )
      );
    }

    const content = userEmbeddings[0].content;
    const url = userEmbeddings[0].url;

    return Ok({ content, url });
  } catch (error) {
    logger.error(
      "[User Embeddings Service] Error querying user embeddings",
      error
    );
    throw error;
  }
}

export async function createUserEmbedding(
  userEmbedding: UserEmbeddingInsert
): Promise<Result<UserEmbedding, UserEmbeddingsServiceError>> {
  try {
    const createdUserEmbedding = (
      await db.insert(user_embeddings).values(userEmbedding).returning()
    )[0];

    if (!createdUserEmbedding) {
      return Err(
        new UserEmbeddingsServiceError(
          "Error creating new user embedding",
          createUserEmbedding.name
        )
      );
    }

    return Ok(createdUserEmbedding as UserEmbedding);
  } catch (error) {
    logger.error(
      "[User Embeddings Service] Error creating a new user embedding",
      error
    );
    throw error;
  }
}
