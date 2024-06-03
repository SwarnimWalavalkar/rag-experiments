import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import sleep from "../utils/sleep";
import logger from "../utils/logger";

export interface NetworkRequestOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
  timeout: number;
}

const makeAxiosRequest = async <D = any, R = any>(
  url: string,
  options: AxiosRequestConfig<D>,
  timeout: number
): Promise<AxiosResponse<R>> => {
  try {
    return await axios({ url, timeout, ...options });
  } catch (error) {
    throw error;
  }
};

const getNetworkOptions = (
  providedOptions: Partial<NetworkRequestOptions> = {}
): NetworkRequestOptions => ({
  retries: 5,
  factor: 2,
  minTimeout: 1 * 1000,
  maxTimeout: 60 * 1000,
  timeout: 10000,

  ...providedOptions,
});

export const makeNetworkRequest = async <D = any, R = any>(
  url: string,
  options: AxiosRequestConfig<D>,
  retryOptions: Partial<NetworkRequestOptions> = {}
): Promise<AxiosResponse<R>> => {
  const { retries, factor, minTimeout, maxTimeout, timeout } =
    getNetworkOptions(retryOptions);

  for (let i = 0; i <= retries; i++) {
    try {
      return await makeAxiosRequest<D, R>(url, options, timeout);
    } catch (error: any) {
      if (
        error.code === "ECONNABORTED" ||
        (error.response &&
          (error.response.status === 429 ||
            (error.response.status >= 500 && error.response.status < 600)))
      ) {
        const delay = Math.min(minTimeout * Math.pow(factor, i), maxTimeout);
        logger.debug(
          `[Network Requester] Attempt ${i} for ${url} failed — Retrying in ${delay}ms`
        );
        logger.debug(error, `[NETWORK REQUESTER ERROR] ${url}`);
        await sleep(delay);
      } else {
        logger.error(
          `[Network Requester] Request to ${url} failed with an unexpected error: ${error.message}`
        );
        throw error;
      }
    }
  }
  logger.error(`[Network Requester] All retries failed for request to ${url}`);
  throw new Error("All retries failed");
};

export const constructNetworkRequester = (
  baseURL: string,
  globalHeaders: AxiosRequestConfig["headers"]
) => {
  return {
    get: async <D = any, R = any>(
      url: string,
      query?: D,
      options: Omit<AxiosRequestConfig<D>, "headers"> = {},
      requestHeaders: AxiosRequestConfig["headers"] = {},
      retryOptions: Partial<NetworkRequestOptions> = {}
    ): Promise<AxiosResponse<R>> => {
      return makeNetworkRequest<D, R>(
        baseURL + url,
        {
          headers: { ...globalHeaders, ...requestHeaders },
          method: "GET",
          params: query ?? {},
          ...options,
        },
        retryOptions
      );
    },
    post: async <D = any, R = any>(
      url: string,
      body?: D,
      options: Omit<AxiosRequestConfig<D>, "headers"> = {},
      requestHeaders: AxiosRequestConfig["headers"] = {},
      retryOptions: Partial<NetworkRequestOptions> = {}
    ): Promise<AxiosResponse<R>> => {
      return makeNetworkRequest<D, R>(
        baseURL + url,
        {
          headers: {
            "Content-Type": "application/json",
            ...globalHeaders,
            ...requestHeaders,
          },
          method: "POST",
          data: body ?? ({} as D),
          ...options,
        },
        retryOptions
      );
    },
    delete: async <D = any, R = any>(
      url: string,
      query?: D,
      options: Omit<AxiosRequestConfig<D>, "headers"> = {},
      requestHeaders: AxiosRequestConfig["headers"] = {},
      retryOptions: Partial<NetworkRequestOptions> = {}
    ): Promise<AxiosResponse<R>> => {
      return makeNetworkRequest<D, R>(
        baseURL + url,
        {
          headers: { ...globalHeaders, ...requestHeaders },
          method: "DELETE",
          params: query ?? {},
          ...options,
        },
        retryOptions
      );
    },
    put: async <D = any, R = any>(
      url: string,
      body?: D,
      options: Omit<AxiosRequestConfig<D>, "headers"> = {},
      requestHeaders: AxiosRequestConfig["headers"] = {},
      retryOptions: Partial<NetworkRequestOptions> = {}
    ): Promise<AxiosResponse<R>> => {
      return makeNetworkRequest<D, R>(
        baseURL + url,
        {
          headers: {
            "Content-Type": "application/json",
            ...globalHeaders,
            ...requestHeaders,
          },
          method: "PUT",
          data: body ?? ({} as D),
          ...options,
        },
        retryOptions
      );
    },
  };
};
