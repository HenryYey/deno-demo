/**
 * http请求
 * deno run --allow-net=example.com https://deno.land/std/examples/curl.ts https://example.com
 */

/** 获取url参数 */
const url = Deno.args[0];

/** 请求url */
const res = await fetch(url);

/** 字符转化 */
const body = new Uint8Array(await res.arrayBuffer());

/** 异步 输出字符 */
await Deno.stdout.write(body);