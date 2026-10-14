const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateImages, parseTranscription } = require("../lib/processing.js");
const image = "data:image/jpeg;base64,/9j/2Q==";
const complete = (song) => ({
  status: "completed",
  output: [{ content: [{ type: "output_text", text: JSON.stringify(song) }] }],
});
test("acepta de una a tres imágenes JPEG", () =>
  assert.deepEqual(validateImages([image]), [image]));
test("rechaza entradas inválidas y contenido que simula un JPEG", () => {
  for (const value of [
    null,
    [],
    [image, image, image, image],
    ["data:image/jpeg;base64,SG9sYQ=="],
    [2],
  ])
    assert.throws(() => validateImages(value));
});
test("limita tamaño individual y total", () => {
  assert.throws(() => validateImages([image + "A".repeat(2_800_000)]));
  assert.throws(() =>
    validateImages(
      Array(3).fill("data:image/jpeg;base64,/9j/" + "A".repeat(2_100_000)),
    ),
  );
});
test("preserva letra y advertencias válidas", () => {
  const song = {
    title: "Canción",
    content: "Primera línea\n\nCoro",
    warnings: ["Fragmento ilegible"],
  };
  assert.deepEqual(parseTranscription(complete(song)), song);
});
test("rechaza respuestas incompletas, negativas o con esquema incorrecto", () => {
  for (const value of [
    null,
    { status: "incomplete" },
    { status: "completed", output: [{ content: [{ type: "refusal" }] }] },
    complete({ title: "X", content: "", warnings: [] }),
    complete({ title: "X", content: "Letra", warnings: [4] }),
    complete({ title: "X", content: "a".repeat(60001), warnings: [] }),
  ])
    assert.throws(() => parseTranscription(value));
});
