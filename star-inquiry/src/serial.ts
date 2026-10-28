/** Receive-only adapter for an explicitly confirmed newline/numeric CSV firmware. */
export type SerialState =
  | "unsupported"
  | "insecure"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
export interface SerialFrame {
  raw: number;
  values: number[];
  line: string;
  receivedAt: number;
}
export interface SerialOptions {
  baudRate: number;
  /** Zero-based column index, chosen after checking the actual firmware frame. */
  channel: number;
  separator?: string;
  unit?: string;
  linear?: boolean;
  protocolConfirmed: boolean;
}
export interface SerialCallbacks {
  onFrame: (frame: SerialFrame) => void;
  onState?: (state: SerialState) => void;
  onError?: (message: string) => void;
}

interface Port {
  readable: ReadableStream<Uint8Array> | null;
  open(options: { baudRate: number; bufferSize?: number }): Promise<void>;
  close(): Promise<void>;
  getInfo?(): { usbVendorId?: number; usbProductId?: number };
  addEventListener?(type: string, listener: EventListener): void;
  removeEventListener?(type: string, listener: EventListener): void;
}
interface SerialApi {
  requestPort(): Promise<Port>;
}
type SerialNavigator = Navigator & { serial?: SerialApi };

export function supportStatus(): {
  supported: boolean;
  secure: boolean;
  message: string;
} {
  const secure = typeof window !== "undefined" && window.isSecureContext;
  const supported =
    typeof navigator !== "undefined" && !!(navigator as SerialNavigator).serial;
  return {
    supported,
    secure,
    message: !secure
      ? "실물 연결에는 HTTPS 또는 localhost가 필요합니다. CSV·수동 입력이나 연습 데이터를 사용하세요."
      : !supported
        ? "이 브라우저는 Web Serial을 지원하지 않습니다. 지원되는 데스크톱 Chrome/Edge 또는 CSV·수동 입력·연습 데이터를 사용하세요."
        : "Web Serial 사용 가능 · 실제 보드와 펌웨어는 검증 전입니다.",
  };
}

export class LineBuffer {
  private buffer = "";
  constructor(private readonly maximumLength = 65536) {}
  push(chunk: string): string[] {
    this.buffer += chunk;
    const parts = this.buffer.split("\n");
    this.buffer = parts.pop() ?? "";
    if (
      this.buffer.length > this.maximumLength ||
      parts.some((p) => p.length > this.maximumLength)
    ) {
      this.reset();
      throw new Error(
        "줄바꿈이 없거나 데이터 프레임이 너무 깁니다. 펌웨어 형식을 확인하세요.",
      );
    }
    return parts
      .map((line) => line.replace(/\r$/, ""))
      .filter((line) => line.trim().length > 0);
  }
  reset(): void {
    this.buffer = "";
  }
  get pending(): string {
    return this.buffer;
  }
}

export function parseNumericFrame(
  line: string,
  channel: number,
  separator = ",",
): Omit<SerialFrame, "receivedAt"> | null {
  if (!Number.isInteger(channel) || channel < 0 || !separator) return null;
  const cells = line
    .trim()
    .split(separator)
    .map((cell) => cell.trim());
  if (
    channel >= cells.length ||
    cells.some(
      (cell) =>
        cell === "" ||
        !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(cell),
    )
  )
    return null;
  const values = cells.map(Number);
  if (!values.every(Number.isFinite)) return null;
  return { raw: values[channel], values, line };
}

export class SerialConnection {
  private port: Port | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private reading: Promise<void> | null = null;
  private stopping = false;
  private state: SerialState = "disconnected";
  private epoch = 0;
  private disconnectListener: EventListener | null = null;
  constructor(private callbacks: SerialCallbacks) {}
  get status(): SerialState {
    return this.state;
  }
  get portInfo(): { usbVendorId?: number; usbProductId?: number } | null {
    return this.port?.getInfo?.() ?? null;
  }
  private setState(state: SerialState) {
    this.state = state;
    this.callbacks.onState?.(state);
  }
  async connect(options: SerialOptions): Promise<void> {
    const support = supportStatus();
    if (!support.secure || !support.supported) {
      this.setState(!support.secure ? "insecure" : "unsupported");
      throw new Error(support.message);
    }
    if (!options.protocolConfirmed)
      throw new Error(
        "보드의 송신 속도, 줄바꿈 숫자 형식, 밝기 채널을 먼저 확인해 주세요.",
      );
    if (
      !Number.isInteger(options.baudRate) ||
      options.baudRate <= 0 ||
      !Number.isInteger(options.channel) ||
      options.channel < 0
    )
      throw new Error(
        "통신 속도와 0부터 시작하는 밝기 채널 번호가 필요합니다.",
      );
    if (this.state === "connecting" || this.state === "connected")
      throw new Error("이미 연결 중입니다. 먼저 연결을 해제하세요.");
    this.stopping = false;
    const epoch = ++this.epoch;
    this.setState("connecting");
    let opened: Port | null = null;
    try {
      // Called only by an explicit UI action; no automatic chooser or reconnect.
      const port = await (navigator as SerialNavigator).serial!.requestPort();
      if (epoch !== this.epoch) return;
      await port.open({ baudRate: options.baudRate, bufferSize: 4096 });
      opened = port;
      if (epoch !== this.epoch) {
        await port.close();
        return;
      }
      this.port = port;
      if (!port.readable)
        throw new Error("기기의 읽기 스트림을 열지 못했습니다.");
      this.disconnectListener = () => {
        if (!this.stopping)
          this.callbacks.onError?.(
            "USB 연결이 끊겼습니다. 기록을 확인한 후 연결 버튼으로 다시 연결하세요.",
          );
        void this.disconnect();
      };
      port.addEventListener?.("disconnect", this.disconnectListener);
      this.reader = port.readable.getReader();
      this.setState("connected");
      this.reading = this.readLoop(options, epoch);
    } catch (error) {
      if (opened) {
        try {
          await opened.close();
        } catch {
          /* Already closed. */
        }
      }
      this.port = null;
      const message =
        error instanceof Error && error.name === "NotFoundError"
          ? "기기 선택을 취소했습니다. 연결 버튼으로 다시 시도할 수 있습니다."
          : String(error instanceof Error ? error.message : error);
      this.setState("error");
      this.callbacks.onError?.(message);
      throw new Error(message);
    }
  }
  private async readLoop(options: SerialOptions, epoch: number): Promise<void> {
    const decoder = new TextDecoder();
    const buffer = new LineBuffer();
    const reader = this.reader!;
    try {
      while (!this.stopping && epoch === this.epoch) {
        const { value, done } = await reader.read();
        if (done) {
          if (!this.stopping)
            this.callbacks.onError?.(
              "수신 스트림이 끝났습니다. 기기 연결과 누락 구간을 확인하세요.",
            );
          break;
        }
        for (const line of buffer.push(
          decoder.decode(value, { stream: true }),
        )) {
          const frame = parseNumericFrame(
            line,
            options.channel,
            options.separator,
          );
          if (frame)
            this.callbacks.onFrame({ ...frame, receivedAt: Date.now() });
          else
            this.callbacks.onError?.(
              "해석할 수 없는 프레임을 받았습니다. 채널 순서와 데이터 형식을 확인하세요.",
            );
        }
      }
      if (buffer.pending.trim())
        this.callbacks.onError?.(
          "연결 종료 시 미완성 프레임이 남았습니다. 이 값은 기록하지 않았습니다.",
        );
    } catch (error) {
      if (!this.stopping) {
        this.setState("error");
        this.callbacks.onError?.(
          `수신 오류: ${String(error instanceof Error ? error.message : error)}`,
        );
      }
    } finally {
      reader.releaseLock();
      if (this.reader === reader) this.reader = null;
      const port = this.port;
      if (port && epoch === this.epoch) {
        if (this.disconnectListener)
          port.removeEventListener?.("disconnect", this.disconnectListener);
        try {
          await port.close();
        } catch {
          /* Unplugged device may already be closed. */
        }
        this.port = null;
        this.setState("disconnected");
      }
    }
  }
  async disconnect(): Promise<void> {
    this.stopping = true;
    // Invalidate a pending requestPort/open call without claiming a connected device.
    if (this.state === "connecting") this.epoch++;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        /* Device may have disconnected first. */
      }
    }
    if (this.reading) await this.reading;
    this.reading = null;
    if (this.port) {
      if (this.disconnectListener)
        this.port.removeEventListener?.("disconnect", this.disconnectListener);
      try {
        await this.port.close();
      } catch {
        /* Already closed. */
      }
      this.port = null;
    }
    this.disconnectListener = null;
    this.setState("disconnected");
  }
}
