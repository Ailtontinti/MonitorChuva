import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Property } from '../services/properties';
import { agronomy as A } from '../theme/agronomy';

const HEADER_SIDE_WIDTH = 88;

interface Props {
  loading: boolean;
  error: string;
  newPropertyName: string;
  properties: Property[];
  propertyLocationLabel: string;
  propertyAreaLabel: string;
  onBack: () => void;
  onChangePropertyName: (value: string) => void;
  onOpenPropertyMap: () => void;
  onCreateProperty: () => void;
  onImportPropertyKml: () => void;
  onSelectProperty: (id: string, name: string) => void;
  onStartEditProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  onGoRainMap: () => void;
}

export function TalhoesScreen({
  loading,
  error,
  newPropertyName,
  properties,
  propertyLocationLabel,
  propertyAreaLabel,
  onBack,
  onChangePropertyName,
  onOpenPropertyMap,
  onCreateProperty,
  onImportPropertyKml,
  onSelectProperty,
  onStartEditProperty,
  onDeleteProperty,
  onGoRainMap,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.tela}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={[styles.headerSide, { width: HEADER_SIDE_WIDTH }]}>
          <Pressable onPress={onBack} style={styles.link} hitSlop={8}>
            <Text style={styles.linkText}>Voltar</Text>
          </Pressable>
        </View>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            Gerenciar Propriedades
          </Text>
        </View>
        <View style={{ width: HEADER_SIDE_WIDTH }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cadastrar nova propriedade</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da propriedade"
            placeholderTextColor={A.textMuted}
            value={newPropertyName}
            onChangeText={onChangePropertyName}
            editable={!loading}
          />
          <Pressable style={styles.botaoSecundario} onPress={onOpenPropertyMap}>
            <Text style={styles.botaoSecundarioTexto} numberOfLines={2}>
              {propertyLocationLabel}
            </Text>
          </Pressable>
          <Pressable style={styles.botaoSecundarioTight} onPress={onImportPropertyKml}>
            <Text style={styles.botaoSecundarioTexto}>Importar KML de área</Text>
          </Pressable>
          <Text style={styles.areaHint}>{propertyAreaLabel}</Text>
          <Pressable
            style={[styles.botao, loading && styles.botaoDisabled]}
            onPress={onCreateProperty}
            disabled={loading || !newPropertyName.trim()}
          >
            <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Salvar propriedade'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.erro}>{error}</Text> : null}

        <View style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Lista de propriedades</Text>
          {properties.length === 0 ? (
            <Text style={styles.emptyList}>Nenhuma propriedade cadastrada ainda.</Text>
          ) : (
            <>
              {properties.map((p) => (
                <View key={p.id} style={styles.propertyCard}>
                  <View style={styles.propertyRow}>
                    <View style={styles.propertyMain}>
                      <Text style={styles.propertyName}>{p.name}</Text>
                      {p.description ? <Text style={styles.propertyDescription}>{p.description}</Text> : null}
                      {p.latitude != null &&
                      p.longitude != null &&
                      Number.isFinite(Number(p.latitude)) &&
                      Number.isFinite(Number(p.longitude)) ? (
                        <Text style={styles.propertyCoords}>
                          {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                        </Text>
                      ) : null}

                      <Pressable onPress={() => onSelectProperty(p.id, p.name)} style={styles.linkPluvio}>
                        <Text style={styles.linkPluvioText}>Ver pluviômetros vinculados →</Text>
                      </Pressable>
                    </View>

                    <View style={styles.propertyActions}>
                      <Pressable
                        onPress={() => onStartEditProperty(p)}
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        disabled={loading}
                      >
                        <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>Editar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            'Confirmar exclusão',
                            `Excluir "${p.name}"?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Excluir', style: 'destructive', onPress: () => onDeleteProperty(p.id) },
                            ],
                            { cancelable: true },
                          );
                        }}
                        style={[styles.actionButton, styles.actionButtonDanger]}
                        disabled={loading}
                      >
                        <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Excluir</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              <Pressable
                style={[styles.botaoSecundario, styles.botaoSecundarioAfterList]}
                onPress={onGoRainMap}
                disabled={properties.length === 0}
              >
                <Text style={styles.botaoSecundarioTexto}>Ver mapa de chuva</Text>
              </Pressable>
            </>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 14,
    backgroundColor: A.bgCard,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: A.border,
  },
  headerSide: {
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerTitle: { color: A.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  link: { paddingVertical: 10, paddingHorizontal: 8 },
  linkText: { color: A.primary, fontSize: 17, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 36 },
  section: { marginTop: 0 },
  sectionLast: { marginTop: 32 },
  sectionTitle: {
    color: A.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: A.inputBg,
    borderWidth: 1,
    borderColor: A.inputBorder,
    borderRadius: 10,
    color: A.textPrimary,
    fontSize: 17,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  erro: { color: A.error, fontSize: 16, marginTop: 12, textAlign: 'center' },
  botao: {
    marginTop: 20,
    backgroundColor: A.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    width: '100%',
  },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: A.textOnDark, fontSize: 17, fontWeight: '700' },
  botaoSecundario: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.primary,
    backgroundColor: A.bgCard,
    alignItems: 'center',
  },
  botaoSecundarioTight: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.primary,
    backgroundColor: A.bgCard,
    alignItems: 'center',
  },
  botaoSecundarioAfterList: {
    marginTop: 20,
  },
  botaoSecundarioTexto: { color: A.primary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  areaHint: {
    color: A.textMuted,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyList: { color: A.textSecondary, fontSize: 16, marginTop: 10, lineHeight: 22 },
  propertyCard: {
    backgroundColor: A.bgCard,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: A.border,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyMain: { flex: 1, marginRight: 12, minWidth: 0 },
  propertyName: { color: A.textPrimary, fontSize: 17, fontWeight: '700' },
  propertyDescription: { color: A.textSecondary, fontSize: 15, marginTop: 4 },
  propertyCoords: { color: A.textMuted, fontSize: 14, marginTop: 6 },
  linkPluvio: { paddingVertical: 6, alignSelf: 'flex-start', marginTop: 2 },
  linkPluvioText: { color: A.primary, fontSize: 14, fontWeight: '600' },
  propertyActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionButton: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 84,
    backgroundColor: A.bgCard,
  },
  actionButtonPrimary: { borderColor: A.primary },
  actionButtonDanger: { borderColor: A.error },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonTextPrimary: { color: A.primary },
  actionButtonTextDanger: { color: A.error },
});

