import { createSigner, createVerifier } from "fast-jwt";
import config from "../config";
import { ServiceError } from "../shared/errors";
import logger from "./logger";

const accessTokenSigner = createSigner({
  key: config.jwt.tokenSecret,
  expiresIn: "60m",
});

const refreshTokenSigner = createSigner({
  key: config.jwt.tokenSecret,
  expiresIn: "7d",
});

const verifier = createVerifier({ key: config.jwt.tokenSecret });

export const sign = <T extends Record<PropertyKey, any>>(
  type: keyof typeof config.constants.JWT_TOKEN_TYPES,
  payload: T
) => {
  try {
    switch (type) {
      case "ACCESS_TOKEN":
        return accessTokenSigner(payload);
      case "REFRESH_TOKEN":
        return refreshTokenSigner(payload);
      default:
        throw new ServiceError("JWT Error", "Invalid token type");
    }
  } catch (error) {
    logger.error(error, "[JWT SIGN ERROR]");
    throw error;
  }
};

export const verify = <T>(
  token: string
): (T & { iat: number; exp: number }) | null => {
  try {
    return verifier(token);
  } catch (error: any) {
    if (error.message.includes("expired")) {
      return null;
    }
    logger.error(error, "[JWT VERIFY ERROR]");
    throw error;
  }
};
