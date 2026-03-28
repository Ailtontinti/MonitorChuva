import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { agronomy as A } from '../theme/agronomy';

interface Props {
  loading: boolean;
  error: string;
  propertyName: string;
  latText: string;
  lngText: string;
  locationLabel: string;
  areaLabel: string;
  saveDisabled: boolean;
  onBack: () => void;
  onChangeName: (t: string) => void;
  onChangeLatText: (t: string) => void;
  onChangeLngText: (t: string) => void;
  onOpenMap: () => void;
  onImportKml: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function PropertyEditScreen({
  loading,
  error,
  propertyName,
  latText,
  lngText,
  locationLabel,
  areaLabel,
  saveDisabled,
  onBack,
  onChangeName,
  onChangeLatText,
  onChangeLngText,
  onOpenMap,
  onImportKml,
  onCancel,
  onSave,
}: Props) {
  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.link}>
          <Text style={styles.linkText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Editar propriedade</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Nome da propriedade"
          placeholderTextColor={A.textMuted}
          value={propertyName}
          onChangeText={onChangeName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Latitude (ex: -12.3456)"
          placeholderTextColor={A.textMuted}
          value={latText}
          onChangeText={onChangeLatText}
          keyboardType="numeric"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Longitude (ex: -56.7890)"
          placeholderTextColor={A.textMuted}
          value={lngText}
          onChangeText={onChangeLngText}
          keyboardType="numeric"
          editable={!loading}
        />

        <View style={{ marginTop: 12 }}>
          <Pressable style={styles.botaoSecundario} onPress={onOpenMap} disabled={loading}>
            <Text style={styles.botaoSecundarioTexto}>{locationLabel}</Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 8 }}>
          <Pressable style={styles.botaoSecundario} onPress={onImportKml} disabled={loading}>
            <Text style={styles.botaoSecundarioTexto}>Importar KML de área</Text>
          </Pressable>
          <Text style={styles.helperText}>{areaLabel}</Text>
        </View>

        {error ? <Text style={styles.erro}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable
            style={[styles.botao, saveDisabled && styles.botaoDisabled, { flex: 1 }]}
            onPress={onSave}
            disabled={saveDisabled || loading}
          >
            <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Salvar alterações'}</Text>
          </Pressable>

          <Pressable style={[styles.botaoSecundario, { flex: 1 }]} onPress={onCancel} disabled={loading}>
            <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
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
  helperText: { color: A.textMuted, fontSize: 14, marginTop: 8 },
  botao: {
    marginTop: 0,
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
    marginTop: 0,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: A.primary,
    alignItems: 'center',
  },
  botaoSecundarioTexto: { color: A.primary, fontSize: 18, fontWeight: '700' },
});

