/**
 * deno读取参数
 * deno run ./scriptArgs.ts --allow-net fuck
 */

console.log(Deno.args); // [ "--allow-net", "fuck" ]