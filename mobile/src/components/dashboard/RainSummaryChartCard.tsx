import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RainSummaryPoint } from '../../services/dashboard';
import { agronomy as A } from '../../theme/agronomy';
import { getRainIntensity } from './rainIntensity';

interface Props {
  rainSummaryDays: 7 | 30 | 90;
  setRainSummaryDays: (value: 7 | 30 | 90) => void;
  rainSummary: RainSummaryPoint[];
  formatRainDateLabel: (dateIso: string) => string;
}

const CHART_MAX_HEIGHT = 130;

export function RainSummaryChartCard({
  rainSummaryDays,
  setRainSummaryDays,
  rainSummary,
  formatRainDateLabel,
}: Props) {
  const totalPeriod = rainSummary.reduce((sum, p) => sum + p.totalMm, 0);
  const maxRain = rainSummary.reduce((max, p) => Math.max(max, p.totalMm), 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resumo de chuva</Text>
        <View style={styles.pills}>
          {([7, 30, 90] as const).map((d) => {
            const active = rainSummaryDays === d;
            return (
              <Pressable
                key={`rs-${d}`}
                onPress={() => setRainSummaryDays(d)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{d}d</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.total}>
        Total: <Text style={styles.totalStrong}>{totalPeriod.toFixed(1)} mm</Text>
      </Text>

      {rainSummary.length === 0 ? (
        <Text style={styles.empty}>Sem dados no periodo.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {rainSummary.map((point) => {
            const ratio = maxRain > 0 ? point.totalMm / maxRain : 0;
            const height = Math.max(8, Math.round(ratio * CHART_MAX_HEIGHT));
            const intensity = getRainIntensity(point.totalMm);
            return (
              <View key={point.date} style={styles.col}>
                <Text style={[styles.mm, { color: intensity.accent }]}>{point.totalMm.toFixed(1)} mm</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height, backgroundColor: intensity.accent }]} />
                </View>
                <Text style={styles.date}>{formatRainDateLabel(point.date)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: A.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    backgroundColor: A.pillInactive,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pillActive: {
    backgroundColor: A.primary,
  },
  pillText: {
    color: A.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: A.textOnDark,
  },
  total: {
    marginTop: 8,
    color: A.textSecondary,
    fontSize: 15,
  },
  totalStrong: {
    color: A.textPrimary,
    fontWeight: '700',
  },
  empty: {
    marginTop: 14,
    color: A.textMuted,
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 12,
    paddingRight: 8,
  },
  col: {
    width: 40,
    marginRight: 10,
    alignItems: 'center',
  },
  mm: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  barTrack: {
    width: 20,
    height: CHART_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  date: {
    marginTop: 8,
    color: A.textSecondary,
    fontSize: 10,
  },
});