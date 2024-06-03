import { CookieUser } from "../schema/user";

export type Maybe<T> = T | null | undefined;

interface AuthJWTPayload<T extends "ACCESS_TOKEN" | "REFRESH_TOKEN"> {
  type: T;
  user: CookieUser;
}

export type AccessTokenJWTPayload = AuthJWTPayload<"ACCESS_TOKEN">;
export type RefreshTokenJWTPayload = AuthJWTPayload<"REFRESH_TOKEN">;

export interface AuthCookiePayload {
  accessToken: string;
  refreshToken: string;
}
