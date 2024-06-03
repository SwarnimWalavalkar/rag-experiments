import Redis from "ioredis";
import config from "../config";
import logger from "../utils/logger";

const connections: { [name: string]: Redis } = {};
export let redis: Redis;

export function getPrefixedClient(keyPrefix: string): Redis {
  if (connections[keyPrefix]) return connections[keyPrefix] as Redis;

  const client = new Redis({
    ...config.redis,
    enableOfflineQueue: false,
    keyPrefix,
  });

  client.on("error", (err) => {
    logger.error({ msg: "redis error", err, connection: keyPrefix });
  });

  client.once("connect", (...args) => {
    logger.info({
      msg: "connected to redis",
      redis: {
        ...config.redis,
        keyPrefix,
      },
    });
  });

  connections[keyPrefix] = client;
  return client;
}

export const setupRedis = async () => (redis = getPrefixedClient("server:"));
