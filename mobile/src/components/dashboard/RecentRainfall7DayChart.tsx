import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RainDayPoint } from '../recentRainfall/types';
import { agronomy as A } from '../../theme/agronomy';

export type { RainDayPoint };

const PLOT_HEIGHT = 168;
const Y_AXIS_WIDTH = 40;
const STEP_MM = 5;

function niceMaxMm(values: number[]): number {
  const maxData = Math.max(0, ...values);
  if (maxData <= 0) return 35;
  const ceil5 = Math.ceil(maxData / STEP_MM) * STEP_MM;
  return Math.max(ceil5, STEP_MM * 2);
}

interface Props {
  days: RainDayPoint[];
}

export function RecentRainfall7DayChart({ days }: Props) {
  const { maxY, ticks } = useMemo(() => {
    const maxY = niceMaxMm(days.map((d) => d.totalMm));
    const tickList: number[] = [];
    for (let v = 0; v <= maxY; v += STEP_MM) {
      tickList.push(v);
    }
    return { maxY, ticks: tickList };
  }, [days]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={[styles.yAxis, { height: PLOT_HEIGHT }]}>
          {ticks
            .slice()
            .reverse()
            .map((v) => (
              <View
                key={`y-${v}`}
                style={[
                  styles.yTickWrap,
                  { bottom: `${(v / maxY) * 100}%` },
                ]}
              >
                <Text style={styles.yLabel}>{v}mm</Text>
              </View>
            ))}
        </View>

        <View style={[styles.plot, { height: PLOT_HEIGHT }]}>
          {ticks
            .filter((v) => v > 0)
            .map((v) => (
              <View
               key={`g-${v}`}
                style={[
                  styles.gridLine,
                  { bottom: `${(v / maxY) * 100}%` },
                ]}
              />
            ))}

          <View style={styles.barsRow}>
            {days.map((d) => {
              const h =
                maxY > 0
                  ? Math.max(d.totalMm > 0 ? 6 : 3, (d.totalMm / maxY) * PLOT_HEIGHT)
                  : 3;
              return (
                <View key={d.date} style={styles.barCol}>
                  <View style={[styles.bar, { height: h }]} />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.xRow}>
        {days.map((d) => (
          <Text key={d.date} style={styles.xLabel}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    position: 'relative',
    marginRight: 6,
  },
  yTickWrap: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'flex-end',
    marginBottom: -7,
  },
  yLabel: {
    fontSize: 10,
    color: A.textMuted,
    fontVariant: ['tabular-nums'],
  },
  plot: {
    flex: 1,
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
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  bar: {
    width: '88%',
    maxWidth: 22,
    minWidth: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: A.chartBarSky,
  },
  xRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingLeft: Y_AXIS_WIDTH + 6,
  },
  xLabel: {
    flex: 1,
    fontSize: 11,
    color: A.textMuted,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
