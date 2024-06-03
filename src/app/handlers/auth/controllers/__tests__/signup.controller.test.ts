import app from "../../../..";
import { it, describe, expect } from "vitest";
import config from "../../../../../config";

describe("Signup Controller", () => {
  it("should respond with a 201 on successful signup", async () => {
    const response = await app.inject({
      method: "POST",
      path: `/api/v1/${config.name}/auth/signup`,
      payload: {
        email: "test@test.com",
        username: "test",
        name: "Test Account",
        password: "testpass",
      },
    });

    expect(response.statusCode).toBe(201);
  });
});
