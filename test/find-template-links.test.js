const { test } = require("node:test");
const assert = require("node:assert/strict");
const { findTemplateLinks } = require("../links");

test("matches ES-style import", () => {
  const [link] = findTemplateLinks(
    '{{ import { renderInfo } from "./widgets/infobox/render-info.vto" }}'
  );
  assert.equal(link.path, "./widgets/infobox/render-info.vto");
});

test("matches include", () => {
  assert.equal(findTemplateLinks('{{ include "filename.vto" }}')[0].path, "filename.vto");
});

test("matches layout", () => {
  assert.equal(findTemplateLinks('{{ layout "./core/layout.vto" }}')[0].path, "./core/layout.vto");
});

test("matches single quotes", () => {
  assert.equal(findTemplateLinks("{{ include './f.vto' }}")[0].path, "./f.vto");
});

test("ignores other extensions", () => {
  assert.deepEqual(findTemplateLinks('{{ include "./x.html" }}'), []);
});

test("finds multiple links", () => {
  const text = '{{ include "a.vto" }} {{ layout "/b.vento" }}';
  assert.deepEqual(
    findTemplateLinks(text).map((l) => l.path),
    ["a.vto", "/b.vento"]
  );
});

test("offsets cover exactly the path without quotes", () => {
  const text = '{{ include "./p/a vto file.vto" }}';
  const [link] = findTemplateLinks(text);
  assert.equal(text.slice(link.start, link.end), "./p/a vto file.vto");
});
