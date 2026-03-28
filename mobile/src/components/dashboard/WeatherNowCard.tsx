import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WeatherCurrent } from '../../services/weather';
import { agronomy as A } from '../../theme/agronomy';

interface Props {
  weather: WeatherCurrent | null;
  onPress?: () => void;
}

function rainNext6hLabel(weather: WeatherCurrent | null): string {
  if (!weather || weather.hours.length === 0) return '— %';
  const nextHours = weather.hours.slice(0, 6);
  const maxPop = nextHours.reduce((max, hour) => Math.max(max, hour.pop), 0);
  return `${maxPop}%`;
}

type WeatherGlyph = 'grain' | 'wb-cloudy' | 'wb-sunny';

function iconForDescription(description: string): WeatherGlyph {
  const d = description.toLowerCase();
  if (d.includes('chuva') || d.includes('rain') || d.includes('storm') || d.includes('thunder')) return 'grain';
  if (d.includes('nuvem') || d.includes('cloud') || d.includes('nubl')) return 'wb-cloudy';
  if (d.includes('sol') || d.includes('clear') || d.includes('limpo')) return 'wb-sunny';
  return 'wb-cloudy';
}

export function WeatherNowCard({ weather, onPress }: Props) {
  const temp = weather ? `${Math.round(weather.temp)}°` : '—';
  const desc = weather?.description ?? 'Carregando…';
  const icon = weather ? iconForDescription(weather.description) : 'wb-cloudy';
  const pop = rainNext6hLabel(weather);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Clima agora, toque para ver detalhes"
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>Clima agora</Text>
          <View style={styles.tempRow}>
            <Text style={styles.temp}>{temp}</Text>
            <MaterialIcons name={icon} size={44} color={A.primaryLight} style={styles.wIcon} />
          </View>
          <Text style={styles.desc} numberOfLines={2}>
            {desc}
          </Text>
        </View>
      </View>
      <View style={styles.rainRow}>
        <MaterialIcons name="water-drop" size={18} color={A.weatherCardSubtext} />
        <Text style={styles.rainLabel}>
          Chuva próximas 6h: <Text style={styles.rainValue}>{pop}</Text>
        </Text>
      </View>
      {onPress ? (
        <Text style={styles.hint}>Toque para detalhes</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: A.weatherCardBg,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pressed: {
    opacity: 0.95,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: A.weatherCardSubtext,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temp: {
    color: A.textOnDark,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  wIcon: {
    marginLeft: 8,
    opacity: 0.95,
  },
  desc: {
    color: A.weatherCardSubtext,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    maxWidth: '92%',
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  rainLabel: {
    color: A.weatherCardSubtext,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  rainValue: {
    color: A.textOnDark,
    fontWeight: '800',
  },
  hint: {
    color: A.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'right',
  },
});
