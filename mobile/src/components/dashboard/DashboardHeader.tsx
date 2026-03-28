import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { agronomy as A } from '../../theme/agronomy';

const LOGO = require('../../../assets/logo.png');

interface Props {
  userFirstName: string | null;
  lastUpdated: Date;
  appName?: string;
}

function formatRelativeUpdated(last: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 0 || diffSec < 45) return 'Atualizado agora';
  if (diffMin < 1) return 'Atualizado há menos de 1 min';
  if (diffMin < 60) return `Atualizado há ${diffMin} min`;
  if (diffHours < 24) return `Atualizado há ${diffHours} h`;
  if (diffDays === 1) return 'Atualizado há 1 dia';
  return `Atualizado há ${diffDays} dias`;
}

export function DashboardHeader({ userFirstName, lastUpdated, appName = 'AgroPluvi' }: Props) {
  const insets = useSafeAreaInsets();
  const androidStatus =
    Platform.OS === 'android' ? (StatusBar.currentHeight != null ? StatusBar.currentHeight : 24) : 0;
  const topInset = Math.max(insets.top, androidStatus);
  const greeting = userFirstName ? `Olá, ${userFirstName} 👋` : 'Olá 👋';
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const relativeLabel = useMemo(() => formatRelativeUpdated(lastUpdated), [lastUpdated, tick]);

  return (
    <View style={[styles.wrap, { paddingTop: topInset + 10 }]}>
      <View style={styles.brandRow}>
        <Image
          source={LOGO}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel={`Logotipo ${appName}`}
        />
        <Text style={styles.brand} numberOfLines={1}>
          {appName}
        </Text>
      </View>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.updated}>{relativeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: A.bgHeader,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  brandLogo: {
    width: 72,
    height: 42,
    marginRight: 10,
  },
  brand: {
    color: A.primaryLight,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.35,
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: A.textOnDark,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  updated: {
    color: A.textOnDarkMuted,
    fontSize: 13,
    marginTop: 6,
    opacity: 0.7,
  },
});
