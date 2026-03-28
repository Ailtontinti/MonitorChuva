import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView as ContextSafeAreaView } from 'react-native-safe-area-context';

import { DashboardActionButtons } from '../components/dashboard/DashboardActionButtons';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { PropertyManageCard } from '../components/dashboard/PropertyManageCard';
import { RainSummaryChartCard } from '../components/dashboard/RainSummaryChartCard';
import { TodayRainHighlight } from '../components/dashboard/TodayRainHighlight';
import { WeatherNowCard } from '../components/dashboard/WeatherNowCard';
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

function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return toLocalYmd(date);
}

function findMmForDay(points: RainSummaryPoint[], dayKey: string): number | null {
  const hit = points.find((p) => normalizeDayKey(p.date) === dayKey);
  return hit ? hit.totalMm : null;
}

function buildVsFromWeather(weather: WeatherCurrent | null): string | null {
  if (!weather || typeof weather.rainTodayMm !== 'number' || weather.rainYesterdayMm == null) return null;
  const diff = weather.rainTodayMm - weather.rainYesterdayMm;
  if (Math.abs(diff) < 0.05) return 'Igual a ontem';
  if (diff > 0) return `+${diff.toFixed(1)} mm vs ontem`;
  return `${diff.toFixed(1)} mm vs ontem`;
}

function buildVsPreviousDay(rainSummary: RainSummaryPoint[]): string | null {
  const now = new Date();
  const todayKey = toLocalYmd(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterdayKey = toLocalYmd(y);

  const mmToday = findMmForDay(rainSummary, todayKey);
  const mmYest = findMmForDay(rainSummary, yesterdayKey);
  if (mmToday === null && mmYest === null) return null;
  const t = mmToday ?? 0;
  if (mmYest === null) return null;
  const diff = t - mmYest;
  if (Math.abs(diff) < 0.05) return 'Igual a ontem';
  if (diff > 0) return `+${diff.toFixed(1)} mm vs ontem`;
  return `${diff.toFixed(1)} mm vs ontem`;
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
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  useEffect(() => {
    setLastUpdated(new Date());
  }, [rainSummary, weather, rainSummaryDays]);

  const userFirstName = useMemo(() => {
    if (!user?.name?.trim()) return null;
    return user.name.trim().split(/\s+/)[0] ?? null;
  }, [user?.name]);

  const formatRainDateLabel = (dateIso: string) => {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) return '--';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const now = new Date();
  const todayKey = toLocalYmd(now);
  const mmToday = findMmForDay(rainSummary, todayKey);
  const mmTodayDisplay =
    weather != null && typeof weather.rainTodayMm === 'number' ? weather.rainTodayMm : mmToday ?? 0;

  const vsPreviousDay = (() => {
    const w = buildVsFromWeather(weather);
    if (w != null) return w;
    if (weather?.rainFromGps) return null;
    return buildVsPreviousDay(rainSummary);
  })();

  const canUseContextSafeArea = typeof ContextSafeAreaView === 'function';

  if (!canUseContextSafeArea) {
    return (
      <View style={styles.root}>
        <DashboardHeader userFirstName={userFirstName} lastUpdated={lastUpdated} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TodayRainHighlight
            mmToday={mmTodayDisplay}
            vsPreviousDay={vsPreviousDay}
            locationHint={weather?.rainFromGps ? 'Com base na sua localização (GPS)' : undefined}
          />

          <PropertyManageCard onPress={onGoTalhoes} />

          <RainSummaryChartCard
            rainSummaryDays={rainSummaryDays}
            setRainSummaryDays={setRainSummaryDays}
            rainSummary={rainSummary}
            formatRainDateLabel={formatRainDateLabel}
          />

          <WeatherNowCard weather={weather} onPress={onGoVisualizarDados} />

          <DashboardActionButtons onInserirDados={onGoInserirDados} onVisualizarDados={onGoVisualizarDados} />
        </ScrollView>
      </View>
    );
  }

  return (
    <ContextSafeAreaView style={styles.root} edges={['bottom']}>
      <DashboardHeader userFirstName={userFirstName} lastUpdated={lastUpdated} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TodayRainHighlight
          mmToday={mmTodayDisplay}
          vsPreviousDay={vsPreviousDay}
          locationHint={weather?.rainFromGps ? 'Com base na sua localização (GPS)' : undefined}
        />

        <PropertyManageCard onPress={onGoTalhoes} />

        <RainSummaryChartCard
          rainSummaryDays={rainSummaryDays}
          setRainSummaryDays={setRainSummaryDays}
          rainSummary={rainSummary}
          formatRainDateLabel={formatRainDateLabel}
        />

        <WeatherNowCard weather={weather} onPress={onGoVisualizarDados} />

        <DashboardActionButtons onInserirDados={onGoInserirDados} onVisualizarDados={onGoVisualizarDados} />
      </ScrollView>
    </ContextSafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: A.bgHeader,
  },
  scroll: {
    flex: 1,
    backgroundColor: A.bgCanvas,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: A.bgCanvas,
  },
});
