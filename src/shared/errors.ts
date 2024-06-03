export class ServiceError extends Error {
  type: string;
  message: string;
  source: string;
  ignoreLog: boolean;

  constructor(
    type: string,
    message: string,
    source?: string,
    ignoreLog = false
  ) {
    super();

    Object.setPrototypeOf(this, ServiceError.prototype);

    this.type = type;
    this.message =
      message ??
      "An unknown error occurred. If this persists, please contact us.";
    this.source = source ?? "unspecified";
    this.ignoreLog = ignoreLog;
  }

  toJSON(): Record<PropertyKey, string> {
    return {
      type: this.type,
      message: this.message,
      source: this.source,
    };
  }
}

export class APIError extends Error {
  type: string;

  message: string;

  status: number;

  ignoreLog: boolean;

  constructor(
    type?: string,
    message?: string,
    status?: number,
    ignoreLog = false
  ) {
    super();
    Object.setPrototypeOf(this, APIError.prototype);

    this.status = status ?? 500;

    this.type = type ?? "Internal Server Error";

    this.message =
      message ??
      "An unknown error occurred. If this persists, please contact us.";

    this.ignoreLog = ignoreLog;

    this.name = this.constructor.name;
  }

  toJSON(): Record<PropertyKey, string | number> {
    return {
      type: this.type,
      message: this.message,
      status: this.status,
    };
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, ignoreLog = false) {
    super("Not Found", message, 404, ignoreLog);

    Object.setPrototypeOf(this, APIError.prototype);

    this.name = this.constructor.name;
  }
}

export class BadRequest extends APIError {
  constructor(message: string, ignoreLog = false) {
    super("Bad Request", message, 400, ignoreLog);

    Object.setPrototypeOf(this, APIError.prototype);

    this.name = this.constructor.name;
  }
}

export class Unauthorized extends APIError {
  constructor(message: string, ignoreLog = false) {
    super("Unauthorized", message, 401, ignoreLog);

    Object.setPrototypeOf(this, APIError.prototype);

    this.name = this.constructor.name;
  }
}
