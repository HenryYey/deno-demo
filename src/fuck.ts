/** 一个ts文件，运行: deno run ./fuck.ts */
export const creator = (str: string): string => {
  return `deno: ${str}`;
}

console.log(creator("fuck"));