/** Scientific calculations preserve source readings; invalid data is never repaired. */
export interface Sample {
  id: string;
  t: number;
  raw: number | null;
  distance?: number;
  excluded?: string;
  saturated?: boolean;
}

export interface Run {
  id: string;
  name: string;
  repeat: number;
  mode: 'practice' | 'manual' | 'serial';
  samples: Sample[];
  ambient: number;
  startDistance: number;
  speed?: number;
  startTime?: number;
  linear: boolean;
  unit: string;
  saturation?: number;
  /** Exact uploaded source text, including rows rejected by the numeric importer. */
  originalCsv?: string;
}

export interface NormalizedPoint {
  id: string;
  distance: number;
  relative: number;
  theory: number;
  deltaMagnitude: number | null;
  /** An excluded/missing/invalid source row separates this point from the preceding point. */
  gapBefore?: boolean;
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Includes zero and negative corrected values for display; validity is a separate decision. */
export function corrected(sample: Sample, run: Run): number | null {
  if (!finite(sample.raw) || !finite(run.ambient)) return null;
  const value = sample.raw - run.ambient;
  return finite(value) ? value : null;
}

export function isSaturated(sample: Sample, run: Run): boolean {
  return sample.saturated === true || (finite(sample.raw) && finite(run.saturation) && sample.raw >= run.saturation);
}

export function invalidReason(sample: Sample, run: Run): string | null {
  if (sample.excluded) return `분석 제외: ${sample.excluded}`;
  if (!finite(sample.raw)) return '누락 또는 잘못된 측정값';
  if (isSaturated(sample, run)) return '센서 포화';
  const value = corrected(sample, run);
  if (value === null) return '잘못된 주변광 보정';
  if (value <= 0) return '보정 후 0 이하 — 비·등급 계산 불가';
  return null;
}

/** Explicit measured distances win. No motor setting or time alone is treated as speed. */
export function distanceFor(sample: Sample, run: Run): number | null {
  if (sample.distance !== undefined) return positive(sample.distance) ? sample.distance : null;
  if (!positive(run.speed) || !positive(run.startDistance) || !finite(run.startTime) || run.startTime < 0 || !finite(sample.t)) return null;
  const elapsed = sample.t - run.startTime;
  if (elapsed < 0) return null;
  const distance = run.startDistance + run.speed * elapsed;
  return positive(distance) ? distance : null;
}

export function validSamples(run: Run): Sample[] {
  return run.samples.filter(sample => invalidReason(sample, run) === null);
}

export function magnitudeDelta(brightness: number, reference: number): number | null {
  if (!positive(brightness) || !positive(reference)) return null;
  // Subtract logarithms so extreme valid inputs cannot overflow their ratio.
  const delta = -2.5 * (Math.log10(brightness) - Math.log10(reference));
  return finite(delta) ? (Object.is(delta, -0) ? 0 : delta) : null;
}

export function canConvertMagnitude(run: Run): boolean {
  return run.linear && ['lx', 'lux', 'W/m²', 'W/m2', '상대 밝기', 'relative', 'a.u.'].includes(run.unit.trim());
}

export function normalize(run: Run, referenceId: string): NormalizedPoint[] {
  const valid = validSamples(run);
  const reference = valid.find(sample => sample.id === referenceId);
  if (!reference) return [];
  const base = corrected(reference, run);
  const baseDistance = distanceFor(reference, run);
  if (!positive(base) || !positive(baseDistance)) return [];
  let previousSourceIndex = -1;
  const points: NormalizedPoint[] = [];
  run.samples.forEach((sample, sourceIndex) => {
    if (invalidReason(sample, run) !== null) return;
    const value = corrected(sample, run);
    const distance = distanceFor(sample, run);
    if (!positive(value) || !positive(distance)) return;
    const relative = value / base;
    const theory = (baseDistance / distance) ** 2;
    if (!positive(relative) || !positive(theory)) return;
    points.push({ id: sample.id, distance, relative, theory,
      deltaMagnitude: canConvertMagnitude(run) ? magnitudeDelta(value, base) : null,
      ...(previousSourceIndex >= 0 && sourceIndex - previousSourceIndex > 1 ? { gapBefore: true } : {}) });
    previousSourceIndex = sourceIndex;
  });
  return points;
}

export function createPracticeRun(): Run {
  const id = uid();
  const ambient = 12;
  return {
    id, name: '연습 데이터 · 멀어지는 LED', repeat: 1, mode: 'practice',
    ambient, startDistance: 20, speed: 10, startTime: 1,
    linear: true, unit: '상대 밝기', saturation: 1023,
    samples: Array.from({ length: 41 }, (_, i) => {
      const t = i / 4;
      const distance = 20 + Math.max(0, t - 1) * 10;
      const signal = 800 * (20 / distance) ** 2;
      // Deterministic simulated scatter; these are not measurements from a sensor.
      const noise = 1 + 0.035 * Math.sin(i * 1.7) + 0.012 * Math.cos(i * 0.6);
      return { id: `${id}-${i}`, t, raw: Math.round((ambient + signal * noise) * 100) / 100,
        ...(t < 1 ? { excluded: '출발 전 대기 구간' } : {}) };
    }),
  };
}

function csvCell(value: unknown, textCell = false): string {
  let text = value === undefined || value === null ? '' : String(value);
  // Prevent spreadsheet formula execution in teacher-authored text fields.
  if (textCell && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportCsv(run: Run): string {
  const header = ['id', 'time_s', 'raw', 'distance_cm', 'corrected', 'estimated_distance_cm', 'ambient', 'saturated', 'excluded', 'data_source', 'run_name', 'repeat', 'unit', 'linear', 'start_distance_cm', 'speed_cm_s', 'start_time_s', 'saturation'];
  const rows = run.samples.map(sample => [
    csvCell(sample.id, true), csvCell(sample.t), csvCell(sample.raw), csvCell(sample.distance),
    csvCell(corrected(sample, run)), csvCell(distanceFor(sample, run)), csvCell(run.ambient),
    csvCell(isSaturated(sample, run)), csvCell(sample.excluded, true),
    csvCell(run.mode === 'practice' ? '연습 데이터' : run.mode === 'serial' ? '실물 센서' : 'CSV·수동 입력'),
    csvCell(run.name, true), csvCell(run.repeat), csvCell(run.unit, true), csvCell(run.linear),
    csvCell(run.startDistance), csvCell(run.speed), csvCell(run.startTime), csvCell(run.saturation),
  ].join(','));
  return '\uFEFF' + [header.join(','), ...rows].join('\r\n');
}

function readCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell.length === 0) quoted = !quoted;
      else throw new Error('CSV 따옴표 위치가 올바르지 않습니다.');
    } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\r' || ch === '\n') && !quoted) {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(cell); if (row.some(v => v.trim())) rows.push(row);
      row = []; cell = '';
    } else cell += ch;
  }
  if (quoted) throw new Error('CSV의 닫는 따옴표가 없습니다.');
  row.push(cell); if (row.some(v => v.trim())) rows.push(row);
  return rows;
}

export interface CsvResult {
  samples: Sample[];
  errors: string[];
  /** Preserve practice provenance on re-import. */
  mode?: Run['mode'];
  metadata?: Partial<Omit<Run, 'id' | 'samples'>>;
}

/** Headers are required. Blank or nonnumeric raw values become null, never zero. */
export function parseCsv(text: string): CsvResult {
  const errors: string[] = [], samples: Sample[] = [];
  let rows: string[][];
  try { rows = readCsvRows(text); } catch (error) { return { samples, errors: [String((error as Error).message)] }; }
  if (rows.length < 2) return { samples, errors: ['열 제목과 한 줄 이상의 데이터가 필요합니다.'] };
  const headers = rows.shift()!.map(v => v.trim().toLowerCase());
  const column = (...names: string[]) => headers.findIndex(h => names.includes(h));
  const timeCol = column('time_s', 'time', 't', '시간', '시간(s)');
  const rawCol = column('raw', 'value', 'brightness', '센서 원시값', '측정값');
  const distanceCol = column('distance_cm', 'distance', '거리', '거리(cm)');
  if (rawCol < 0 || (timeCol < 0 && distanceCol < 0)) return { samples, errors: ['raw와 time_s 또는 distance_cm 열이 필요합니다.'] };
  const get = (row: string[], name: string) => { const i = column(name); return i < 0 ? '' : (row[i] ?? '').trim(); };
  const number = (value: string): number | undefined => value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : undefined;
  const first = rows[0];
  const firstSupplied = (name: string) => rows.map(row => get(row, name)).find(Boolean) ?? '';
  const practice = rows.some(row => /연습|practice/i.test(get(row, 'data_source')));
  const metadata: CsvResult['metadata'] = {};
  const numericMetadata: [keyof Run, string][] = [['ambient', 'ambient'], ['repeat', 'repeat'], ['startDistance', 'start_distance_cm'], ['speed', 'speed_cm_s'], ['startTime', 'start_time_s'], ['saturation', 'saturation']];
  // A run has one calibration. Never silently apply the first run's calibration to mixed runs.
  for (const name of [...numericMetadata.map(([, name]) => name), 'unit']) {
    const supplied = rows.map(row => get(row, name)).filter(Boolean);
    const distinct = new Set(supplied.map(v => name === 'unit' ? v : String(number(v))));
    if (distinct.size > 1) return { samples, errors: [`${name} 설정이 행마다 다릅니다. 실험별로 CSV를 나누어 불러오세요.`] };
    if (name !== 'unit' && supplied.some(v => number(v) === undefined)) return { samples, errors: [`${name} 설정에 잘못된 숫자가 있습니다.`] };
  }
  for (const [key, name] of numericMetadata) {
    const value = number(firstSupplied(name));
    if (value !== undefined) Object.assign(metadata, { [key]: value });
  }
  if (firstSupplied('unit')) metadata.unit = firstSupplied('unit');
  if (get(first, 'run_name')) metadata.name = get(first, 'run_name').replace(/^'(?=[=+\-@])/, '');
  // Imported claims never validate real sensor linearity. Simulated data is explicitly a model.
  metadata.linear = practice && get(first, 'linear') === 'true';
  const importId = uid();
  for (const [index, row] of rows.entries()) {
    if (samples.length >= 100000) { errors.push('최대 100,000행까지만 불러왔습니다.'); break; }
    const t = timeCol >= 0 ? number(row[timeCol] ?? '') : index;
    if (t === undefined || t < 0) { errors.push(`${index + 2}행: 시간이 올바르지 않아 불러오지 않았습니다.`); continue; }
    const raw = number(row[rawCol] ?? '') ?? null;
    if (raw === null) errors.push(`${index + 2}행: 측정값 누락/오류를 빈 값으로 보존했습니다.`);
    let distance: number | undefined;
    if (distanceCol >= 0 && row[distanceCol]?.trim()) {
      distance = number(row[distanceCol]);
      if (distance === undefined || distance <= 0) { errors.push(`${index + 2}행: 거리는 0보다 커야 하므로 이 행을 불러오지 않았습니다.`); continue; }
    }
    const excluded = get(row, 'excluded').replace(/^'(?=[=+\-@])/, '');
    samples.push({ id: `${importId}-${index}`, t, raw, ...(distance !== undefined ? { distance } : {}),
      ...(excluded ? { excluded } : {}), ...(get(row, 'saturated') === 'true' || get(row, 'saturated') === '1' ? { saturated: true } : {}) });
  }
  return { samples, errors, mode: practice ? 'practice' : 'manual', metadata };
}

function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function optionalNumber(value: unknown): boolean { return value === undefined || finite(value); }
function validPrediction(value: unknown): boolean {
  return record(value) && typeof value.author === 'string' && value.author.trim().length > 0
    && typeof value.reason === 'string' && value.reason.trim().length > 0
    && typeof value.savedAt === 'string' && Number.isFinite(Date.parse(value.savedAt))
    && Array.isArray(value.points) && value.points.length >= 2 && value.points.length <= 1000
    && value.points.every(p => record(p) && positive(p.x) && finite(p.y) && p.y >= 0 && p.y <= 100)
    && new Set(value.points.map(p => (p as { x: number }).x)).size === value.points.length;
}
function validSample(value: unknown): value is Sample {
  return record(value) && typeof value.id === 'string' && finite(value.t) && value.t >= 0
    && (value.raw === null || finite(value.raw)) && optionalNumber(value.distance)
    && (value.excluded === undefined || typeof value.excluded === 'string')
    && (value.saturated === undefined || typeof value.saturated === 'boolean');
}
export function validateRun(value: unknown): value is Run {
  if (!record(value) || typeof value.id !== 'string' || typeof value.name !== 'string'
    || !Number.isInteger(value.repeat) || (value.repeat as number) < 1
    || !['practice', 'manual', 'serial'].includes(value.mode as string)
    || !Array.isArray(value.samples) || value.samples.length > 100000 || !value.samples.every(validSample)
    || !finite(value.ambient) || !finite(value.startDistance) || !optionalNumber(value.speed)
    || !optionalNumber(value.startTime) || !optionalNumber(value.saturation)
    || (value.originalCsv !== undefined && (typeof value.originalCsv !== 'string' || value.originalCsv.length > 10000000 || new TextEncoder().encode(value.originalCsv).byteLength > 10000000))
    || typeof value.linear !== 'boolean' || typeof value.unit !== 'string') return false;
  return new Set(value.samples.map(s => s.id)).size === value.samples.length;
}

/** Recursive numeric/string sanity checks include evolving prediction shapes. */
function safeTree(value: unknown, depth = 0): boolean {
  if (depth > 15) return false;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return true;
  if (typeof value === 'number') return finite(value);
  if (Array.isArray(value)) return value.length <= 100000 && value.every(v => safeTree(v, depth + 1));
  return record(value) && Object.keys(value).length <= 10000 && Object.entries(value).every(([k, v]) => !['__proto__', 'constructor', 'prototype'].includes(k) && safeTree(v, depth + 1));
}

export function validateBackup(data: unknown): boolean {
  if (!record(data) || !safeTree(data) || data.version !== 1 || ![3, 4, 5].includes(data.lesson as number)
    || !Number.isInteger(data.step) || (data.step as number) < 0 || (data.step as number) > 4
    || typeof data.home !== 'boolean' || !record(data.notes) || !Object.values(data.notes).every(v => typeof v === 'string')
    || !Array.isArray(data.runs) || data.runs.length > 1000 || !data.runs.every(validateRun)
    || typeof data.activeRunId !== 'string' || !Array.isArray(data.completed) || !data.completed.every(v => typeof v === 'string' && /^[345]-[0-4]$/.test(v))
    || !['small', 'normal', 'large'].includes(data.fontSize as string)
    || !['practice', 'manual', 'serial'].includes(data.mode as string) || typeof data.reveal !== 'boolean') return false;
  if (data.prediction !== null && !validPrediction(data.prediction)) return false;
  if (!Array.isArray(data.predictions) || !data.predictions.every(validPrediction)) return false;
  if (data.prediction !== null && !data.predictions.some(p => JSON.stringify(p) === JSON.stringify(data.prediction))) return false;
  if (data.activeRunId !== '' && !data.runs.some(r => r.id === data.activeRunId)) return false;
  return new Set(data.runs.map(r => r.id)).size === data.runs.length;
}
