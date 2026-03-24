import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ContextCard } from '../components/ContextCard';
import { RainfallRecord } from '../services/rainfallRecords';
import { agronomy as A } from '../theme/agronomy';

interface Props {
  organizationName: string;
  selectedPropertyName: string;
  selectedGaugeName: string;

  rainRecordsFilterDays: 7 | 30 | null;
  rainRecordsDateFilterIso: string | null;

  rainDateIso: string;
  rainAmount: string;
  rainRecords: RainfallRecord[];
  loading: boolean;
  error: string;
  successMessage?: string;

  editingRecordId: string | null;

  onBack: () => void;
  onSetFilterDays: (value: 7 | 30 | null) => void;
  onPickFilterDate: (date: Date) => void;

  onChangeRainDateIso: (value: string) => void;
  onChangeRainAmount: (value: string) => void;
  onSubmitRainRecord: () => void;

  onStartEditRainRecord: (record: RainfallRecord) => void;
  onCancelEdit: () => void;
  onDeleteRainRecord: (id: string) => void;
}

const monthNamesPt = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function formatDateDdMmYyyy(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Evita Invalid Date no DateTimePicker (crash comum no Android). */
function safeDate(iso: string): Date {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatTimeHm(date: Date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

function formatNowLabel(iso: string) {
  const d = safeDate(iso);
  return `Agora: ${formatDateDdMmYyyy(d)} ${formatTimeHm(d)}`;
}

function formatHistoryLine1(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = monthNamesPt[d.getMonth()] ?? '';
  return `${day} ${month} • ${formatTimeHm(d)}`;
}

function parseRainAmountToNumber(input: string) {
  const n = Number(input.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatRainAmountForInput(n: number) {
  return String(n).replace('.', ',');
}

function formatSource(source: string | null) {
  if (!source) return 'Manual';
  if (source === 'manual') return 'Manual';
  if (source === 'automatic') return 'Automático';
  return source;
}

function RainHistoryItem({
  record,
  onEdit,
  onDelete,
  disabled,
}: {
  record: RainfallRecord;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const triggeredRef = useRef(false);

  const editOpacity = translateX.interpolate({
    inputRange: [0, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const deleteOpacity = translateX.interpolate({
    inputRange: [-70, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabled) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        const clamped = Math.max(-90, Math.min(90, gestureState.dx));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled) return;
        if (triggeredRef.current) return;

        const dx = gestureState.dx;
        triggeredRef.current = true;
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start(() => {
          triggeredRef.current = false;
        });

        if (dx > 60) {
          onEdit();
        } else if (dx < -60) {
          onDelete();
        }
      },
    });
  }, [disabled, onDelete, onEdit, translateX]);

  return (
    <View style={styles.historyOuter}>
      <View style={styles.historyActionsRow} pointerEvents="none">
        <Animated.View style={[styles.historyActionEdit, { opacity: editOpacity }]}>
          <Text style={styles.historyActionText}>Editar</Text>
        </Animated.View>
        <Animated.View style={[styles.historyActionDelete, { opacity: deleteOpacity }]}>
          <Text style={styles.historyActionText}>Excluir</Text>
        </Animated.View>
      </View>

      <Animated.View style={[{ transform: [{ translateX }] }, styles.historyCard]} {...panResponder.panHandlers}>
        <Text style={styles.historyLine1}>{formatHistoryLine1(record.recordedAt)}</Text>
        <Text style={styles.historyLine2}>🌧️ {record.amountMm} mm</Text>
        <Text style={styles.historyLine3}>Fonte: {formatSource(record.source)}</Text>
      </Animated.View>
    </View>
  );
}

export function RainRecordsScreen({
  organizationName,
  selectedPropertyName,
  selectedGaugeName,
  rainRecordsFilterDays,
  rainRecordsDateFilterIso,
  rainDateIso,
  rainAmount,
  rainRecords,
  loading,
  error,
  successMessage,
  editingRecordId,
  onBack,
  onSetFilterDays,
  onPickFilterDate,
  onChangeRainDateIso,
  onChangeRainAmount,
  onSubmitRainRecord,
  onStartEditRainRecord,
  onCancelEdit,
  onDeleteRainRecord,
}: Props) {
  const isEditing = !!editingRecordId;
  const dateFilterDate = rainRecordsDateFilterIso ? new Date(rainRecordsDateFilterIso) : null;
  const isToday =
    dateFilterDate &&
    dateFilterDate.getFullYear() === new Date().getFullYear() &&
    dateFilterDate.getMonth() === new Date().getMonth() &&
    dateFilterDate.getDate() === new Date().getDate();

  const [showHeaderDatePicker, setShowHeaderDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [pendingEditDate, setPendingEditDate] = useState<Date | null>(null);

  const headerPickerValue = useMemo(() => {
    if (dateFilterDate && !Number.isNaN(dateFilterDate.getTime())) return dateFilterDate;
    return new Date();
  }, [dateFilterDate]);

  const editPickerValue = useMemo(() => safeDate(rainDateIso), [rainDateIso]);

  const handleQuickAdd = (delta: number) => {
    const current = parseRainAmountToNumber(rainAmount);
    const next = Math.max(0, current + delta);
    onChangeRainAmount(formatRainAmountForInput(next));
  };

  const primaryDisabled = loading || !rainAmount.trim();

  return (
    <View style={styles.tela}>
      <View style={styles.headerWrap}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={onBack} style={styles.backButton} disabled={loading}>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Chuva</Text>
          <View style={{ width: 70 }} />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterPill, isToday && styles.filterPillActive, styles.filterPillGap]}
            onPress={() => setShowHeaderDatePicker(true)}
            disabled={loading}
          >
            <Text style={[styles.filterText, isToday && styles.filterTextActive]}>
              {isToday ? 'Hoje ▼' : `${formatDateDdMmYyyy(dateFilterDate ?? new Date())} ▼`}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, rainRecordsFilterDays === 7 && styles.filterPillActive, styles.filterPillGap]}
            onPress={() => onSetFilterDays(7)}
            disabled={loading}
          >
            <Text style={[styles.filterText, rainRecordsFilterDays === 7 && styles.filterTextActive]}>7d</Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, rainRecordsFilterDays === 30 && styles.filterPillActive]}
            onPress={() => onSetFilterDays(30)}
            disabled={loading}
          >
            <Text style={[styles.filterText, rainRecordsFilterDays === 30 && styles.filterTextActive]}>30d</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ContextCard
          organizationName={organizationName}
          propertyName={selectedPropertyName}
          gaugeName={selectedGaugeName}
        />

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Registro</Text>

          {isEditing ? (
            <View style={styles.editingRow}>
              <Text style={styles.editingText}>Editando registro</Text>
              <Pressable onPress={onCancelEdit} style={styles.cancelButton} disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.dateRow}>
            <Text style={styles.dateValue}>{formatNowLabel(rainDateIso)}</Text>
            <Pressable
              style={[styles.editSmallButton, loading && styles.editSmallButtonDisabled]}
              onPress={() => setShowEditDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.editSmallButtonText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={A.textMuted}
              value={rainAmount}
              onChangeText={(t) => onChangeRainAmount(t)}
              keyboardType={Platform.OS === 'android' ? 'numeric' : 'decimal-pad'}
              editable={!loading}
              textAlign="center"
              maxLength={8}
            />
            <Text style={styles.unitText}>mm</Text>
          </View>

          <View style={styles.quickAddRow}>
            <Pressable style={[styles.quickAddButton, styles.quickAddButtonGap]} onPress={() => handleQuickAdd(5)} disabled={loading}>
              <Text style={styles.quickAddText}>+5</Text>
            </Pressable>
            <Pressable style={[styles.quickAddButton, styles.quickAddButtonGap]} onPress={() => handleQuickAdd(10)} disabled={loading}>
              <Text style={styles.quickAddText}>+10</Text>
            </Pressable>
            <Pressable style={styles.quickAddButton} onPress={() => handleQuickAdd(20)} disabled={loading}>
              <Text style={styles.quickAddText}>+20</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.primaryButton, primaryDisabled && styles.primaryButtonDisabled]}
            onPress={onSubmitRainRecord}
            disabled={primaryDisabled}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Salvando...' : '🌧️ Registrar chuva'}</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Histórico</Text>

          {rainRecords.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum registro no período selecionado.</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {rainRecords.map((r) => (
                <RainHistoryItem
                  key={r.id}
                  record={r}
                  disabled={loading}
                  onEdit={() => onStartEditRainRecord(r)}
                  onDelete={() => onDeleteRainRecord(r.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {showHeaderDatePicker ? (
        <DateTimePicker
          value={headerPickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
              setShowHeaderDatePicker(false);
            }
            if (event.type === 'dismissed') {
              if (Platform.OS === 'ios') setShowHeaderDatePicker(false);
              return;
            }
            if (event.type === 'set' && selectedDate) {
              onPickFilterDate(selectedDate);
            }
            if (Platform.OS === 'ios') setShowHeaderDatePicker(false);
          }}
        />
      ) : null}

      {showEditDatePicker ? (
        <DateTimePicker
          value={editPickerValue}
          mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
              setShowEditDatePicker(false);
            }
            if (event.type === 'dismissed') {
              if (Platform.OS === 'ios') setShowEditDatePicker(false);
              return;
            }
            if (event.type === 'set' && selectedDate) {
              if (Platform.OS === 'android') {
                setPendingEditDate(selectedDate);
                // Evita montar o picker de hora no mesmo tick (erro dismiss no Android/Expo Go).
                setTimeout(() => setShowEditTimePicker(true), 350);
              } else {
                onChangeRainDateIso(selectedDate.toISOString());
              }
            }
            if (Platform.OS === 'ios') setShowEditDatePicker(false);
          }}
        />
      ) : null}

      {showEditTimePicker ? (
        <DateTimePicker
          value={pendingEditDate ?? editPickerValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            if (Platform.OS === 'android') {
              setShowEditTimePicker(false);
            }
            if (event.type === 'dismissed') {
              if (Platform.OS === 'ios') setShowEditTimePicker(false);
              setPendingEditDate(null);
              return;
            }
            if (event.type === 'set' && selectedTime) {
              const base = pendingEditDate ? new Date(pendingEditDate) : safeDate(rainDateIso);
              const merged = new Date(base);
              merged.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
              onChangeRainDateIso(merged.toISOString());
            }
            setPendingEditDate(null);
            if (Platform.OS === 'ios') setShowEditTimePicker(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: A.bgCanvas,
  },
  headerWrap: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: A.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: A.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backText: {
    color: A.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: A.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: A.pillInactive,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.border,
  },
  filterPillGap: {
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: A.primary,
    borderColor: A.primary,
  },
  filterText: {
    color: A.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  filterTextActive: {
    color: A.textOnDark,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  sectionTitle: {
    color: A.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  editingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editingText: {
    color: A.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.border,
    backgroundColor: A.bgCard,
  },
  cancelButtonText: {
    color: A.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateValue: {
    flex: 1,
    color: A.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  editSmallButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: A.bgCard,
    borderWidth: 1,
    borderColor: A.border,
  },
  editSmallButtonDisabled: {
    opacity: 0.7,
  },
  editSmallButtonText: {
    color: A.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.inputBg,
    borderWidth: 1,
    borderColor: A.inputBorder,
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 14,
  },
  amountInput: {
    flex: 1,
    color: A.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    padding: 0,
    margin: 0,
  },
  unitText: {
    color: A.textSecondary,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  quickAddRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  quickAddButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: A.bgCard,
    borderWidth: 1,
    borderColor: A.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddButtonGap: {
    marginRight: 10,
  },
  quickAddText: {
    color: A.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: A.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: A.textOnDark,
    fontSize: 18,
    fontWeight: '900',
  },
  errorText: {
    color: A.error,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  successText: {
    color: A.success,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 10,
    color: A.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  historyOuter: {
    marginTop: 8,
    position: 'relative',
  },
  historyActionsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyActionEdit: {
    flex: 1,
    backgroundColor: A.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyActionDelete: {
    flex: 1,
    backgroundColor: A.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyActionText: {
    color: A.textOnDark,
    fontSize: 16,
    fontWeight: '900',
  },
  historyCard: {
    backgroundColor: A.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: A.border,
  },
  historyLine1: {
    color: A.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  historyLine2: {
    color: A.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  historyLine3: {
    color: A.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
});
