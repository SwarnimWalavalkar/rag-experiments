import { db } from "../../../dependencies/db";
import { User, UserInsert, users } from "../../../schema/user";
import logger from "../../../utils/logger";
import { or, eq } from "drizzle-orm";
import { ServiceError } from "../../../shared/errors";
import { Err, Ok, Result } from "../../../shared/result";

class UserServiceError extends ServiceError {
  constructor(message: string, source?: string) {
    super("User Service Error", message, source);
    this.name = this.constructor.name;
  }
}

export async function createUser(
  user: UserInsert
): Promise<Result<User, UserServiceError>> {
  try {
    const createdUser = (await db.insert(users).values(user).returning())[0];

    if (!createUser) {
      return Err(
        new UserServiceError("Error creating new user", createUser.name)
      );
    }

    return Ok(createdUser as User);
  } catch (error) {
    logger.error("[User Service] Error creating a new user", error);
    throw error;
  }
}

export async function fetchUser(
  UUIDOrUsernameOrEmail: string
): Promise<Result<User, UserServiceError>> {
  try {
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.uuid, UUIDOrUsernameOrEmail),
        eq(users.username, UUIDOrUsernameOrEmail),
        eq(users.email, UUIDOrUsernameOrEmail)
      ),
    });

    if (!user) {
      return Err(new UserServiceError("User not found", fetchUser.name));
    }

    return Ok(user);
  } catch (error) {
    logger.error("[User Service] Error getting user by username", error);
    throw error;
  }
}

export async function updateUser(
  userUUID: string,
  userAttr: Partial<UserInsert>
): Promise<Result<User, UserServiceError>> {
  try {
    const foundUser = await fetchUser(userUUID);

    if (!foundUser.ok) {
      return Err(new UserServiceError("User not found", updateUser.name));
    }

    const updatedUser = (
      await db
        .update(users)
        .set(userAttr)
        .where(
          or(
            eq(users.username, userUUID),
            eq(users.email, userUUID)
          )
        )
        .returning()
    )[0] as User;

    return Ok(updatedUser);
  } catch (error) {
    logger.error("[User Service] Error updating user", error);
    throw error;
  }
}
