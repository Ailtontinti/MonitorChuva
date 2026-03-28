import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RainSummaryPoint } from '../services/dashboard';
import { agronomy as A } from '../theme/agronomy';
import { ActionButtons } from '../components/recentRainfall/ActionButtons';
import { RecentRainScreenHeader } from '../components/recentRainfall/Header';
import { PeriodFilter, type RainPeriodDays } from '../components/recentRainfall/PeriodFilter';
import { RainChart } from '../components/recentRainfall/RainChart';
import type { RainDayPoint } from '../components/recentRainfall/types';

function buildRainDays(windowDays: number, rainSummary: RainSummaryPoint[]): RainDayPoint[] {
  const days: RainDayPoint[] = [];
  const today = new Date();
  const byDate: Record<string, number> = {};
  rainSummary.forEach((s) => {
    byDate[s.date] = Number(s.totalMm);
  });
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    days.push({
      date: dateStr,
      label: `${day}/${month}`,
      totalMm: byDate[dateStr] ?? 0,
    });
  }
  return days;
}

interface Props {
  onBack: () => void;
  rainSummary: RainSummaryPoint[];
  rainSummaryDays: RainPeriodDays;
  onRainSummaryDaysChange: (d: RainPeriodDays) => void;
  onCompareAreas: () => void;
  onFilterPluviometer: () => void;
  onExportCsv: () => void;
}

export function RecentRainfallScreen({
  onBack,
  rainSummary,
  rainSummaryDays,
  onRainSummaryDaysChange,
  onCompareAreas,
  onFilterPluviometer,
  onExportCsv,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  const days = useMemo(
    () => buildRainDays(rainSummaryDays, rainSummary),
    [rainSummaryDays, rainSummary],
  );

  return (
    <View style={styles.screen}>
      <RecentRainScreenHeader
        onBack={onBack}
        onOpenFullscreen={() => setFullscreen(true)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <PeriodFilter value={rainSummaryDays} onChange={onRainSummaryDaysChange} />

          <View style={styles.chartHero}>
            <RainChart days={days} plotHeight={268} minBarColumnWidth={30} maxXLabels={7} />
          </View>

          <ActionButtons
            onCompareAreas={onCompareAreas}
            onFilterPluviometer={onFilterPluviometer}
            onExportCsv={onExportCsv}
          />
        </View>
      </ScrollView>

      <Modal
        visible={fullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={[styles.screen, { backgroundColor: A.bgCanvas }]}>
          <RecentRainScreenHeader
            variant="modal"
            title="Chuvas — tela cheia"
            onBack={() => setFullscreen(false)}
          />
          <View style={styles.modalBody}>
            <PeriodFilter value={rainSummaryDays} onChange={onRainSummaryDaysChange} />
            <RainChart days={days} plotHeight={340} minBarColumnWidth={32} maxXLabels={8} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: A.bgCanvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: A.border,
    shadowColor: A.shadowSm,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  chartHero: {
    marginTop: 16,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
});
