import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { agronomy as A } from '../theme/agronomy';

const LOGO = require('../../assets/logo.png');

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
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const subHide = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const scrollToPasswordField = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, keyboardOpen && styles.scrollContentKeyboard]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.card}>
          <View style={styles.logoHeader} collapsable={false}>
            <Image
              source={LOGO}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Logotipo AgroPluvi"
            />
            <Text
              style={styles.tituloApp}
              allowFontScaling
              accessibilityRole="header"
            >
              AgroPluvi
            </Text>
          </View>
          <Text style={styles.subtitulo}>Entre com seu e-mail e senha</Text>

          <View style={styles.inputWrap}>
            <MaterialIcons name="mail-outline" size={22} color={A.textMuted} style={styles.inputIconLeft} />
            <TextInput
              style={styles.inputWithIcons}
              placeholder="E-mail"
              placeholderTextColor={A.textMuted}
              value={email}
              onChangeText={(t) => onChangeEmail(t)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrap}>
            <MaterialIcons name="lock-outline" size={22} color={A.textMuted} style={styles.inputIconLeft} />
            <TextInput
              style={[styles.inputWithIcons, styles.inputWithRightIcon]}
              placeholder="Senha"
              placeholderTextColor={A.textMuted}
              value={password}
              onChangeText={(t) => onChangePassword(t)}
              secureTextEntry={!showPassword}
              editable={!loading}
              onFocus={scrollToPasswordField}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              disabled={loading}
              hitSlop={12}
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color={A.textMuted}
              />
            </Pressable>
          </View>

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
    backgroundColor: '#e3efd9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  scrollContentKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: A.bgCard,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(47, 111, 79, 0.08)',
    shadowColor: '#1a2f24',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  logoHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoImage: {
    width: 220,
    height: 130,
    alignSelf: 'center',
    marginBottom: 10,
  },
  tituloApp: {
    width: '100%',
    color: A.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.35,
  },
  subtitulo: {
    color: A.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.inputBg,
    borderWidth: 1,
    borderColor: A.inputBorder,
    borderRadius: 12,
    marginTop: 14,
    minHeight: 52,
  },
  inputIconLeft: {
    marginLeft: 14,
    marginRight: 4,
  },
  inputWithIcons: {
    flex: 1,
    color: A.textPrimary,
    fontSize: 17,
    paddingVertical: 14,
    paddingRight: 12,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 6,
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

