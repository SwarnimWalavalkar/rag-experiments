import { AsyncLocalStorage, AsyncResource } from "async_hooks";
import { randomUUID } from "crypto";

const als = new AsyncLocalStorage();

const isWrappedSymbol = Symbol("cls-rtracer-is-wrapped");
const wrappedSymbol = Symbol("cls-rtracer-wrapped-function");

function wrapEmitterMethod(emitter: any, method: any, wrapper: any) {
  if (emitter[method][isWrappedSymbol]) {
    return;
  }

  const original = emitter[method];
  const wrapped = wrapper(original, method);
  wrapped[isWrappedSymbol] = true;
  emitter[method] = wrapped;

  return wrapped;
}

const addMethods = ["on", "addListener", "prependListener"];

const removeMethods = ["off", "removeListener"];

function wrapEmitter(emitter: any, asyncResource: AsyncResource) {
  for (const method of addMethods) {
    wrapEmitterMethod(
      emitter,
      method,
      (original: any) =>
        function (name: any, handler: any) {
          handler[wrappedSymbol] = asyncResource.runInAsyncScope.bind(
            asyncResource,
            handler,
            emitter
          );
          // @ts-expect-error
          return original.call(this, name, handler[wrappedSymbol]);
        }
    );
  }

  for (const method of removeMethods) {
    wrapEmitterMethod(
      emitter,
      method,
      (original: any) =>
        function (name: any, handler: any) {
          // @ts-expect-error
          return original.call(this, name, handler[wrappedSymbol] || handler);
        }
    );
  }
}

const wrapHttpEmitters = (req: any, res: any) => {
  const asyncResource = new AsyncResource("cls-rtracer");
  wrapEmitter(req, asyncResource);
  wrapEmitter(res, asyncResource);
};

const pluginName = "cls-rtracer";

export const fastifyPlugin = (fastify: any, options: any, next: any) => {
  const {
    useHeader = false,
    headerName = "X-Request-Id",
    useFastifyRequestId = false,
    requestIdFactory = randomUUID,
    echoHeader = false,
  } = options;

  fastify.addHook("onRequest", (request: any, reply: any, done: any) => {
    let requestId;
    if (useHeader) {
      requestId = request.headers[headerName.toLowerCase()];
    }
    if (useFastifyRequestId) {
      requestId = requestId || request.id;
    }
    requestId = requestId || requestIdFactory();

    if (echoHeader) {
      reply.header(headerName, requestId);
    }

    als.run(requestId, () => {
      wrapHttpEmitters(request.raw, reply.raw);
      done();
    });
  });
  next();
};

//@ts-expect-error
fastifyPlugin[Symbol.for("skip-override")] = true;
//@ts-expect-error
fastifyPlugin[Symbol.for("fastify.display-name")] = pluginName;

export default als;
