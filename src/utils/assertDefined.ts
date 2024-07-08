/**
 * Asserts that a value is not null or undefined.
 *
 * @param value The value to check
 * @param errorMessage Optional custom error message
 * @returns The input value if it's not null or undefined
 * @throws Error if the value is null or undefined
 */
export default function assertDefined<T>(
  value: T | null | undefined,
  errorMessage?: string
): T {
  if (value === null || value === undefined) {
    throw new Error(errorMessage || "Value is null or undefined");
  }
  return value;
}
