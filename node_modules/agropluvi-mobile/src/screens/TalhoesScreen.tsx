import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Property } from '../services/properties';
import { agronomy as A } from '../theme/agronomy';

interface UserSummary {
  name: string;
  email: string;
  role?: 'owner' | 'admin' | 'user';
}

interface Props {
  user: UserSummary | null;
  loading: boolean;
  error: string;
  newPropertyName: string;
  properties: Property[];
  propertyLocationLabel: string;
  onBack: () => void;
  onChangePropertyName: (value: string) => void;
  onOpenPropertyMap: () => void;
  onCreateProperty: () => void;
  onSelectProperty: (id: string, name: string) => void;
  onGoRainMap: () => void;
}

export function TalhoesScreen({
  user,
  loading,
  error,
  newPropertyName,
  properties,
  propertyLocationLabel,
  onBack,
  onChangePropertyName,
  onOpenPropertyMap,
  onCreateProperty,
  onSelectProperty,
  onGoRainMap,
}: Props) {
  return (
    <View style={styles.tela}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.link}>
          <Text style={styles.linkText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Gerenciar Propriedades</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Propriedades</Text>
        {user && (
          <Text style={styles.subtitulo}>
            Olá, {user.name} ({user.email})
          </Text>
        )}
        <Text style={[styles.subtitulo, { fontSize: 15 }]}>
          Gerenciar varias propriedades.
        </Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.subtitulo}>Cadastrar nova propriedade</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da propriedade"
            placeholderTextColor={A.textMuted}
            value={newPropertyName}
            onChangeText={onChangePropertyName}
            editable={!loading}
          />
          <View style={{ marginTop: 12 }}>
            <Pressable style={[styles.botaoSecundario]} onPress={onOpenPropertyMap}>
              <Text style={styles.botaoSecundarioTexto}>{propertyLocationLabel}</Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.botao, loading && styles.botaoDisabled]}
            onPress={onCreateProperty}
            disabled={loading || !newPropertyName.trim()}
          >
            <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Salvar propriedade'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.erro}>{error}</Text> : null}

        <View style={{ marginTop: 32 }}>
          <Text style={styles.subtitulo}>Lista de propriedades</Text>
          {properties.length === 0 ? (
            <Text style={[styles.subtitulo, { marginTop: 8 }]}>Nenhuma propriedade cadastrada ainda.</Text>
          ) : (
            <>
              <ScrollView style={{ marginTop: 8, maxHeight: 280 }} nestedScrollEnabled>
                {properties.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.propertyCard}
                    onPress={() => onSelectProperty(p.id, p.name)}
                  >
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
                    <Text style={[styles.propertyCoords, { marginTop: 6 }]}>
                      Toque para ver os pluviometros vinculados →
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                style={[styles.botaoSecundario, { marginTop: 16 }]}
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
  titulo: { color: A.textPrimary, fontSize: 26, fontWeight: '700' },
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
});

