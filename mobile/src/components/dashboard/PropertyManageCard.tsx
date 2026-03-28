import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { agronomy as A } from '../../theme/agronomy';

interface Props {
  onPress: () => void;
}

export function PropertyManageCard({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Gerenciar propriedades"
    >
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>🏢</Text>
      </View>
      <Text style={styles.title}>Gerenciar Propriedades</Text>
      <MaterialIcons name="chevron-right" size={22} color={A.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.bgCard,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: A.inputBorder,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: A.menuRainIcon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    color: A.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
