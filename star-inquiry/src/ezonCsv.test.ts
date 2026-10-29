import assert from "node:assert/strict";
import test from "node:test";
import { exportCsv, validateRun, type Run } from "./domain";
import { ezonTimeSeconds, parseEzOnCsv, parseMeasurementCsv } from "./ezonCsv";

const download = (rows: string[], header = "수집시간,센서 1") =>
  "﻿" + [header, ...rows].join("\n");

test("EZ-ON clock times become elapsed seconds from the first row", () => {
  const parsed = parseEzOnCsv(
    download(["23:03:33.374,12", "23:03:33.474,80", "23:03:33.574,79"]),
  );
  assert.deepEqual(
    parsed.samples.map((s) => [s.t, s.raw]),
    [
      [0, 12],
      [0.1, 80],
      [0.2, 79],
    ],
  );
  assert.equal(parsed.mode, "serial");
  assert.equal(parsed.metadata?.linear, false);
  assert.equal(parsed.sensorColumn, "센서 1");
  assert.deepEqual(parsed.errors, []);
});

test("EZ-ON time formats, midnight crossing and zero-based durations", () => {
  assert.equal(ezonTimeSeconds("00:00:01.250"), 1.25);
  assert.equal(ezonTimeSeconds("03:33.5"), 213.5);
  const dated = ezonTimeSeconds("2026-10-29 10:00:00.100")!;
  assert.equal(
    Math.round((dated - ezonTimeSeconds("2026-10-29 10:00:00")!) * 1000),
    100,
  );
  assert.equal(ezonTimeSeconds("12:61:00"), null);
  assert.equal(ezonTimeSeconds("abc"), null);
  const wrapped = parseEzOnCsv(download(["23:59:59.900,5", "00:00:00.100,6"]));
  assert.deepEqual(
    wrapped.samples.map((s) => s.t),
    [0, 0.2],
  );
});

test("EZ-ON missing values stay missing and unreadable times are reported", () => {
  const parsed = parseEzOnCsv(
    download([
      "10:00:00.000,5",
      "10:00:00.100,",
      "엉뚱한 값,7",
      "10:00:00.300,x",
    ]),
  );
  assert.deepEqual(
    parsed.samples.map((s) => s.raw),
    [5, null, null],
  );
  assert.equal(parsed.errors.length, 3);
});

test("EZ-ON multi-sensor files pick the first sensor column and list the others", () => {
  const wide = parseEzOnCsv(
    download(
      ["1,10:00:00.000,1,2", "2,10:00:00.100,3,4"],
      "No.,수집시간,센서 1,센서 2",
    ),
  );
  assert.deepEqual(wide.sensorColumns, ["센서 1", "센서 2"]);
  assert.deepEqual(
    wide.samples.map((s) => s.raw),
    [1, 3],
  );
});

test("a file without a time column is rejected instead of guessed", () => {
  const parsed = parseEzOnCsv("센서 1\n5\n6\n");
  assert.equal(parsed.samples.length, 0);
  assert.match(parsed.errors[0], /수집시간/);
});

test("measurement import routes app CSV and EZ-ON downloads, keeping sensor provenance", () => {
  const ezon = parseMeasurementCsv(
    download(["10:00:00.000,40", "10:00:01.000,10"]),
  );
  assert.equal(ezon.mode, "serial");
  const run: Run = {
    id: "r",
    name: "이지온 1회",
    repeat: 1,
    mode: "serial",
    samples: ezon.samples,
    ambient: 2,
    startDistance: 20,
    linear: false,
    unit: "센서 원시값",
  };
  assert.equal(validateRun(run), true);
  const again = parseMeasurementCsv(exportCsv(run));
  assert.equal(again.mode, "serial");
  assert.deepEqual(
    again.samples.map((s) => s.raw),
    [40, 10],
  );
  assert.equal(parseMeasurementCsv("time,raw\n0,5\n").mode, "manual");
});
