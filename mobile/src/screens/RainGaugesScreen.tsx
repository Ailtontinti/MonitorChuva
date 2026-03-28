import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RainGauge } from '../services/rainGauges';
import { agronomy as A } from '../theme/agronomy';

interface Props {
  selectedPropertyName: string;
  loading: boolean;
  error: string;
  newGaugeName: string;
  gaugeLocationLabel: string;
  rainGauges: RainGauge[];
  onBack: () => void;
  onChangeGaugeName: (value: string) => void;
  onOpenGaugeMap: () => void;
  onCreateRainGauge: () => void;
  onSelectGauge: (gauge: RainGauge) => void;
  editingGaugeId: string | null;
  editGaugeName: string;
  editGaugeLatText: string;
  editGaugeLngText: string;
  onStartEditGauge: (gauge: RainGauge) => void;
  onCancelEditGauge: () => void;
  onSaveEditGauge: () => void;
  onDeleteGauge: (gauge: RainGauge) => void;
  onChangeEditGaugeName: (value: string) => void;
  onChangeEditGaugeLatText: (value: string) => void;
  onChangeEditGaugeLngText: (value: string) => void;
}

export function RainGaugesScreen({
  selectedPropertyName,
  loading,
  error,
  newGaugeName,
  gaugeLocationLabel,
  rainGauges,
  onBack,
  onChangeGaugeName,
  onOpenGaugeMap,
  onCreateRainGauge,
  onSelectGauge,
  editingGaugeId,
  editGaugeName,
  editGaugeLatText,
  editGaugeLngText,
  onStartEditGauge,
  onCancelEditGauge,
  onSaveEditGauge,
  onDeleteGauge,
  onChangeEditGaugeName,
  onChangeEditGaugeLatText,
  onChangeEditGaugeLngText,
}: Props) {
  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.link}>
          <Text style={styles.linkText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pluviômetros</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitulo}>Talhão: {selectedPropertyName}</Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.subtitulo}>Cadastrar pluviômetro</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do pluviômetro"
            placeholderTextColor={A.textMuted}
            value={newGaugeName}
            onChangeText={onChangeGaugeName}
            editable={!loading}
          />
          <View style={{ marginTop: 12 }}>
            <Pressable style={[styles.botaoSecundario]} onPress={onOpenGaugeMap}>
              <Text style={styles.botaoSecundarioTexto}>{gaugeLocationLabel}</Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.botao, loading && styles.botaoDisabled]}
            onPress={onCreateRainGauge}
            disabled={loading || !newGaugeName.trim()}
          >
            <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Salvar pluviômetro'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.erro}>{error}</Text> : null}

        <View style={{ marginTop: 32 }}>
          <Text style={styles.subtitulo}>Lista de pluviômetros</Text>
          {rainGauges.length === 0 ? (
            <Text style={[styles.subtitulo, { marginTop: 8 }]}>Nenhum pluviômetro neste talhão.</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {rainGauges.map((g) => (
                <Pressable key={g.id} style={styles.propertyCard} onPress={() => onSelectGauge(g)}>
                  <Text style={styles.propertyName}>{g.name}</Text>
                  {g.serialNumber ? (
                    <Text style={styles.propertyDescription}>Série: {g.serialNumber}</Text>
                  ) : null}
                  <Text style={styles.propertyCoords}>Status: {g.status}</Text>
                  {g.latitude != null && g.longitude != null ? (
                    <Text style={styles.propertyCoords}>
                      Localização: {Number(g.latitude).toFixed(4)}, {Number(g.longitude).toFixed(4)}
                    </Text>
                  ) : null}
                  <Text style={[styles.propertyCoords, { marginTop: 6 }]}>
                    Toque para registrar chuva →
                  </Text>

                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={(event) => {
                        event.stopPropagation();
                        onStartEditGauge(g);
                      }}
                    >
                      <Text style={styles.actionBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      onPress={(event) => {
                        event.stopPropagation();
                        onDeleteGauge(g);
                      }}
                    >
                      <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Excluir</Text>
                    </Pressable>
                  </View>

                  {editingGaugeId === g.id ? (
                    <View style={styles.editBox}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nome do pluviômetro"
                        placeholderTextColor={A.textMuted}
                        value={editGaugeName}
                        onChangeText={onChangeEditGaugeName}
                        editable={!loading}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Latitude"
                        placeholderTextColor={A.textMuted}
                        value={editGaugeLatText}
                        onChangeText={onChangeEditGaugeLatText}
                        editable={!loading}
                        keyboardType="numbers-and-punctuation"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Longitude"
                        placeholderTextColor={A.textMuted}
                        value={editGaugeLngText}
                        onChangeText={onChangeEditGaugeLngText}
                        editable={!loading}
                        keyboardType="numbers-and-punctuation"
                      />
                      <View style={styles.cardActions}>
                        <Pressable style={styles.actionBtn} onPress={onCancelEditGauge}>
                          <Text style={styles.actionBtnText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, styles.actionBtnPrimary]}
                          onPress={onSaveEditGauge}
                          disabled={loading}
                        >
                          <Text style={[styles.actionBtnText, styles.actionBtnPrimaryText]}>
                            {loading ? 'Salvando...' : 'Salvar'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: A.bgCanvas },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: A.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: A.border,
  },
  headerTitle: { color: A.textPrimary, fontSize: 22, fontWeight: '700' },
  link: { paddingVertical: 8, paddingHorizontal: 12 },
  linkText: { color: A.primary, fontSize: 18 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  subtitulo: { color: A.textSecondary, fontSize: 18, marginTop: 8 },
  input: {
    backgroundColor: A.inputBg,
    borderWidth: 1,
    borderColor: A.inputBorder,
    borderRadius: 8,
    color: A.textPrimary,
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  erro: { color: A.error, fontSize: 16, marginTop: 12, textAlign: 'center' },
  botao: {
    marginTop: 24,
    backgroundColor: A.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: A.textOnDark, fontSize: 18, fontWeight: '700' },
  botaoSecundario: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: A.primary,
    alignItems: 'center',
  },
  botaoSecundarioTexto: { color: A.primary, fontSize: 18, fontWeight: '700' },
  propertyCard: {
    backgroundColor: A.bgCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: A.border,
  },
  propertyName: { color: A.textPrimary, fontSize: 18, fontWeight: '700' },
  propertyDescription: { color: A.textSecondary, fontSize: 16, marginTop: 4 },
  propertyCoords: { color: A.textMuted, fontSize: 14, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    borderWidth: 1,
    borderColor: A.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: A.bgCanvas,
  },
  actionBtnText: { color: A.textPrimary, fontSize: 14, fontWeight: '600' },
  actionBtnDanger: {
    borderColor: A.error,
    backgroundColor: '#fdf0ed',
  },
  actionBtnDangerText: { color: A.error },
  actionBtnPrimary: {
    borderColor: A.primary,
    backgroundColor: A.primary,
  },
  actionBtnPrimaryText: { color: A.textOnDark },
  editBox: { marginTop: 12 },
});

