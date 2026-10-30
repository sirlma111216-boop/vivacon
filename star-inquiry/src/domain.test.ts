import test from "node:test";
import assert from "node:assert/strict";
import {
  corrected,
  distanceFor,
  validSamples,
  normalize,
  magnitudeDelta,
  createPracticeRun,
  parseCsv,
  exportCsv,
  validateBackup,
  validateRun,
  canConvertMagnitude,
  type Run,
} from "./domain";

const baseRun = (): Run => ({
  id: "r",
  name: "테스트",
  repeat: 1,
  mode: "manual",
  samples: [],
  ambient: 10,
  startDistance: 20,
  linear: false,
  unit: "센서 원시값",
});

test("raw readings remain unchanged and nonpositive corrected values are excluded without clamping", () => {
  const run = baseRun();
  run.samples = [
    { id: "a", t: 0, raw: 9 },
    { id: "b", t: 1, raw: 10 },
    { id: "c", t: 2, raw: 11 },
  ];
  assert.equal(corrected(run.samples[0], run), -1);
  assert.equal(corrected(run.samples[1], run), 0);
  assert.deepEqual(
    validSamples(run).map((s) => s.id),
    ["c"],
  );
  assert.deepEqual(
    run.samples.map((s) => s.raw),
    [9, 10, 11],
  );
});

test("null, saturation flags, saturation threshold, and manual exclusions are respected", () => {
  const run = baseRun();
  run.saturation = 100;
  run.samples = [
    { id: "missing", t: 0, raw: null },
    { id: "threshold", t: 1, raw: 100 },
    { id: "flag", t: 2, raw: 50, saturated: true },
    { id: "excluded", t: 3, raw: 80, excluded: "가속 구간" },
    { id: "ok", t: 4, raw: 90 },
  ];
  assert.deepEqual(
    validSamples(run).map((s) => s.id),
    ["ok"],
  );
});

test("time cannot become distance without measured speed AND an explicit starting instant", () => {
  const run = baseRun();
  const sample = { id: "a", t: 2, raw: 100 };
  assert.equal(distanceFor(sample, run), null);
  run.speed = 10;
  assert.equal(distanceFor(sample, run), null);
  run.startTime = 1;
  assert.equal(distanceFor(sample, run), 30);
  assert.equal(distanceFor({ ...sample, t: 0.5 }, run), null);
  assert.equal(distanceFor({ ...sample, distance: 50 }, baseRun()), 50);
  assert.equal(distanceFor({ ...sample, distance: 0 }, run), null);
  run.speed = 0;
  assert.equal(distanceFor(sample, run), null);
  run.speed = -5;
  assert.equal(distanceFor(sample, run), null);
  run.speed = 10;
  run.startTime = -1;
  assert.equal(distanceFor(sample, run), null);
});

test("inverse-square normalization uses chosen valid reference and never evaluates at r=0", () => {
  const run = baseRun();
  run.samples = [
    { id: "a", t: 0, raw: 110, distance: 20 },
    { id: "b", t: 1, raw: 35, distance: 40 },
    { id: "c", t: 2, raw: 11, distance: 200 },
    { id: "zero", t: 3, raw: 20, distance: 0 },
  ];
  const normalized = normalize(run, "a");
  assert.deepEqual(
    normalized.map((p) => p.relative),
    [1, 0.25, 0.01],
  );
  assert.deepEqual(
    normalized.map((p) => p.theory),
    [1, 0.25, 0.010000000000000002],
  );
  assert.deepEqual(
    normalized.map((p) => p.deltaMagnitude),
    [null, null, null],
  );
  assert.deepEqual(normalize(run, "zero"), []);
  assert.deepEqual(normalize(run, "missing"), []);
});

test("magnitude change is +5 for 1/100 and -5 for 100; unknown sensor linearity stays gated", () => {
  assert.equal(magnitudeDelta(1, 100), 5);
  assert.equal(magnitudeDelta(100, 1), -5);
  assert.equal(magnitudeDelta(1, 1), 0);
  assert.equal(magnitudeDelta(0, 100), null);
  assert.equal(magnitudeDelta(-1, 100), null);
  assert.equal(magnitudeDelta(Infinity, 100), null);
  assert.equal(magnitudeDelta(1, NaN), null);
  const run = baseRun();
  run.linear = true;
  assert.equal(canConvertMagnitude(run), false);
  run.unit = "lx";
  assert.equal(canConvertMagnitude(run), true);
  run.linear = false;
  assert.equal(canConvertMagnitude(run), false);
});

test("practice data is deterministic in values, separately identified, and labeled in CSV", () => {
  const a = createPracticeRun(),
    b = createPracticeRun();
  assert.equal(a.mode, "practice");
  assert.notEqual(a.id, b.id);
  assert.deepEqual(
    a.samples.map((s) => s.raw),
    b.samples.map((s) => s.raw),
  );
  assert.match(exportCsv(a), /연습 데이터/);
  const restored = parseCsv(exportCsv(a));
  assert.deepEqual(restored.errors, []);
  assert.equal(restored.mode, "practice");
  assert.equal(restored.metadata?.ambient, a.ambient);
  assert.equal(restored.metadata?.startTime, a.startTime);
  assert.deepEqual(
    restored.samples.map((s) => s.raw),
    a.samples.map((s) => s.raw),
  );
  assert.deepEqual(
    restored.samples.map((s) => s.excluded),
    a.samples.map((s) => s.excluded),
  );
});

test("CSV round trip supports commas, escaped quotes, newlines, nulls, and exclusions", () => {
  const run = baseRun();
  run.name = '모둠 "A", 실험\n2';
  run.samples = [
    { id: "a", t: 0, raw: 100, distance: 20, excluded: "방향, 변화\n확인" },
    { id: "b", t: 1, raw: null },
  ];
  const csv = exportCsv(run),
    parsed = parseCsv(csv);
  assert.equal(parsed.metadata?.name, run.name);
  assert.equal(parsed.samples[0].excluded, run.samples[0].excluded);
  assert.equal(parsed.samples[1].raw, null);
  assert.equal(parsed.samples.length, 2);
  assert.equal(parsed.mode, "manual");
  assert.equal(parsed.metadata?.linear, false);
});

test("CSV invalid numbers do not become plausible readings or zero distances", () => {
  const result = parseCsv(
    "time_s,raw,distance_cm\n0,,20\n1,NaN,30\n2,40,0\n3,50,-3\nwrong,5,40\n4,60,50",
  );
  assert.deepEqual(
    result.samples.map((s) => s.raw),
    [null, null, 60],
  );
  assert.equal(result.errors.length, 5);
  assert.deepEqual(parseCsv("x,y\n1,2").samples, []);
  assert.deepEqual(parseCsv('time_s,raw\n0,"oops').samples, []);
});

test("CSV imports have unique sample IDs and reject conflicting run calibration", () => {
  const imported = parseCsv(
    "id,time_s,raw,distance_cm\nsame,0,20,20\nsame,1,30,30",
  );
  assert.equal(new Set(imported.samples.map((s) => s.id)).size, 2);
  assert.equal(
    parseCsv("time_s,raw,ambient\n0,20,10\n1,30,15").samples.length,
    0,
  );
  assert.equal(
    parseCsv("time_s,raw,ambient\n0,20,oops\n1,30,oops").samples.length,
    0,
  );
  assert.equal(
    parseCsv("time_s,raw,ambient\n0,20,\n1,30,15").metadata?.ambient,
    15,
  );
});

test("normalized measurements preserve breaks across missing and excluded source rows", () => {
  const run = baseRun();
  run.samples = [
    { id: "a", t: 0, raw: 110, distance: 20 },
    { id: "b", t: 1, raw: null, distance: 30 },
    { id: "c", t: 2, raw: 35, distance: 40 },
    { id: "d", t: 3, raw: 30, distance: 50, excluded: "방향 흔들림" },
    { id: "e", t: 4, raw: 20, distance: 60 },
    { id: "f", t: 5, raw: 18, distance: 70 },
  ];
  const points = normalize(run, "a");
  assert.deepEqual(
    points.map((p) => [p.id, !!p.gapBefore]),
    [
      ["a", false],
      ["c", true],
      ["e", true],
      ["f", false],
    ],
  );
  assert.equal(run.samples.length, 6);
});

test("backup retains exact original CSV including rejected rows and bounds its UTF-8 size", () => {
  const originalCsv =
    "\uFEFFtime_s,raw,distance_cm\r\n0,100,20\r\nwrong,missing,0\r\n";
  const run = { ...baseRun(), originalCsv };
  assert.equal(validateRun(run), true);
  assert.equal(JSON.parse(JSON.stringify(run)).originalCsv, originalCsv);
  assert.equal(validateRun({ ...run, originalCsv: 123 }), false);
  assert.equal(
    validateRun({ ...run, originalCsv: "가".repeat(3_333_334) }),
    false,
  );
});

test("exported teacher text cannot become a spreadsheet formula", () => {
  const run = baseRun();
  run.name = '=HYPERLINK("x")';
  run.samples = [{ id: "a", t: 0, raw: -5, excluded: "+SUM(A1)" }];
  const exported = exportCsv(run);
  assert.ok(exported.includes("'+SUM(A1)"));
  assert.ok(exported.includes("'=HYPERLINK"));
  assert.equal(parseCsv(exported).samples[0].raw, -5);
});

const backup = () => ({
  version: 1,
  lesson: 3,
  step: 0,
  home: true,
  notes: { name: "모둠" },
  prediction: null,
  predictions: [],
  runs: [baseRun()],
  activeRunId: "r",
  completed: [],
  fontSize: "normal",
  mode: "manual",
  reveal: false,
});
test("backup rejects nonfinite values, duplicate IDs and malformed state; preserves original prediction separately", () => {
  const original = backup();
  assert.equal(validateBackup(JSON.parse(JSON.stringify(original))), true);
  assert.equal(validateBackup({ ...original, notes: { a: 2 } }), false);
  assert.equal(validateBackup({ ...original, step: 20 }), false);
  assert.equal(validateBackup({ ...original, lesson: 3, step: 5, completed: ["3-5"] }), true);
  assert.equal(validateBackup({ ...original, lesson: 4, step: 5 }), true);
  assert.equal(validateBackup({ ...original, completed: ["4-5"] }), true);
  assert.equal(
    validateBackup({ ...original, runs: [{ ...baseRun(), ambient: NaN }] }),
    false,
  );
  assert.equal(
    validateBackup({ ...original, runs: [baseRun(), baseRun()] }),
    false,
  );
  assert.equal(
    validateBackup({
      ...original,
      prediction: { points: [{ x: Infinity, y: 1 }] },
    }),
    false,
  );
  assert.equal(
    validateBackup({
      ...original,
      predictions: [
        {
          author: "학생",
          reason: "이유",
          points: "invalid",
          savedAt: "2026-10-28",
        },
      ],
    }),
    false,
  );
  assert.equal(
    validateBackup({ ...original, activeRunId: "not-a-run" }),
    false,
  );
  assert.equal(
    validateRun({ ...baseRun(), samples: [{ id: "a", t: 0, raw: "10" }] }),
    false,
  );
});

test("JSON backup round trip preserves first prediction independently of observation and reflection", () => {
  const prediction = {
    author: "별빛1",
    reason: "일정한 비율로 어두워질 것 같다.",
    points: [
      { x: 1, y: 100 },
      { x: 2, y: 50 },
    ],
    savedAt: "2026-10-28T03:00:00.000Z",
  };
  const state = {
    ...backup(),
    prediction,
    predictions: [prediction],
    notes: {
      observation: "그래프가 굽었다.",
      reflection: "제곱 관계로 설명한다.",
    },
  };
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(validateBackup(restored), true);
  assert.equal(restored.prediction.reason, prediction.reason);
  assert.equal(restored.notes.observation, state.notes.observation);
  assert.notEqual(restored.prediction.reason, restored.notes.reflection);
  assert.equal(
    validateBackup({
      ...restored,
      prediction: {
        ...prediction,
        points: [
          { x: 0, y: 100 },
          { x: 2, y: 50 },
        ],
      },
    }),
    false,
  );
});
