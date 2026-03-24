import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { agronomy as A } from '../theme/agronomy';

export interface RegisterScreenProps {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onChangeOrganizationName: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onGoToLogin: () => void;
}

export function RegisterScreen({
  organizationName,
  name,
  email,
  password,
  loading,
  error,
  onChangeOrganizationName,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onGoToLogin,
}: RegisterScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>AgroPluvi</Text>
          <Text style={styles.subtitulo}>Crie sua organização e conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome da organização"
            placeholderTextColor={A.textMuted}
            value={organizationName}
            onChangeText={(t) => onChangeOrganizationName(t)}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor={A.textMuted}
            value={name}
            onChangeText={(t) => onChangeName(t)}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={A.textMuted}
            value={email}
            onChangeText={(t) => onChangeEmail(t)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={A.textMuted}
            value={password}
            onChangeText={(t) => onChangePassword(t)}
            secureTextEntry
            editable={!loading}
          />

          {error ? <Text style={styles.erro}>{error}</Text> : null}

          <Pressable
            style={[styles.botao, loading && styles.botaoDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.botaoTexto}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkBlock}
            onPress={onGoToLogin}
            disabled={loading}
          >
            <Text style={styles.linkText}>Já tenho conta. Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: A.bgCanvas,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 20,
    padding: 20,
    shadowColor: A.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
  logo: {
    color: A.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    color: A.textSecondary,
    fontSize: 18,
    marginTop: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
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
  erro: {
    color: A.error,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  botao: {
    marginTop: 24,
    backgroundColor: A.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botaoDisabled: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: A.textOnDark,
    fontSize: 18,
    fontWeight: '600',
  },
  linkBlock: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: A.primary,
    fontSize: 18,
  },
});

