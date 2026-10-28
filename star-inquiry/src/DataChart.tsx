import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { SeriesOption } from "echarts";
import {
  corrected,
  distanceFor,
  normalize,
  invalidReason,
  type Run,
} from "./domain";
import type { Prediction } from "./Learning";
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
  CanvasRenderer,
]);
export function DataChart({
  run,
  others = [],
  prediction = null,
  analysis = false,
  referenceId,
  axis = "time",
}: {
  run: Run;
  others?: Run[];
  prediction?: Prediction | null;
  analysis?: boolean;
  referenceId?: string;
  axis?: "time" | "distance" | "inverse";
}) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!el.current) return;
    const c = echarts.init(el.current, undefined, { renderer: "canvas" });
    const normalized = normalize(
      run,
      referenceId ||
        run.samples.find(
          (s) =>
            !s.excluded &&
            !s.saturated &&
            (corrected(s, run) ?? 0) > 0 &&
            (distanceFor(s, run) ?? 0) > 0,
        )?.id ||
        "",
    );
    const isDistance = analysis || axis !== "time";
    const x = (s: Run["samples"][number], r: Run) =>
      axis === "inverse"
        ? (distanceFor(s, r) ?? 0) > 0
          ? 1 / distanceFor(s, r)! ** 2
          : null
        : isDistance
          ? distanceFor(s, r)
          : s.t;
    const series: SeriesOption[] = analysis
      ? [
          {
            name: run.mode === "practice" ? "연습 밝기" : "측정한 밝기",
            type: "line",
            symbolSize: 7,
            connectNulls: false,
            data: normalized.flatMap((p) =>
              p.gapBefore
                ? [
                    [p.distance, null],
                    [p.distance, p.relative],
                  ]
                : [[p.distance, p.relative]],
            ),
            itemStyle: { color: "#79d8d0" },
          },
          {
            name: "이론 밝기",
            type: "line",
            showSymbol: false,
            lineStyle: { type: "dashed", width: 2 },
            data: normalized.map((p) => [p.distance, p.theory]),
            itemStyle: { color: "#f8c84d" },
          },
        ]
      : [
          {
            name: "센서가 읽은 값",
            type: "line",
            connectNulls: false,
            data: run.samples.map((s) => [x(s, run), s.raw]),
            itemStyle: { color: "#7e91c9" },
            showSymbol: false,
          },
          {
            name: "주변빛을 뺀 값",
            type: "line",
            connectNulls: false,
            data: run.samples.map((s) => [
              x(s, run),
              invalidReason(s, run) ? null : corrected(s, run),
            ]),
            itemStyle: { color: "#79d8d0" },
            showSymbol: run.samples.length < 40,
          },
          ...others
            .filter((r) => r.id !== run.id)
            .map((r, i) => ({
              name: `${r.mode === "practice" ? "연습 · " : ""}${r.name}`,
              type: "line" as const,
              connectNulls: false,
              data: r.samples.map((s) => [
                x(s, r),
                invalidReason(s, r) ? null : corrected(s, r),
              ]),
              showSymbol: false,
              lineStyle: { type: "dotted" as const },
              itemStyle: { color: ["#bb9ee7", "#e69c7e", "#90a9ff"][i % 3] },
            })),
        ];
    if (
      analysis &&
      prediction &&
      normalized.length &&
      prediction.points[0]?.y > 0
    ) {
      const start = run.startDistance;
      const baseDistance =
        normalized.find((p) => p.id === referenceId)?.distance ??
        normalized[0].distance;
      const baseX = baseDistance / start;
      const ordered = [...prediction.points].sort((a, b) => a.x - b.x);
      const left = ordered.filter((p) => p.x <= baseX).at(-1);
      const right = ordered.find((p) => p.x >= baseX);
      const baseY =
        left && right
          ? left.x === right.x
            ? left.y
            : left.y +
              ((right.y - left.y) * (baseX - left.x)) / (right.x - left.x)
          : null;
      if (baseY !== null && baseY > 0)
        series.push({
          name: "처음 예상한 밝기",
          type: "line",
          symbol: "diamond",
          lineStyle: { type: "dotted" },
          data: ordered.map((p) => [start * p.x, p.y / baseY]),
          itemStyle: { color: "#c5a5f5" },
        });
    }
    c.setOption({
      backgroundColor: "#111833",
      animation: false,
      title: {
        text: run.mode === "practice" ? "연습 데이터" : "",
        left: 12,
        top: 4,
        textStyle: { color: "#f8c84d", fontSize: 16 },
      },
      textStyle: {
        fontFamily: '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
        fontSize: 16,
        color: "#dce4f5",
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        backgroundColor: "#0b1229",
        borderColor: "#516180",
        textStyle: { color: "#edf2fc", fontSize: 16 },
        valueFormatter: (v: unknown) =>
          typeof v === "number"
            ? Number(v.toPrecision(5)).toString()
            : String(v),
      },
      legend: {
        bottom: 8,
        left: 12,
        right: 12,
        itemGap: 22,
        itemWidth: 26,
        itemHeight: 14,
        textStyle: { color: "#dce4f5", fontSize: 16 },
        pageTextStyle: { color: "#dce4f5", fontSize: 15 },
        pageIconColor: "#f8c84d",
        pageIconInactiveColor: "#66738e",
        pageIconSize: 16,
        type: "scroll",
      },
      toolbox: {
        right: 8,
        top: 4,
        itemSize: 20,
        itemGap: 16,
        feature: {
          dataZoom: { title: { zoom: "영역 확대", back: "확대 되돌리기" } },
          restore: { title: "원래 크기" },
        },
        iconStyle: { borderColor: "#c7d1ea" },
      },
      grid: {
        left: 14,
        right: 24,
        top: 76,
        bottom: 132,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name:
          axis === "inverse"
            ? "1 / 거리² (cm⁻²)"
            : isDistance
              ? "거리 (cm)"
              : "경과 시간 (s)",
        nameLocation: "middle",
        nameGap: 36,
        nameTextStyle: { color: "#dce4f5", fontSize: 17 },
        axisLabel: {
          color: "#dce4f5",
          fontSize: 16,
          margin: 12,
          hideOverlap: true,
        },
        splitLine: { lineStyle: { color: "#26304d" } },
      },
      yAxis: {
        type: "value",
        name: analysis
          ? "기준 밝기의 몇 배"
          : run.unit === "센서 원시값"
            ? "센서가 읽은 값"
            : run.unit || "센서가 읽은 값",
        nameGap: 20,
        nameTextStyle: { color: "#dce4f5", fontSize: 17, align: "left" },
        splitNumber: 4,
        splitLine: { lineStyle: { color: "#26304d" } },
        axisLabel: { color: "#dce4f5", fontSize: 16, margin: 12 },
      },
      dataZoom: [
        { type: "inside", filterMode: "none" },
        {
          type: "slider",
          bottom: 56,
          height: 24,
          borderColor: "#35415e",
          textStyle: { color: "#dce4f5", fontSize: 15 },
        },
      ],
      series,
    });
    chart.current = c;
    const updateReadability = () => {
      const fontSize = Math.max(
        15,
        Math.round(
          parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.9,
        ),
      );
      c.resize();
      c.setOption({
        textStyle: { fontSize },
        title: { textStyle: { fontSize } },
        tooltip: {
          textStyle: { fontSize, lineHeight: Math.round(fontSize * 1.6) },
        },
        legend: { textStyle: { fontSize }, pageTextStyle: { fontSize } },
        xAxis: {
          splitNumber: c.getWidth() < 520 ? 3 : 5,
          axisLabel: { fontSize },
          nameTextStyle: { fontSize: fontSize + 1 },
        },
        yAxis: {
          axisLabel: { fontSize },
          nameTextStyle: { fontSize: fontSize + 1 },
        },
      });
    };
    updateReadability();
    const observer = new ResizeObserver(updateReadability);
    observer.observe(el.current);
    const fontObserver = new MutationObserver(updateReadability);
    fontObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => {
      observer.disconnect();
      fontObserver.disconnect();
      c.dispose();
      chart.current = null;
    };
  }, [run, others, prediction, analysis, referenceId, axis]);
  return (
    <div>
      <div
        ref={el}
        className="data-chart"
        role="img"
        aria-label={`${run.mode === "practice" ? "연습 데이터 " : ""}${analysis ? "예상·측정·이론 비교" : "측정값"} 그래프. 아래 데이터 표에서 수치를 확인할 수 있습니다.`}
      />
      <p className="chart-hint">
        아래 이름을 눌러 그래프를 켜고 끌 수 있어요. 점을 누르면 값이 보입니다.
      </p>
      <button
        className="chart-download"
        onClick={() => {
          if (!chart.current) return;
          const a = document.createElement("a");
          const data = chart.current.getDataURL({
            type: "png",
            pixelRatio: 2,
            backgroundColor: "#111833",
            excludeComponents: ["toolbox"],
          });
          const bytes = Uint8Array.from(atob(data.split(",")[1]), (v) =>
            v.charCodeAt(0),
          );
          const url = URL.createObjectURL(
            new Blob([bytes], { type: "image/png" }),
          );
          a.href = url;
          a.download = `${run.mode === "practice" ? "연습데이터-" : ""}${run.name}-${analysis ? "비교" : "측정"}그래프.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        그래프 그림으로 저장
      </button>
      {analysis && prediction && (
        <details>
          <summary>그래프는 어떻게 비교하나요?</summary>
          <p>
            선택한 거리의 밝기를 1로 맞춰 예상, 측정, 이론을 비교합니다. 처음
            예상한 점 사이의 값은 직선으로 이어 구합니다. 기준 거리가 예상 범위
            밖이거나 예상 밝기가 0이면 예상 그래프는 표시하지 않습니다.
          </p>
        </details>
      )}
    </div>
  );
}
