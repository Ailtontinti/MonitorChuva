import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { agronomy as A } from '../../theme/agronomy';

interface Props {
  title?: string;
  onBack: () => void;
  /** Ignorado quando variant é "modal". */
  onOpenFullscreen?: () => void;
  variant?: 'screen' | 'modal';
}

export function RecentRainScreenHeader({
  title = 'Chuvas Recentes',
  onBack,
  onOpenFullscreen,
  variant = 'screen',
}: Props) {
  const isModal = variant === 'modal';
  return (
    <View
      style={[
        styles.bar,
        isModal && styles.barModal,
        !isModal && { borderBottomColor: A.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!isModal && onOpenFullscreen ? (
        <Pressable
          onPress={onOpenFullscreen}
          style={({ pressed }) => [styles.expandBtn, pressed && styles.expandBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Ver em tela cheia"
        >
          <Text
            style={styles.expandText}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Ver em tela cheia
          </Text>
        </Pressable>
      ) : (
        <View style={styles.expandPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: A.bgCard,
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barModal: {
    paddingTop: 16,
    borderBottomWidth: 0,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.65,
  },
  backIcon: {
    fontSize: 20,
    color: A.textPrimary,
  },
  title: {
    flex: 1,
    fontSize: A.fontTitleScreen,
    fontWeight: '600',
    color: A.textPrimary,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  expandBtn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 44,
    maxWidth: 118,
  },
  expandBtnPressed: {
    opacity: 0.65,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
    color: A.primary,
    textAlign: 'right',
    lineHeight: 15,
  },
  expandPlaceholder: {
    width: 118,
  },
});
