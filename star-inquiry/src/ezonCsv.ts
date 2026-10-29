import { parseCsv, readCsvRows, uid, type CsvResult } from "./domain";

/**
 * EZ-ON "데이터 다운로드" writes a UTF-8 CSV with a BOM: a time column
 * (default header 수집시간) followed by one column per sensor (센서 1, …).
 * Time cells follow the table's display format: HH:mm:ss.SSS by default,
 * or mm:ss(.SSS), HH:mm:ss or yyyy-MM-dd HH:mm:ss(.SSS), and an elapsed
 * duration such as 00:00:01.200 when the zero-based option is on.
 */
export interface EzOnCsvResult extends CsvResult {
  sensorColumns: string[];
  sensorColumn: string;
}

const TIME_HEADER = /수집\s*시간|^시간|^time/i;
const APP_RAW_HEADERS = ["raw", "value", "brightness", "센서 원시값", "측정값"];
const DAY = 86400;

/** Seconds since midnight (or since the epoch day for dated cells); plain numbers are seconds. */
export function ezonTimeSeconds(cell: string): number | null {
  const text = cell.trim();
  if (/^\d+(?:\.\d+)?$/.test(text)) return Number(text);
  const match =
    /^(?:(\d{4})-(\d{2})-(\d{2})[ T])?(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2}(?:\.\d+)?)$/.exec(
      text,
    );
  if (!match) return null;
  const [, year, month, date, hours, minutes, seconds] = match;
  if (Number(minutes) >= 60 || Number(seconds) >= 60) return null;
  const day = year ? Date.UTC(+year, +month - 1, +date) / 1000 : 0;
  const value =
    day + Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds);
  return Number.isFinite(value) ? value : null;
}

export function parseEzOnCsv(text: string): EzOnCsvResult {
  const errors: string[] = [];
  const empty = (message: string): EzOnCsvResult => ({
    samples: [],
    errors: [message],
    sensorColumns: [],
    sensorColumn: "",
  });
  let rows: string[][];
  try {
    rows = readCsvRows(text);
  } catch (error) {
    return empty(String((error as Error).message));
  }
  if (rows.length < 2)
    return empty("열 제목과 한 줄 이상의 수집 기록이 필요합니다.");
  const headers = rows.shift()!.map((v) => v.trim());
  // Extra sensor values can be wider than the header row; give them positional names.
  const width = Math.max(headers.length, ...rows.map((row) => row.length));
  for (let i = headers.length; i < width; i++) headers.push(`열 ${i + 1}`);
  const timeCol = headers.findIndex((h) => TIME_HEADER.test(h));
  if (timeCol < 0)
    return empty(
      "‘수집시간’ 열을 찾지 못했습니다. 이지온에서 내려받은 파일을 그대로 선택하세요.",
    );
  const sensors = headers
    .map((name, index) => ({ name, index }))
    .filter(
      ({ name, index }) => index !== timeCol && !/^(no\.?|번호)$/i.test(name),
    );
  const sensor = sensors.find(({ name }) => /센서/.test(name)) ?? sensors[0];
  if (!sensor) return empty("센서값 열이 없습니다.");
  const importId = uid();
  const timed: { t: number; raw: number | null; index: number }[] = [];
  let previous: number | null = null,
    offset = 0;
  for (const [index, row] of rows.entries()) {
    if (timed.length >= 100000) {
      errors.push("최대 100,000행까지만 불러왔습니다.");
      break;
    }
    const clock = ezonTimeSeconds(row[timeCol] ?? "");
    if (clock === null) {
      errors.push(
        `${index + 2}행: 수집시간을 읽을 수 없어 불러오지 않았습니다.`,
      );
      continue;
    }
    // A clock that jumps back by more than half a day crossed midnight.
    if (previous !== null && clock + offset < previous - DAY / 2) offset += DAY;
    previous = clock + offset;
    const cell = (row[sensor.index] ?? "").trim();
    const raw =
      cell !== "" && Number.isFinite(Number(cell)) ? Number(cell) : null;
    if (raw === null)
      errors.push(`${index + 2}행: 센서값 누락/오류를 빈 값으로 보존했습니다.`);
    timed.push({ t: previous, raw, index });
  }
  if (!timed.length)
    return {
      ...empty(""),
      errors: [...errors, "읽을 수 있는 수집 기록이 없습니다."],
    };
  const ordered = [...timed].sort((a, b) => a.t - b.t || a.index - b.index);
  if (ordered.some((v, i) => v !== timed[i]))
    errors.push("수집시간 순서로 다시 정렬했습니다.");
  const start = ordered[0].t;
  return {
    samples: ordered.map(({ t, raw, index }) => ({
      id: `${importId}-${index}`,
      // Millisecond cells; rounding removes floating-point noise from subtraction.
      t: Math.round((t - start) * 1000) / 1000,
      raw,
    })),
    errors,
    mode: "serial",
    metadata: { unit: "센서 원시값", linear: false },
    sensorColumns: sensors.map(({ name }) => name),
    sensorColumn: sensor.name,
  };
}

/** Files saved by this app keep a raw column; anything else is read as an EZ-ON download. */
export function parseMeasurementCsv(text: string): CsvResult & {
  sensorColumns?: string[];
  sensorColumn?: string;
} {
  let headers: string[] = [];
  try {
    headers = (readCsvRows(text)[0] ?? []).map((v) => v.trim().toLowerCase());
  } catch {
    /* parseCsv reports the quoting error. */
  }
  return headers.some((h) => APP_RAW_HEADERS.includes(h))
    ? parseCsv(text)
    : parseEzOnCsv(text);
}
