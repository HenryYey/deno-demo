
# Deno初体验及实战入门

# 前言
最近学了一波Deno, 由于新东西 社区不完善，学的过程中都是翻英文文档和源码慢慢摸索，所以这里总结一些核心要点，帮助读者快速上手入门Deno，详细学习见官方手册

本文的代码例子见 https://github.com/HenryYey/deno-demo

# Deno是什么？
deno是一个默认安全运行环境的JS/Ts/WebAssembly runtime，是Node.js之父 `Ryan Dahl`开发的新项目,号称是node的替代品，于2020年5月13日正式发布。他的名字由node的字母重新拼接，意为 destory-node。

在node主宰前端的时代，作者为什么还要研发deno呢？因为，作者认为，node目前的发展已经违背了他的初衷，有许多无法解决的痛点，所以，他决定重新打造一个"升级版node"

# Node痛点
node最难以忍受的几个痛点如下
- 不安全、臃肿且难以管理的node_modules
- CommonJs与ES模块不兼容
- 本身功能不完整，需要外部工具来兼容typescript、babel、webpack...

# Deno新特性
其实对于我们开发者来说，Deno的大部分特性还是和Node一样。但是，也有一些新特性，下面是最核心的几个点:
- 底层语言不同，node使用C++, 而deno使用Rust
- 原生支持typescript,全局window,webAPI，fetch,异步返回promise等
- deno使用ESmodule，即不再使用npm安装包，并且没有package.json集中管理，而是直接通过URL加载
- 默认安全，需要授权才能读写文件、访问网络。

# Start
## 安装及环境配置
deno的安装十分简单(连windows都是一键)

macOS 和 Linux 系统上使用 shell:
```
curl -fsSL https://deno.land/x/install/install.sh | sh
```
Win系统上使用 PowerShell:
```
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

环境变量是安装后默认配好的。可以输入 `deno --version`来验证一下

接下来，我们在ide上装一下扩展插件就好了。
对于`VS Code`,安装`vscode_deno`

## hello world
命令行输入时，支持多参数、本地/网络url。具体见 deno --help

首先我们建一个 hello.ts文件，然后写入
```
console.log("hello,world");
```
在命令行输入 `deno run ./hello.ts`，可以看到控制台输出 hello,world 。即我们成功用deno运行了一个ts文件

## 包管理
包管理是deno的最大特点，我们可以直接通过本地/网络url来导入包，并且会在本地进行一个缓存。

例如:
```ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import { serve } from "https://deno.land/std@v0.30.0/http/server.ts"; // 指定版本
```
其实本质上还是一个upload资源->使用的过程，但是它没有node_modules+package.json，而是直接引入。这种方式个人认为有好有坏，虽然集中包管理会使各种包冗余，体积庞大，但是对于开发者来讲，能方便的阅读、编码和进行版本管理，并且不用担心网络依赖被墙、被黑等。。但是既然做了，肯定是作者认为这种方式更好，所以我们就期待真香把！

建议，创建一个文件来集中管理deps
```ts
// deps.ts
export * from "https://deno.land/std@v0.57.0/testing/asserts.ts";
export * from "https://deno.land/x/oak/mod.ts";

// hello.ts 使用
import { Application, Router } from "../deps.ts";

```

## 安全权限
deno的核心特性是需要授权才可以进行读写操作、网络通信。

在官网给的例子中，有这样一个读文件的程序:
```ts
const filenames = Deno.args;
for (const filename of filenames) {
  const file = await Deno.open(filename);
  await Deno.copy(file, Deno.stdout);
  file.close();
}
```
我们运行一下, 会发现报了个错，即无权限:
```
deno run https://deno.land/std/examples/cat.ts ./fuck.ts
```
此时，我们启动时赋予读权限，即可正常完成输出
```
deno run --allow-read https://deno.land/std/examples/cat.ts ./fuck.ts
```
可授权参数如下:

`-A, --allow-all` 赋予所有权限

`--allow-env` 允许读写环境变量

`--allow-net=\<allow-net>` 允许对指定域名网络通信

`--allow-plugin` 允许加载插件

`--allow-read=\<allow-read>` 授权指定文件读权限

`--allow-write=\<allow-write>` 写权限

`--allow-run` 允许运行子进程。 请注意，子流程未在沙箱中运行，因此没有与deno流程相同的安全限制。 

`--allow-hrtime` (不了解，直接贴原文吧) Allow high resolution time measurement. High resolution time can be used in timing attacks and fingerprinting.

## Http server
与node相似，我们可以很简易的就搭建一个服务器

```ts
import { serve } from "https://deno.land/std@v0.50.0/http/server.ts";

const PORT = 8080;
const s = serve({ port: PORT });

console.log(` Listening on http://localhost:${PORT}/`);

for await (const req of s) {
  req.respond({ body: "fuck\n" });
}
```
运行并赋予网络权限: `deno run --allow-net ./server.ts`,此时我们在浏览器输入`http://localhost:8080`,即可看到一个fuck。。

# 实战
以上是最简单最基础的一个流程，接下来，我们可以研究一下如何在实战项目中使用

## 框架--oak

node有koa，对应的deno有oak，用法和特点都十分相似，都是洋葱圈式的中间件框架，甚至连名字都差不多。。目前也是stars最多的一个项目

下面是一个五脏俱全的用例

```ts
import { Application, Router } from "https://deno.land/std@v0.57.0/testing/asserts.ts";

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
```

## 调试
Deno支持V8 Inspector Protocol，即我们可以使用Chrome Devtools或VsCode来对程序进行调试，由于许多工具插件仍在开发中，所以这里我们手动配置一下`lanuch.json`在VsCode中进行调试
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Deno",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "deno",
      "runtimeArgs": ["run", "--inspect-brk", "-A", "fuck.ts"],
      "port": 8080
    }
  ]
}
```

# 总结
详细学习并且入门实践后，体验还行。好感是原生支持ts和一些需要配置的东西，更安全了，并且没有了node_modules，轻了好多。负面的也有，就是目前生态和社区不完善，只能做做玩具，一些隐藏的风险也没有发现，网络依赖也有可能会被墙

个人认为，当deno持续发展，加上持续集成、单元测试，项目迭代等等一整套真正工程化以后，怕是最后还是需要npm或另一种管理包工具。如果只是做一点玩具，用不用区别不大，但是Deno的核心思想，解决冗余的包管理/保证运行安全 是值得我们学习的(发现轮子不行就造更好的轮子。。)

期待并看好Deno的未来，毕竟Node的这十年，逐步发展，引领前端行业到了一个新高度，不再是切图仔。Deno最终能否替代Node需要时间来证明。