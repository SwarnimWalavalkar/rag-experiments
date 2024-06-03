import backupPostgresDB from "./utils/backupPostgresDB";

export async function setup() {
  await backupPostgresDB();
}
