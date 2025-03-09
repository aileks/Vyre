/**
 * Converts a camelCase string to snake_case.
 * For example, "firstName" becomes "first_name" and "APIKey" becomes "api_key".
 *
 * @param str - The camelCase string to convert
 * @returns The converted snake_case string
 */
export const valsToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Converts a snake_case string to camelCase.
 * For example, "first_name" becomes "firstName" and "api_key" becomes "apiKey".
 *
 * @param str - The snake_case string to convert
 * @returns The converted camelCase string
 */
export const valsToCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
};

/**
 * Recursively converts all object keys from camelCase to snake_case.
 * This function handles nested objects and arrays, transforming all levels
 * of an object hierarchy.
 *
 * @template T - The type of the object being transformed
 * @param obj - The object whose keys should be converted
 * @returns A new object with all keys converted to snake_case
 */
export const keysToSnakeCase = <T>(obj: T): T => {
  // Handle arrays by mapping over each element
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as unknown as T;
  }

  // Handle objects by converting each key and recursively transforming values
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        valsToSnakeCase(key),
        keysToSnakeCase(value),
      ]),
    ) as unknown as T;
  }

  // Return primitives as is
  return obj;
};

/**
 * Recursively converts all object keys from snake_case to camelCase.
 * This function handles nested objects and arrays, transforming all levels
 * of an object hierarchy.
 *
 * @template T - The type of the object being transformed
 * @param obj - The object whose keys should be converted
 * @returns A new object with all keys converted to camelCase
 */
export const keysToCamelCase = <T>(obj: T): T => {
  // Handle arrays by mapping over each element
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as unknown as T;
  }

  // Handle objects by converting each key and recursively transforming values
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        valsToCamelCase(key),
        keysToCamelCase(value),
      ]),
    ) as unknown as T;
  }

  // Return primitives as is
  return obj;
};

/**
 * Type-safe utility to convert an object from snake_case to camelCase and cast to target type.
 * This is particularly useful for API responses where you know the expected shape.
 *
 * @template T - The target type with camelCase keys
 * @template S - The source type with snake_case keys (inferred from input)
 * @param snakeCaseObj - Object with snake_case keys to convert
 * @returns The input object with all keys converted to camelCase and typed as T
 */
export function convertToCamelCase<T, S extends object = any>(
  snakeCaseObj: S,
): T {
  return keysToCamelCase<T>(snakeCaseObj as unknown as T);
}

/**
 * Type-safe utility to convert an object from camelCase to snake_case and cast to target type.
 * This is particularly useful for preparing data to send to an API that expects snake_case.
 *
 * @template T - The target type with snake_case keys
 * @template S - The source type with camelCase keys (inferred from input)
 * @param camelCaseObj - Object with camelCase keys to convert
 * @returns The input object with all keys converted to snake_case and typed as T
 */
export function convertToSnakeCase<T, S extends object = any>(
  camelCaseObj: S,
): T {
  return keysToSnakeCase<T>(camelCaseObj as unknown as T);
}
