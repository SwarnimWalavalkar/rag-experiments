import app from "../../../..";
import { it, describe, expect, beforeAll } from "vitest";
import config from "../../../../../config";

describe("Login Controller", () => {
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

  it("should respond with a 200 on successful login", async () => {
    const response = await app.inject({
      method: "POST",
      path: `/api/v1/${config.name}/auth/login`,
      payload: {
        username_or_email: "test@test.com",
        password: "testpass",
      },
    });

    const data = await response.json();

    expect(response.statusCode).toBe(200);
  });

  it("should respond with a 400 given an incorrect password", async () => {
    const response = await app.inject({
      method: "POST",
      path: `/api/v1/${config.name}/auth/login`,
      payload: {
        username_or_email: "test@test.com",
        password: "wrongpass",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
