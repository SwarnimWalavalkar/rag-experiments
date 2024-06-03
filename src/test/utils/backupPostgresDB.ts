import config from "../../config";
import execPromise from "../../utils/execPromise";
import getPostgresContainerId from "./getPostgresContainerId";

export default async function (): Promise<void> {
  const postgresContainerID = await getPostgresContainerId();

  await execPromise(
    `docker exec -t ${postgresContainerID} sh -c 'pg_dump -F c -b -v -U postgres -f backup ${config.name}'`
  );
}
