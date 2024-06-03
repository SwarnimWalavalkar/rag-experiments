export type Result<T, E extends Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => {
  return { ok: true, value: data };
};

export const Err = <E extends Error>(error: E): Result<never, E> => {
  return { ok: false, error };
};
