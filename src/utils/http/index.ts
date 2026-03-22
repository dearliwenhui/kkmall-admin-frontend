import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import { message } from "@/utils/message";
import { $t, transformI18n } from "@/plugins/i18n";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

const defaultConfig: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

type QueuedRequest = (token: string) => void;
type KkmallApiResponse = {
  code?: number;
  message?: string;
  data?: unknown;
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  private static requests: QueuedRequest[] = [];
  private static isRefreshing = false;
  private static initConfig: PureHttpRequestConfig = {};
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        const whiteList = ["/api/auth/login", "/api/auth/refresh"];
        return whiteList.some(url => config.url?.endsWith(url))
          ? config
          : new Promise(resolve => {
              const data = getToken();
              if (data) {
                const now = Date.now();
                const expired = Number(data.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    useUserStoreHook()
                      .handRefreshToken()
                      .then(res => {
                        const token = res.data.accessToken;
                        config.headers = config.headers ?? {};
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach(cb => cb(token));
                        PureHttp.requests = [];
                      })
                      .catch(() => {
                        PureHttp.requests = [];
                        useUserStoreHook().logOut();
                        message(transformI18n($t("login.pureLoginExpired")), {
                          type: "warning"
                        });
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers = config.headers ?? {};
                  config.headers["Authorization"] = formatToken(
                    data.accessToken
                  );
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      error => Promise.reject(error)
    );
  }

  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }

        const { data } = response;
        if (data && typeof data === "object" && "code" in data) {
          const apiData = data as KkmallApiResponse;
          if (apiData.code === 200) {
            return data;
          }
          message(apiData.message || "Request failed", { type: "error" });
          return Promise.reject(new Error(apiData.message || "Request failed"));
        }

        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);

        if ($error.response) {
          const status = $error.response.status;
          const responseData = $error.response.data as
            | { message?: string }
            | undefined;

          switch (status) {
            case 401:
              message(
                "\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55",
                {
                  type: "error"
                }
              );
              useUserStoreHook().logOut();
              window.location.href = "/login";
              break;
            case 403:
              message(
                "\u6CA1\u6709\u6743\u9650\u8BBF\u95EE\u8BE5\u8D44\u6E90",
                {
                  type: "error"
                }
              );
              break;
            case 404:
              message("\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728", {
                type: "error"
              });
              break;
            case 500:
              message("\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF", {
                type: "error"
              });
              break;
            default:
              message(responseData?.message || "\u8BF7\u6C42\u5931\u8D25", {
                type: "error"
              });
          }
        } else if ($error.request) {
          message(
            "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC",
            {
              type: "error"
            }
          );
        } else {
          message("\u8BF7\u6C42\u914D\u7F6E\u9519\u8BEF", { type: "error" });
        }

        return Promise.reject($error);
      }
    );
  }

  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then(response => {
          resolve(response as T);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
