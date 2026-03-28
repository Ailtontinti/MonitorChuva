import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { agronomy as A } from '../../theme/agronomy';

interface Props {
  onCompareAreas: () => void;
  onFilterPluviometer: () => void;
  onExportCsv: () => void;
}

export function ActionButtons({ onCompareAreas, onFilterPluviometer, onExportCsv }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onCompareAreas}
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
        accessibilityRole="button"
      >
        <Text style={styles.primaryLabel}>Comparar áreas</Text>
      </Pressable>

      <Pressable
        onPress={onFilterPluviometer}
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryLabel}>Filtrar por pluviômetro</Text>
      </Pressable>

      <Pressable
        onPress={onExportCsv}
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryLabel}>Exportar CSV</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 12,
  },
  primaryBtn: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: A.primary,
    paddingHorizontal: 16,
  },
  primaryBtnPressed: {
    backgroundColor: A.primaryPressed,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: A.textOnDark,
  },
  secondaryBtn: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: A.bgCard,
    borderWidth: 1.5,
    borderColor: A.border,
    paddingHorizontal: 16,
  },
  secondaryBtnPressed: {
    backgroundColor: A.inputBg,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: A.textPrimary,
  },
});
