# chibi_rpc

Type first minimal RPC library for Deno.

##  Usage

The instruction here is assuming it to be used with Fresh.  
Change the POST endpoint part if you use this with other framework.

### Add import mapping

deno.json

```json
"imports":{
  "chibi_rpc": "https://deno.land/x/chibi_rpc/mod.ts",
}
```

First, set import map entry. This is not required but recommended.


### Rpc call signature definition

rpc_types.ts
```ts
export type RpcSignatures = {
  greet: ({ message: string }) => Promise<{ resMessage: string }>;
}
```

Define a type for rpc functions set.  
Each function for rpc call takes one object argument and returns a promise object.

### Server rpc router

rpc_router.ts
```ts
import { ServerRpcRouter } from "chibi_rpc/types.ts";

export const appRpcRouter: ServerRpcRouter<
  AppRpcSignatures
> = {
  async greet({ message }) {
    console.log("greet", message);
    return { resMessage: message + " world " };
  },
}
```

Provide a server handler satisfying the rpc signature.

### Post handler

routes/api/rpc/[op].ts
```ts
import { handleServerRpc } from "chibi_rpc/server.ts";

export const handler = {
  POST: (async (req, ctx) => {
    const op = ctx.params.op;
    const buf = await req.arrayBuffer();
    const text = new TextDecoder().decode(buf);
    const payload = await JSON.parse(text);
    const result = await handleServerRpc(
      appRpcRouter,
      op,
      payload,
      {},
      false
    );
    return Response.json(result);
  }
);
```

Create post endpoint.

## Client instance

```ts
import { createRpcClient } from "chibi_rpc/client.ts";

export const rpcClient = createRpcClient<AppRpcSignatures>("/api/rpc");
```

Create client instance.  
This rpc client instance is referenced from anywhere within frontend code.

## Invoke it

```ts
const res = await rpcClient.greet({ message: "hello" });
console.log(res);   //hello world
```

That's all. Have a nice development!


## License
MIT


