import logger from "../../utils/logger";
import { FastifySchemaCompiler } from "fastify";
import { ZodAny, ZodError } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { fromZodError } from "zod-validation-error";
import { Schema } from "../types/fastify";

const zodToJsonSchemaOptions = {
  target: "openApi3",
  $refStrategy: "none",
} as const;

export const validatorCompiler: FastifySchemaCompiler<ZodAny> =
  ({ schema }) =>
  (data): any => {
    try {
      return { value: schema.parse(data) };
    } catch (error) {
      const validationError = fromZodError(error as ZodError);
      logger.error("[VALIDATION ERROR]", validationError);

      return { error: validationError };
    }
  };

function hasOwnProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, any> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function resolveSchema(
  maybeSchema: ZodAny | { properties: ZodAny }
): Pick<ZodAny, "safeParse"> {
  if (hasOwnProperty(maybeSchema, "safeParse")) {
    return maybeSchema;
  }
  if (hasOwnProperty(maybeSchema, "properties")) {
    return maybeSchema.properties;
  }
  throw new Error(`Invalid schema passed: ${JSON.stringify(maybeSchema)}`);
}

export const createJsonSchemaTransform = ({
  skipList,
}: {
  skipList: readonly string[];
}) => {
  return ({ schema, url }: { schema: Schema; url: string }) => {
    if (!schema) {
      return {
        schema,
        url,
      };
    }

    const { response, headers, querystring, body, params, hide, ...rest } =
      schema;

    const transformed: Record<string, any> = {};

    if (skipList.includes(url) || hide) {
      transformed.hide = true;
      return { schema: transformed, url };
    }

    const zodSchemas: Record<string, any> = {
      headers,
      querystring,
      body,
      params,
    };

    for (const prop in zodSchemas) {
      const zodSchema = zodSchemas[prop];
      if (zodSchema) {
        transformed[prop] = zodToJsonSchema(zodSchema, zodToJsonSchemaOptions);
      }
    }

    if (response) {
      transformed.response = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const prop in response as any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = resolveSchema((response as any)[prop]);

        const transformedResponse = zodToJsonSchema(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema as any,
          zodToJsonSchemaOptions
        );
        transformed.response[prop] = transformedResponse;
      }
    }

    for (const prop in rest) {
      const meta = rest[prop as keyof typeof rest];
      if (meta) {
        transformed[prop] = meta;
      }
    }

    return { schema: transformed, url };
  };
};

const defaultSkipList = [
  "/api/v1/docs/",
  "/api/v1/docs/initOAuth",
  "/api/v1/docs/json",
  "/api/v1/docs/uiConfig",
  "/api/v1/docs/yaml",
  "/api/v1/docs/*",
  "/api/v1/docs/static/*",
];

export const jsonSchemaTransform = createJsonSchemaTransform({
  skipList: defaultSkipList,
});
