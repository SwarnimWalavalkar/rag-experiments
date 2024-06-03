import * as argon2 from "argon2";
import { z } from "zod";
import { fetchUser } from "../../../services/user/user.service";
import { BadRequest, NotFoundError } from "../../../../shared/errors";
import { FastifyReply, FastifyRequest } from "fastify";
import config from "../../../../config";
import { base64URLEncode } from "../../../../utils/base64";
import { sign } from "../../../../utils/jwt";
import {
  AccessTokenJWTPayload,
  AuthCookiePayload,
  RefreshTokenJWTPayload,
} from "../../../../shared/types";
import { CookieUser } from "../../../../schema/user";

const body = z
  .object({
    username_or_email: z.string(),
    password: z.string(),
  })
  .required();

export default {
  schema: {
    body,
  },
  async handler(
    req: FastifyRequest<{ Body: z.infer<typeof body> }>,
    reply: FastifyReply
  ) {
    const {
      JWT_TOKEN_TYPES: { REFRESH_TOKEN, ACCESS_TOKEN },
      AUTH_COOKIE_NAME,
    } = config.constants;
    const { username_or_email, password } = req.body;

    const foundUserRes = await fetchUser(username_or_email);

    if (!foundUserRes.ok) {
      throw new NotFoundError("INVALID_USERNAME_OR_EMAIL");
    }

    const match = await argon2.verify(foundUserRes.value.password, password);

    if (!match) throw new BadRequest("INVALID_CREDENTIALS");

    const foundUser = foundUserRes.value;

    const user: CookieUser = {
      uuid: foundUser.uuid,
      roles: foundUser.roles,
    };

    const accessToken = sign<AccessTokenJWTPayload>(ACCESS_TOKEN, {
      user,
      type: ACCESS_TOKEN,
    });

    const refreshToken = sign<RefreshTokenJWTPayload>(REFRESH_TOKEN, {
      user,
      type: REFRESH_TOKEN,
    });

    const cookieObj: AuthCookiePayload = {
      accessToken,
      refreshToken,
    };

    const cookieBuffer = base64URLEncode(cookieObj);

    reply.setCookie(AUTH_COOKIE_NAME, cookieBuffer, {
      domain: config.domain,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: true,
    });

    return reply.send({ user });
  },
};
