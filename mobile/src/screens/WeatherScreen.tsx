import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { agronomy as A } from '../theme/agronomy';
import { WeatherCurrent } from '../services/weather';

interface Props {
  weather: WeatherCurrent | null;
}

export function WeatherScreen({ weather }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: A.bgCanvas }}>
      
      {/* HEADER */}
      <View
        style={{
          backgroundColor: A.bgHeader,
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: A.textOnDark, fontSize: 20, fontWeight: '700' }}>
          Clima
        </Text>
        <Text style={{ color: A.textOnDarkMuted, marginTop: 4 }}>
          Dados meteorológicos detalhados
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* CARD PRINCIPAL */}
        <View style={styles.card}>
          <Text style={styles.temperature}>
            {weather ? Math.round(weather.temp) : '—'}°
          </Text>

          <Text style={styles.description}>
            {weather?.description ?? 'Carregando...'}
          </Text>

          <Text style={styles.minmax}>
            Máx. {weather ? Math.round(weather.tempMax) : '—'}° · 
            Mín. {weather ? Math.round(weather.tempMin) : '—'}°
          </Text>
        </View>

        {/* HORAS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Próximas horas</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(weather?.hours ?? []).map((h, i) => (
              <View key={i} style={styles.hourItem}>
                <Text style={styles.hourLabel}>
                  {i === 0 ? 'Agora' : new Date(h.time * 1000).getHours() + 'h'}
                </Text>

                <Text style={styles.hourTemp}>{Math.round(h.temp)}°</Text>

                <Text style={styles.hourPop}>{h.pop}%</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* DETALHES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes</Text>

          {[
            ['Sensação térmica', `${Math.round(weather?.feelsLike ?? 0)}°`],
            ['Umidade', `${weather?.humidity ?? 0}%`],
            ['Vento', `${Math.round(weather?.windSpeedKmH ?? 0)} km/h`],
            ['Pressão', `${weather?.pressure ?? 0} hPa`],
            ['UV', `${weather?.uvIndex ?? 0}`],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  temperature: {
    fontSize: 42,
    fontWeight: '700',
    color: A.primary,
  },

  description: {
    fontSize: A.fontBody,
    color: A.textSecondary,
    marginTop: 4,
  },

  minmax: {
    fontSize: A.fontCaption,
    color: A.textMuted,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: A.fontTitleCard,
    fontWeight: '700',
    color: A.textPrimary,
    marginBottom: 12,
  },

  hourItem: {
    marginRight: 16,
    alignItems: 'center',
  },

  hourLabel: {
    fontSize: A.fontCaption,
    color: A.textMuted,
  },

  hourTemp: {
    fontSize: A.fontBody,
    fontWeight: '600',
    color: A.textPrimary,
    marginTop: 4,
  },

  hourPop: {
    fontSize: A.fontSmall,
    color: A.primaryLight,
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: A.textSecondary,
  },

  value: {
    color: A.textPrimary,
    fontWeight: '600',
  },
};