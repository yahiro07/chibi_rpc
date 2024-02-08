import type { RpcSignaturesBase, ServerRpcRouterWithContext } from "./types.ts";

export async function handleServerRpc<
  T extends RpcSignaturesBase,
  TContext = {},
>(
  serverRpcRouter: ServerRpcRouterWithContext<T, TContext>,
  op: string,
  payload: object,
  context: TContext,
  showLog: boolean,
): Promise<object> {
  if (showLog) {
    console.log("[rpc]", op, payload);
  }
  const fn = serverRpcRouter[op];
  if (!fn) throw new Error(`rpc route ${op} not found`);
  return (await fn(payload, context)) ?? {};
}
