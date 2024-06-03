import app from "../../../..";
import { it, describe, expect, beforeAll } from "vitest";

import config from "../../../../../config";

describe("Find User Controller", () => {
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
  });

  it("should return a user", async () => {
    const response = await app.inject({
      method: "GET",
      path: `/api/v1/${config.name}/users/find`,
      query: {
        username_or_email: "test@test.com",
      },
    });

    const data = await response.json();

    expect(response.statusCode).toBe(200);
    expect(data.user).toBeDefined();
  });

  it("should return a 404 on invalid username/email", async () => {
    const response = await app.inject({
      method: "GET",
      path: `/api/v1/${config.name}/users/find`,
      query: {
        username_or_email: "thisdoesnotexist",
      },
    });

    expect(response.statusCode).toBe(404);
  });
});
