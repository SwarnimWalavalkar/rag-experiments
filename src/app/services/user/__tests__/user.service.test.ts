import { it, describe, expect } from "vitest";
import { createUser, fetchUser, updateUser } from "../user.service";
import { assertResultSuccess } from "../../../../utils/assertResultSuccess";

describe("User Service", () => {
  it("find users by username", async () => {
    const createdUserRes = await createUser({
      name: "Test User",
      username: "testUsername",
      email: "test@test.com",
      password: "passwordHash",
    });

    expect(createdUserRes.ok).toBe(true);
    assertResultSuccess(createdUserRes);

    const foundUserRes = await fetchUser(createdUserRes.value.username);

    expect(foundUserRes.ok).toBe(true);
    assertResultSuccess(foundUserRes);

    expect(foundUserRes.value).toStrictEqual(createdUserRes.value);
  });

  it("create user", async () => {
    const createdUserRes = await createUser({
      name: "Test User",
      username: "testUsername",
      email: "test@test.com",
      password: "passwordHash",
    });

    expect(createdUserRes.ok).toBe(true);
    assertResultSuccess(createdUserRes);

    const { created_at, updated_at, id, uuid, ...createdUser } =
      createdUserRes.value;

    expect(createdUser).toMatchSnapshot();
  });

  it("update user", async () => {
    const createdUserRes = await createUser({
      name: "Test User",
      username: "testUsername",
      email: "test@test.com",
      password: "passwordHash",
    });

    expect(createdUserRes.ok).toBe(true);
    assertResultSuccess(createdUserRes);

    const newName = "New Test User";
    const updatedUserRes = await updateUser(createdUserRes.value.email, {
      name: newName,
    });

    expect(updatedUserRes.ok).toBe(true);
    assertResultSuccess(updatedUserRes);

    const foundUserRes = await fetchUser(createdUserRes.value.username);

    expect(foundUserRes.ok).toBe(true);
    assertResultSuccess(foundUserRes);

    expect(foundUserRes.value.name).toBe(newName);
  });
});
