import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("standalone 561.group imports only the real upstream TUFTE/LivingWebServer Fetch API",()=>{
  const pkg=JSON.parse(read("package.json"));
  const pin=pkg.dependencies["@red-cup-engineering/living-web-server"];
  assert.equal(pin,"git+https://github.com/red-cup-engineering/living-web-server.git#9e6d657fda9df3bd50744294eb3bbd1412b854ad");
  assert.equal(pkg.dependencies["@red-cup-engineering/l-space"],undefined);
  assert.equal(pkg.dependencies["@red-cup-engineering/computer-web-server"],undefined);
  assert.ok(read("src/living-home.mjs").includes('from "@red-cup-engineering/living-web-server/fetch"'));
  assert.ok(read("src/living-home.mjs").includes("createLivingWebServer({"));
  assert.ok(!read("src/living-home.mjs").includes("createTufteApplication"));
  assert.ok(pkg.scripts.test.includes("node --test test/native-home.test.mjs"));
});
