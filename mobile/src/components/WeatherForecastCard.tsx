import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { WeatherCurrent } from '../services/weather';
import { agronomy as A } from '../theme/agronomy';

interface Props {
  weather: WeatherCurrent | null;
  variant?: 'teaser' | 'full';
  onTeaserPress?: () => void;
}

function getRainForecastTeaser(weather: WeatherCurrent | null): string {
  if (!weather || weather.hours.length === 0) return 'Chuva próximas 6h: --';

  const nextHours = weather.hours.slice(0, 6);
  const maxPop = nextHours.reduce((max, hour) => Math.max(max, hour.pop), 0);
  return `Chuva próximas 6h: ${maxPop}%`;
}

export function WeatherForecastCard({ weather, variant = 'teaser', onTeaserPress }: Props) {
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

  return (
    <View
      style={{
        backgroundColor: A.weatherCardBg,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: A.textOnDark, fontSize: 14, fontWeight: '700' }}>Clima agora</Text>
      <Text style={{ color: A.textOnDark, fontSize: 32, fontWeight: '700', marginTop: 6 }}>
        {weather ? `${Math.round(weather.temp)}°` : '—'}
      </Text>
      <Text style={{ color: A.weatherCardSubtext, marginTop: 4 }}>
        {weather ? weather.description : 'Carregando...'}
      </Text>
    </View>
  );
}
