/**
 * oka框架，类似于koa
 * deno run --allow-net ./app.ts
 */

import { Application, Router } from "../deps.ts";

const app = new Application();
const router = new Router();
const port: number = 8080;

// Logger
app.use(async (ctx: any, next: any) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});


router.get("/", ({ response }: { response: any }) => {
  response.body = {
    message: "hello world",
  };
});
app.use(router.routes());
app.use(router.allowedMethods());

console.log('running on port ', port);
await app.listen({ port });