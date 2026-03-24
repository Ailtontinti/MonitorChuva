import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  organizationName: string;
  propertyName: string;
  gaugeName: string;
}

export function ContextCard({ organizationName, propertyName, gaugeName }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.fazendaValue}>{organizationName}</Text>
      <Text style={styles.rowText}>Talhão: {propertyName}</Text>
      <Text style={styles.rowText}>Pluviômetro: {gaugeName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  fazendaValue: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '800',
  },
  rowText: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 14,
  },
});

