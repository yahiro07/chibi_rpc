export type RpcSignaturesBase = Record<string, (payload: any) => Promise<any>>;

export type ServerRpcRouter<T extends RpcSignaturesBase> = {
  [K in keyof T]: (payload: Parameters<T[K]>[0]) => ReturnType<T[K]>;
};

export type ServerRpcRouterWithContext<T extends RpcSignaturesBase, TContext> =
  {
    [K in keyof T]: (
      payload: Parameters<T[K]>[0],
      context: TContext,
    ) => ReturnType<T[K]>;
  };
