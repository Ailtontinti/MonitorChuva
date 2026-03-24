import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { WeatherForecastCard } from '../components/WeatherForecastCard';
import { RainSummaryPoint } from '../services/dashboard';
import { WeatherCurrent } from '../services/weather';
import { agronomy as A } from '../theme/agronomy';

interface DashboardUser {
  name: string;
  email: string;
  role?: 'owner' | 'admin' | 'user';
}

interface Props {
  user: DashboardUser | null;
  rainSummaryDays: 7 | 30 | 90;
  setRainSummaryDays: (value: 7 | 30 | 90) => void;
  rainSummary: RainSummaryPoint[];
  weather: WeatherCurrent | null;
  onGoTalhoes: () => void;
  onGoVisualizarDados: () => void;
  onGoInserirDados: () => void;
}

export function DashboardScreen({
  user,
  rainSummaryDays,
  setRainSummaryDays,
  rainSummary,
  weather,
  onGoTalhoes,
  onGoVisualizarDados,
  onGoInserirDados,
}: Props) {
  const showRainBars = rainSummaryDays === 7 || rainSummaryDays === 30;
  const maxRainValue = rainSummary.reduce((max, point) => Math.max(max, point.totalMm), 0);

  const formatRainDateLabel = (dateIso: string) => {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) return '--';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: A.bgCanvas }}>
      <View
        style={{
          paddingTop: 48,
          paddingBottom: 20,
          paddingHorizontal: 24,
          backgroundColor: A.bgHeader,
        }}
      >
        <Text style={{ color: A.textOnDark, fontSize: 22, fontWeight: '700' }}>AgroPluvi</Text>
        <Text style={{ color: A.textOnDarkMuted, fontSize: 14, marginTop: 2 }}>
          {user ? 'Proprietário da Plataforma' : 'Bem-vindo à plataforma'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: A.bgCard,
            borderRadius: 24,
            paddingVertical: 24,
            paddingHorizontal: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ color: A.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
            Bem-vindo!
          </Text>
          <Text style={{ color: A.textSecondary, fontSize: 14 }}>
            {user ? `Olá, ${user.name}!` : 'Faça login para começar.'}
          </Text>
        </View>

        <Pressable
          onPress={onGoTalhoes}
          style={{
            backgroundColor: A.accentFeature,
            borderRadius: 24,
            paddingVertical: 22,
            paddingHorizontal: 20,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: A.accentFeatureIcon,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>🏢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: A.textOnDark, fontSize: 18, fontWeight: '700' }}>Gerenciar Propriedades</Text>
            <Text style={{ color: A.textOnDarkMuted, fontSize: 13, marginTop: 4 }}>
              Cadastrar e administrar propriedades da fazenda
            </Text>
          </View>
        </Pressable>

        <View
          style={{
            backgroundColor: A.bgCard,
            borderRadius: 24,
            paddingVertical: 18,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: A.textPrimary, fontSize: 16, fontWeight: '700' }}>Resumo de chuva</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[7, 30, 90].map((d) => (
                <Pressable
                  key={`rs-${d}`}
                  onPress={() => setRainSummaryDays(d as 7 | 30 | 90)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    backgroundColor: rainSummaryDays === d ? A.primary : A.pillInactive,
                  }}
                >
                  <Text style={{ color: rainSummaryDays === d ? A.textOnDark : A.textPrimary, fontSize: 12 }}>
                    {d}d
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            {rainSummary.length === 0 ? (
              <Text style={{ color: A.textSecondary, fontSize: 13 }}>Sem dados no período.</Text>
            ) : showRainBars ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 170 }}>
                  {rainSummary.map((p) => {
                    const ratio = maxRainValue > 0 ? p.totalMm / maxRainValue : 0;
                    const barHeight = Math.max(8, Math.round(ratio * 108));
                    return (
                      <View key={p.date} style={{ width: 34, alignItems: 'center', marginRight: 8 }}>
                        <Text style={{ color: A.textPrimary, fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
                          {p.totalMm} mm
                        </Text>
                        <View
                          style={{
                            width: 20,
                            height: barHeight,
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            backgroundColor: A.chartBar,
                          }}
                        />
                        <Text style={{ color: A.textSecondary, fontSize: 10, marginTop: 6 }}>
                          {formatRainDateLabel(p.date)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              rainSummary.map((p) => (
                <View
                  key={p.date}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}
                >
                  <Text style={{ color: A.textSecondary, fontSize: 13 }}>
                    {new Date(p.date).toLocaleDateString()}
                  </Text>
                  <Text style={{ color: A.textPrimary, fontWeight: '600' }}>{p.totalMm} mm</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <WeatherForecastCard
          variant="teaser"
          weather={weather}
          onTeaserPress={onGoVisualizarDados}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: A.primary,
              alignItems: 'center',
              flex: 1,
            }}
            onPress={onGoVisualizarDados}
          >
            <Text style={{ color: A.primary, fontSize: 16, fontWeight: '600' }}>Visualizar dados</Text>
          </Pressable>
          <Pressable
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: A.primary,
              alignItems: 'center',
              flex: 1,
            }}
            onPress={onGoInserirDados}
          >
            <Text style={{ color: A.primary, fontSize: 16, fontWeight: '600' }}>Inserir dados</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}