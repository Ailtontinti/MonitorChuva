import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { agronomy as A } from '../../theme/agronomy';

interface Props {
  onInserirDados: () => void;
  onVisualizarDados: () => void;
}

export function DashboardActionButtons({ onInserirDados, onVisualizarDados }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onInserirDados}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
        accessibilityRole="button"
        accessibilityLabel="Inserir dados"
      >
        <Text style={styles.primaryText}>Inserir dados</Text>
      </Pressable>
      <Pressable
        onPress={onVisualizarDados}
        style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
        accessibilityRole="button"
        accessibilityLabel="Visualizar dados"
      >
        <Text style={styles.secondaryText}>Visualizar dados</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  primary: {
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: A.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: A.primaryDark,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  primaryPressed: {
    backgroundColor: A.primaryPressed,
  },
  primaryText: {
    color: A.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: A.primary,
    backgroundColor: A.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPressed: {
    backgroundColor: A.menuRain,
  },
  secondaryText: {
    color: A.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
