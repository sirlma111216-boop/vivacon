import assert from "node:assert/strict";
import test from "node:test";
import { measurementSetup } from "./measurementSetup";

test("new measurement defaults carry the plan while explicit setup takes precedence", () => {
  const notes = { "design.startDistance": "30", "design.interval": "0.1" };
  const before = { ...notes };
  assert.deepEqual(measurementSetup(notes, "manual"), {
    ambient: 0,
    startDistance: 30,
    interval: 0.1,
    speed: undefined,
  });
  assert.equal(
    measurementSetup({ ...notes, startDistance: "40" }, "manual").startDistance,
    40,
  );
  assert.deepEqual(notes, before);
});

test("a new real run uses measured speed only for an explicitly selected constant-speed interval", () => {
  const readings = {
    speedDistance0: "60",
    speedTime0: "5",
    speedDistance1: "72",
    speedTime1: "6",
    speedDistance2: "10",
    speedTime2: "0",
    motorSpeed: "255",
  };
  assert.equal(measurementSetup(readings, "serial").speed, undefined);
  assert.equal(
    measurementSetup({ ...readings, uniform: "true" }, "serial").speed,
    12,
  );
  assert.equal(
    measurementSetup({ uniform: "true", motorSpeed: "255" }, "serial").speed,
    undefined,
  );
});

test("invalid planned values stay invalid for the form validator instead of becoming plausible defaults", () => {
  assert.equal(
    measurementSetup({ "design.startDistance": "0" }, "manual").startDistance,
    0,
  );
  assert.ok(
    Number.isNaN(
      measurementSetup({ "design.interval": "bad" }, "manual").interval,
    ),
  );
});
