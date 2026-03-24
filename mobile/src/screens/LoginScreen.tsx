import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { agronomy as A } from '../theme/agronomy';

export interface LoginScreenProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onGoToRegister: () => void;
}

export function LoginScreen({
  email,
  password,
  loading,
  error,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onGoToRegister,
}: LoginScreenProps) {
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
          <Text style={styles.subtitulo}>Entre com seu e-mail e senha</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={A.textMuted}
            value={email}
            onChangeText={(t) => onChangeEmail(t)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
            <Text style={styles.botaoTexto}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>

          <Pressable
            style={styles.linkBlock}
            onPress={onGoToRegister}
            disabled={loading}
          >
            <Text style={styles.linkText}>Criar conta</Text>
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
    color: '#f87171',
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

