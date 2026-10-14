const { test } = require("node:test");
const assert = require("node:assert/strict");
const { nextUsage } = require("../lib/usage.js");
const now = Date.parse("2026-10-13T12:30:00Z");
test("reserva solicitudes y exige diez segundos entre intentos", () => {
  const first = nextUsage(undefined, now);
  assert.equal(first.daily, 1);
  assert.throws(() => nextUsage(first, now + 9999));
  assert.equal(nextUsage(first, now + 10000).daily, 2);
});
test("rechaza cuotas horarias y diarias agotadas", () => {
  const initial = nextUsage(undefined, now);
  assert.throws(() => nextUsage({ ...initial, hourly: 10 }, now + 10000));
  assert.throws(() => nextUsage({ ...initial, daily: 30 }, now + 10000));
});
test("reinicia los contadores en la hora o día UTC correspondiente", () => {
  const previous = { ...nextUsage(undefined, now), hourly: 10, daily: 20 };
  const nextHour = nextUsage(previous, now + 3600000);
  assert.equal(nextHour.hourly, 1);
  assert.equal(nextHour.daily, 21);
  assert.equal(nextUsage(previous, now + 86400000).daily, 1);
});
