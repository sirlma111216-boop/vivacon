import type { Run } from "./domain";

/** Read defaults only when a new run is created; never mutate saved runs. */
export function measurementSetup(
  notes: Record<string, string>,
  mode: Run["mode"],
) {
  const speeds = [0, 1, 2].flatMap((i) => {
    const distance = Number(notes[`speedDistance${i}`]);
    const time = Number(notes[`speedTime${i}`]);
    return Number.isFinite(distance) &&
      distance > 0 &&
      Number.isFinite(time) &&
      time > 0 &&
      Number.isFinite(distance / time)
      ? [distance / time]
      : [];
  });
  const measuredSpeed = speeds.length
    ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
    : undefined;
  return {
    ambient: Number(notes.ambient ?? "0"),
    startDistance: Number(
      notes.startDistance ?? notes["design.startDistance"] ?? "20",
    ),
    interval: Number(
      notes.measureInterval ?? notes["design.interval"] ?? "0.2",
    ),
    // The EZ-ON block range (0~100 or 0~1023) is the highest value the sensor can report.
    saturation: { "100": 100, "1023": 1023 }[notes["ezon.range"] ?? ""] as
      number | undefined,
    speed:
      mode === "practice"
        ? 12
        : notes.uniform === "true"
          ? measuredSpeed
          : undefined,
  };
}
