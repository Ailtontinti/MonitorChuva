import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { agronomy as A } from '../../theme/agronomy';

export type RainPeriodDays = 7 | 30 | 90;

interface Props {
  value: RainPeriodDays;
  onChange: (d: RainPeriodDays) => void;
}

const OPTIONS: RainPeriodDays[] = [7, 30, 90];

export function PeriodFilter({ value, onChange }: Props) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {OPTIONS.map((d) => {
        const active = value === d;
        return (
          <Pressable
            key={d}
            onPress={() => onChange(d)}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active && styles.segmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{d} dias</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: A.pillInactive,
    borderRadius: 14,
    padding: 5,
    gap: 6,
  },
  segment: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  segmentActive: {
    backgroundColor: A.primary,
    shadowColor: A.shadowMd,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  segmentPressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: A.textSecondary,
  },
  labelActive: {
    color: A.textOnDark,
    fontWeight: '700',
  },
});
