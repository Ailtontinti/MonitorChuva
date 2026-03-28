import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { WeatherCurrent, WeatherHour } from '../services/weather';
import { agronomy as A } from '../theme/agronomy';

interface Props {
  weather: WeatherCurrent | null;
  variant?: 'teaser' | 'full';
  onTeaserPress?: () => void;
  /** Ex.: cidade e UF — aparece no cabeçalho do cartão “Previsão do Tempo” */
  locationLabel?: string;
}

function getRainForecastTeaser(weather: WeatherCurrent | null): string {
  if (!weather || weather.hours.length === 0) return 'Chuva próximas 6h: --';

  const nextHours = weather.hours.slice(0, 6);
  const maxPop = nextHours.reduce((max, hour) => Math.max(max, hour.pop), 0);
  return `Chuva próximas 6h: ${maxPop}%`;
}

function heroIconName(description: string): React.ComponentProps<typeof MaterialIcons>['name'] {
  const d = description.toLowerCase();
  if (d.includes('trov') || d.includes('raio') || d.includes('storm')) return 'flash-on';
  if (d.includes('chuva') || d.includes('rain') || d.includes('garoa')) return 'grain';
  if (d.includes('nuvem') || d.includes('nubl') || d.includes('cloud')) return 'wb-cloudy';
  if (d.includes('sol') || d.includes('limpo') || d.includes('clear')) return 'wb-sunny';
  return 'wb-cloudy';
}

function hourIcon(h: WeatherHour): React.ComponentProps<typeof MaterialIcons>['name'] {
  if (h.pop >= 80) return 'grain';
  if (h.pop >= 50) return 'wb-cloudy';
  if (h.pop >= 25) return 'wb-cloudy';
  return 'wb-sunny';
}

function formatHourLabel(h: WeatherHour, index: number): string {
  if (index === 0) return 'Agora';
  const hr = new Date(h.time * 1000).getHours();
  return `${hr}h`;
}

export function WeatherForecastCard({
  weather,
  variant = 'teaser',
  onTeaserPress,
  locationLabel,
}: Props) {
  if (variant === 'teaser') {
    return (
      <Pressable
        onPress={onTeaserPress}
        style={{
          backgroundColor: A.weatherCardBg,
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <MaterialIcons name="wb-cloudy" size={26} color={A.textOnDark} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: A.textOnDark, fontSize: 13, fontWeight: '600' }}>Clima agora</Text>
            <Text style={{ color: A.weatherCardSubtext, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {weather ? `Temperatura: ${Math.round(weather.temp)}°` : 'Carregando...'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MaterialIcons name="water-drop" size={12} color={A.weatherCardSubtext} style={{ marginRight: 4 }} />
              <Text style={{ color: A.weatherCardSubtext, fontSize: 11, flexShrink: 1 }} numberOfLines={1}>
                {getRainForecastTeaser(weather)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={{ color: A.primaryLight, fontWeight: '700' }}>Ver →</Text>
      </Pressable>
    );
  }

  const place = locationLabel?.trim() || 'Localização atual';
  const hours = weather?.hours ?? [];
  const previewHours = hours.slice(0, 5);
  const hero = weather ? heroIconName(weather.description) : 'wb-cloudy';

  return (
    <LinearGradient
      colors={['#8b6fd6', '#5c4db8', '#3548a8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={fullStyles.card}
    >
      <View style={fullStyles.headerRow}>
        <Text style={fullStyles.headerTitle}>Previsão do Tempo</Text>
        <Text style={fullStyles.headerPlace} numberOfLines={1}>
          {place}
        </Text>
      </View>

      <View style={fullStyles.heroBlock}>
        <MaterialIcons name={hero} size={72} color="rgba(255,255,255,0.95)" />
        <Text style={fullStyles.heroTemp}>{weather ? `${Math.round(weather.temp)}°` : '—'}</Text>
        <Text style={fullStyles.heroDesc}>{weather ? weather.description : 'Carregando...'}</Text>
        <Text style={fullStyles.heroMinmax}>
          Máx. {weather ? `${Math.round(weather.tempMax)}°` : '—'} · Mín.{' '}
          {weather ? `${Math.round(weather.tempMin)}°` : '—'}
        </Text>
      </View>

      <Text style={fullStyles.sectionTitle}>Próximas horas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={fullStyles.hoursScroll}
      >
        {previewHours.length === 0 ? (
          <Text style={fullStyles.muted}>Sem previsão horária.</Text>
        ) : (
          previewHours.map((h, i) => (
            <View key={`${h.time}-${i}`} style={fullStyles.hourCol}>
              <Text style={fullStyles.hourLabel}>{formatHourLabel(h, i)}</Text>
              <MaterialIcons name={hourIcon(h)} size={28} color="rgba(255,255,255,0.92)" style={fullStyles.hourIcon} />
              <Text style={fullStyles.hourPop}>{h.pop}%</Text>
              <Text style={fullStyles.hourTemp}>{Math.round(h.temp)}°</Text>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const fullStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#2a1f4a',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 0,
  },
  headerPlace: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTemp: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -1,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  heroMinmax: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  hoursScroll: {
    paddingBottom: 4,
    gap: 8,
  },
  hourCol: {
    alignItems: 'center',
    minWidth: 56,
    marginRight: 14,
  },
  hourLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  hourIcon: {
    marginBottom: 4,
  },
  hourPop: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
  },
  hourTemp: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  muted: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    paddingVertical: 8,
  },
});
