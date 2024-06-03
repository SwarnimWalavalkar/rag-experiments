import app from "../../../..";
import { it, describe, expect, beforeAll } from "vitest";
import config from "../../../../../config";

describe("Me Controller", () => {
  let token: string;

  beforeAll(async () => {
    await app.inject({
      method: "POST",
      path: `/api/v1/${config.name}/auth/signup`,
      payload: {
        email: "test@test.com",
        username: "test",
        name: "Test Account",
        password: "testpass",
      },
    });

    const respData = await app.inject({
      method: "POST",
      path: `/api/v1/${config.name}/auth/login`,
      payload: {
        username_or_email: "test@test.com",
        password: "testpass",
      },
    });

    token = String(respData.cookies[0]!.value);
  });

  it("should respond with the currently logged in user", async () => {
    const response = await app.inject({
      method: "GET",
      path: `/api/v1/${config.name}/me/`,
      cookies: { Authorization: token },
    });

    const data = await response.json();

    expect(response.statusCode).toBe(200);
    expect(data.user).toBeDefined();
  });

  it("should with a 401 without the token", async () => {
    const response = await app.inject({
      method: "GET",
      path: `/api/v1/${config.name}/me/`,
    });

    expect(response.statusCode).toBe(401);
  });
});
