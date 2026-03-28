import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { agronomy as A } from '../../theme/agronomy';
import { getRainIntensity, RainIntensityStyle } from './rainIntensity';

interface Props {
  mmToday: number;
  /** Texto opcional, ex.: "+3 mm vs ontem" ou "Igual a ontem" */
  vsPreviousDay?: string | null;
  /** Ex.: origem GPS / modelo meteorológico */
  locationHint?: string;
}

export function TodayRainHighlight({ mmToday, vsPreviousDay, locationHint }: Props) {
  const intensity: RainIntensityStyle = getRainIntensity(mmToday);
  const displayMm = Number.isFinite(mmToday) ? mmToday : 0;

  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: intensity.accent }]}>
      <Text style={styles.kicker}>Chuva hoje</Text>
      <View style={styles.row}>
        <Text style={[styles.value, { color: intensity.accent }]}>{displayMm.toFixed(1)} mm</Text>
        <View style={[styles.badge, { backgroundColor: intensity.softBg }]}>
          <Text style={[styles.badgeText, { color: intensity.accent }]}>{intensity.label}</Text>
        </View>
      </View>
      {vsPreviousDay ? (
        <Text style={styles.compare} numberOfLines={2}>
          {vsPreviousDay}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  titleRow: {
    marginBottom: 8,
  },
  kicker: {
    color: A.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hint: {
    color: A.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  value: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  compare: {
    marginTop: 10,
    color: A.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
