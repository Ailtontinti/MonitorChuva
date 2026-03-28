import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { agronomy as A } from '../../theme/agronomy';
import type { RainDayPoint } from './types';

const STEP_MM = 5;
const Y_AXIS_WIDTH = 44;

function niceMaxMm(values: number[]): number {
  const maxData = Math.max(0, ...values);
  if (maxData <= 0) return 35;
  const ceil5 = Math.ceil(maxData / STEP_MM) * STEP_MM;
  return Math.max(ceil5, STEP_MM * 2);
}

function parseLocalDate(isoYmd: string): Date {
  const [y, m, d] = isoYmd.split('-').map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatTooltipDate(isoYmd: string): string {
  const dt = parseLocalDate(isoYmd);
  return dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMm(n: number): string {
  if (Number.isInteger(n)) return `${n}`;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

function barColor(mm: number, maxMm: number): string {
  if (maxMm <= 0 || mm <= 0) return A.chartBarMuted;
  const r = mm / maxMm;
  if (r >= 0.82) return A.primaryDark;
  if (r >= 0.45) return A.chartBar;
  return A.primaryLight;
}

/** Índices de dias que devem exibir rótulo no eixo X (amostragem uniforme + extremos). */
function xLabelIndices(count: number, maxLabels: number): Set<number> {
  if (count <= 0) return new Set();
  if (count <= maxLabels) return new Set(Array.from({ length: count }, (_, i) => i));
  const set = new Set<number>();
  set.add(0);
  set.add(count - 1);
  const inner = maxLabels - 2;
  if (inner <= 0) return set;
  for (let k = 1; k <= inner; k++) {
    const i = Math.round((k * (count - 1)) / (inner + 1));
    set.add(Math.max(0, Math.min(count - 1, i)));
  }
  return set;
}

interface Props {
  days: RainDayPoint[];
  plotHeight?: number;
  /** Largura mínima de cada coluna quando há rolagem horizontal */
  minBarColumnWidth?: number;
  maxXLabels?: number;
}

export function RainChart({
  days,
  plotHeight = 260,
  minBarColumnWidth = 28,
  maxXLabels = 6,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [selected, setSelected] = useState<RainDayPoint | null>(null);
  const [chartBodyW, setChartBodyW] = useState(0);

  const { maxY, ticks, maxMm } = useMemo(() => {
    const vals = days.map((d) => d.totalMm);
    const maxY = niceMaxMm(vals);
    const tickList: number[] = [];
    for (let v = 0; v <= maxY; v += STEP_MM) {
      tickList.push(v);
    }
    const maxMm = Math.max(0, ...vals, 0);
    return { maxY, ticks: tickList, maxMm };
  }, [days]);

  const inner =
    chartBodyW > 0
      ? chartBodyW
      : Math.max(220, windowWidth - 32 - Y_AXIS_WIDTH);
  const n = days.length;
  const naturalColumnW = n > 0 ? inner / n : 0;
  const useScroll = n > 0 && naturalColumnW < minBarColumnWidth;
  const columnWidth = useScroll ? minBarColumnWidth : Math.max(minBarColumnWidth * 0.75, naturalColumnW || inner / Math.max(n, 1));
  const scrollContentWidth = useScroll ? n * columnWidth + 16 : inner;

  const labelIdx = useMemo(() => xLabelIndices(n, maxXLabels), [n, maxXLabels]);

  useEffect(() => {
    setSelected(null);
  }, [days]);

  const onLayoutChartBody = (e: LayoutChangeEvent) => {
    setChartBodyW(e.nativeEvent.layout.width);
  };

  const toggleSelect = (d: RainDayPoint) => {
    setSelected((prev) => (prev?.date === d.date ? null : d));
  };

  return (
    <View style={styles.wrap}>
      {selected && (
        <View style={styles.tooltip} accessibilityLiveRegion="polite">
          <Text style={styles.tooltipDate}>{formatTooltipDate(selected.date)}</Text>
          <Text style={styles.tooltipMm}>{formatMm(selected.totalMm)} mm</Text>
        </View>
      )}

      <View style={styles.plotRow}>
        <View style={[styles.yAxis, { height: plotHeight }]}>
          {ticks
            .slice()
            .reverse()
            .map((v) => (
              <View key={`y-${v}`} style={[styles.yTickWrap, { bottom: `${(v / maxY) * 100}%` }]}>
                <Text style={styles.yLabel}>{v} mm</Text>
              </View>
            ))}
        </View>

        <View style={styles.chartBody} onLayout={onLayoutChartBody}>
        <ScrollView
          horizontal={useScroll}
          showsHorizontalScrollIndicator={useScroll}
          bounces={false}
          style={styles.scrollZone}
          contentContainerStyle={
            useScroll
              ? { width: scrollContentWidth, paddingHorizontal: 8 }
              : { flexGrow: 1, paddingHorizontal: 4 }
          }
        >
          <View style={{ width: useScroll ? scrollContentWidth : '100%' }}>
            <View style={[styles.barsArea, { height: plotHeight }]}>
              {ticks
                .filter((v) => v > 0)
                .map((v) => (
                  <View
                    key={`g-${v}`}
                    style={[styles.gridLine, { bottom: `${(v / maxY) * 100}%` }]}
                  />
                ))}
              <View style={[styles.barsRow, { height: plotHeight }]}>
                {days.map((d) => {
                  const h =
                    maxY > 0
                      ? Math.max(d.totalMm > 0 ? 8 : 4, (d.totalMm / maxY) * plotHeight)
                      : 4;
                  const w = useScroll ? columnWidth : undefined;
                  const selectedHere = selected?.date === d.date;
                  return (
                    <Pressable
                      key={d.date}
                      onPress={() => toggleSelect(d)}
                      style={[
                        styles.barCol,
                        !useScroll && styles.barColFlex,
                        w != null && { width: w },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Chuva ${d.label}, ${formatMm(d.totalMm)} milímetros`}
                    >
                      <View
                        style={[
                          styles.bar,
                          {
                            height: h,
                            backgroundColor: barColor(d.totalMm, maxMm),
                            opacity: selected && !selectedHere ? 0.55 : 1,
                          },
                          selectedHere && styles.barSelected,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.xRow, useScroll && { width: scrollContentWidth }]}>
              {days.map((d, i) => (
                <View
                  key={`x-${d.date}`}
                  style={[styles.xCell, !useScroll && styles.barColFlex, useScroll && { width: columnWidth }]}
                >
                  {labelIdx.has(i) ? (
                    <Text style={styles.xLabel} numberOfLines={1}>
                      {d.label}
                    </Text>
                  ) : (
                    <Text style={[styles.xLabel, styles.xLabelHidden]}> </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        </View>
      </View>

      <Text style={styles.caption}>Milímetros de chuva por dia no período</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  tooltip: {
    backgroundColor: A.bgDeepSurface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  tooltipDate: {
    color: A.textOnDarkMuted,
    fontSize: 13,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  tooltipMm: {
    color: A.textOnDark,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  plotRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  chartBody: {
    flex: 1,
    minWidth: 0,
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    position: 'relative',
    marginRight: 4,
  },
  yTickWrap: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'flex-end',
    marginBottom: -8,
  },
  yLabel: {
    fontSize: 10,
    color: A.textMuted,
    fontVariant: ['tabular-nums'],
  },
  scrollZone: {
    flexGrow: 1,
  },
  barsArea: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: A.chartGridLine,
  },
  barsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barColFlex: {
    flex: 1,
  },
  bar: {
    width: '78%',
    maxWidth: 32,
    minWidth: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barSelected: {
    borderWidth: 2,
    borderColor: A.primaryDark,
  },
  xRow: {
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 18,
  },
  xCell: {
    alignItems: 'center',
  },
  xLabel: {
    fontSize: 11,
    color: A.textSecondary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  xLabelHidden: {
    opacity: 0,
  },
  caption: {
    fontSize: 12,
    color: A.textMuted,
    marginTop: 10,
  },
});
