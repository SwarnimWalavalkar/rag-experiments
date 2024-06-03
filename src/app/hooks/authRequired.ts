import { FastifyRequest, FastifyReply } from "fastify";
import { base64URLDecode, base64URLEncode } from "../../utils/base64";
import { BadRequest, Unauthorized } from "../../shared/errors";
import { sign, verify } from "../../utils/jwt";
import config from "../../config";
import {
  AccessTokenJWTPayload,
  AuthCookiePayload,
  RefreshTokenJWTPayload,
} from "../../shared/types";
import { CookieUser } from "../../schema/user";

export default async function authRequiredHook(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const {
    AUTH_COOKIE_NAME,
    JWT_TOKEN_TYPES: { ACCESS_TOKEN },
  } = config.constants;
  try {
    const cookie = req.cookies[AUTH_COOKIE_NAME];
    if (!cookie) {
      throw new Unauthorized("Authorization cookie not found");
    }

    const decodedCookie = base64URLDecode<AuthCookiePayload>(cookie);

    const { accessToken, refreshToken } = decodedCookie;

    let user: CookieUser;
    const accessTokenVerification = verify<AccessTokenJWTPayload>(accessToken);

    if (accessTokenVerification) {
      user = accessTokenVerification.user;
    } else {
      reply.clearCookie(AUTH_COOKIE_NAME);

      const refreshTokenVerification =
        verify<RefreshTokenJWTPayload>(refreshToken);

      if (!refreshTokenVerification) {
        throw new Unauthorized("Refresh Token Expired");
      }

      user = refreshTokenVerification.user;

      const newAccessToken = sign<AccessTokenJWTPayload>(ACCESS_TOKEN, {
        user,
        type: ACCESS_TOKEN,
      });

      const cookieObj: AuthCookiePayload = {
        accessToken: newAccessToken,
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
    }

    req.user = user;
  } catch (error) {
    throw error;
  }
}
