import type { RpcSignaturesBase } from "./types.ts";

type IPreFetchFnExtra = (op: string, payload: any) => void;

export function createRpcClient<T extends RpcSignaturesBase>(
  urlBase: string,
  options?: {
    preFetchFn?: (op: keyof T, payload: any) => void;
    postFetchFn?: (op: keyof T) => void;
    rawResponseCallback?: (res: Response) => void;
    commonErrorHandler?: (errorMessage: string) => void;
  },
): T {
  let preFetchFnExtra: IPreFetchFnExtra;

  return new Proxy(
    {},
    {
      get(_, op: string) {
        if (op === "__setPreFetchFnExtra") {
          return (fn: IPreFetchFnExtra) => {
            preFetchFnExtra = fn;
          };
        }
        return async (payload: any) => {
          try {
            options?.preFetchFn?.(op, payload);
            preFetchFnExtra?.(op, payload);

            const url = `${urlBase}/${op}`;
            const res = await fetch(url, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload ?? {}),
            });
            const success = res.status < 400;
            const isJson = res.headers
              .get("Content-Type")
              ?.startsWith("application/json");
            if (success) {
              const obj = await res.json();
              options?.rawResponseCallback?.(res);
              return obj;
            } else {
              const detail = (
                isJson ? (await res.json()).error : await res.text()
              ) as string;
              const errorMessage = `rpc call failed ${op}, ${detail}`;
              if (options?.commonErrorHandler) {
                options.commonErrorHandler(errorMessage);
              }
              throw new Error(errorMessage);
            }
          } finally {
            options?.postFetchFn?.(op);
          }
        };
      },
    },
  ) as T;
}
