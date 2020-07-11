import { assertEquals } from "../deps.ts";

import { creator } from "./fuck.ts";

Deno.test("test starter function", (): void => {
  assertEquals(creator("fuck"), "deno: fuck");
});

Deno.test({
  name: "test starter function",
  fn(): void {
    assertEquals(creator("fuck"), "deno: fuck");
  },
});