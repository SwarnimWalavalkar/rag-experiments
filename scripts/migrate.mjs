#!/usr/bin/env zx
$.shell = "/bin/sh";

const args = argv["_"];

if (!["up", "down", "create"].includes(args[0])) {
  console.log("Invalid command");
  process.exit(1);
}

const dotEnvExists = await fs.pathExists(".env");

if (dotEnvExists) {
  console.log("Loading Environment variables from .env...");
  try {
    (await fs.readFile(".env", { encoding: "utf-8" }))
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .forEach((line) => {
        let [key, value] = line.split("=");

        key = key.trim();
        value = value.replace(/['"]+/g, "").trim();

        process.env[key] = value;
      });

    console.log("Environment variables loaded successfully.", "\n\n");
  } catch (error) {
    console.log("Error loading environment variables.", error);
    process.exit(1);
  }
} else {
  console.log("No .env file found.");
  process.exit(1);
}

console.log("Constructing DB Connection URI from env vars...");
const DBConnectionURI = (
  await $`echo postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$NAME?sslmode=disable`
)
  .toString()
  .trim();

console.log("\n\n");

let commandToRun = ``;

if (["up", "down"].includes(args[0])) {
  try {
    let command = args[0].trim();
    const upToIdx = args[1];

    if (upToIdx && !Number(upToIdx)) {
      console.log(`Incorrect command usage — Upto index must be a number`);
      process.exit(1);
    }

    console.log("COMMAND_TO_RUN", commandToRun);

    await $`docker run -v ./migrations:/migrations --network host --rm -it migrate/migrate -path=/migrations/ -database ${DBConnectionURI} ${command} ${
      upToIdx ?? ""
    }`;
  } catch (error) {
    console.log("Error applying migrations.");
    process.exit(1);
  }
}

if (["create"].includes(args[0])) {
  try {
    const migrationName = args[1];

    if (!migrationName) {
      console.log(`Incorrect command usage — migration name is required`);
      process.exit(1);
    }

    console.log("COMMAND_TO_RUN", commandToRun);

    await $`docker run -v ./migrations:/migrations --network host --rm migrate/migrate create -seq -ext sql -dir /migrations -seq ${migrationName}`;
  } catch (error) {
    console.log("Error creating a migration.");
    process.exit(1);
  }
}
