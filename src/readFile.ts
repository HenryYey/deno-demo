/**
 * 读取文件
 * deno run --allow-read https://deno.land/std/examples/cat.ts ./hello.ts ./fuck.ts
 */
const filenames = Deno.args;
for (const filename of filenames) {
  const file = await Deno.open(filename);
  await Deno.copy(file, Deno.stdout);
  file.close();
}