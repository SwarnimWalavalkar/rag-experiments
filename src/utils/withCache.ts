import { redis } from "../dependencies/redis";

const inMemoryCache = new Map<string, { expiry: number; value: unknown }>();

export default async function withCache<T>(
  computeVal: Promise<T> | (() => Promise<T>),
  key: string,
  ex: number = 60 * 60 * 24
): Promise<T> {
  const inMemoryCacheValue = inMemoryCache.get(key);

  if (inMemoryCacheValue) {
    if (Date.now() > inMemoryCacheValue.expiry) {
      inMemoryCache.delete(key);
    } else {
      return inMemoryCacheValue.value as T;
    }
  }

  const redisCacheValue = await redis.get(key);

  if (redisCacheValue) {
    return JSON.parse(redisCacheValue) as T;
  }

  let computedValue: T;

  if (computeVal instanceof Promise) {
    computedValue = await computeVal;
  } else {
    computedValue = await computeVal();
  }

  if (computedValue) {
    await redis.set(key, JSON.stringify(computedValue), "EX", ex);
    inMemoryCache.set(key, {
      expiry: Date.now() + ex * 1000,
      value: computedValue,
    });
  }

  return computedValue! as T;
}
