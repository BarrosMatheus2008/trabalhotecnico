import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';

export default function LoginScreen({
  apiUrl,
  showAlert,
  onLoginSuccess,
  onIrCadastro,
  onVoltarVisitante
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const realizarLogin = async () => {
    if (!email || !senha) {
      showAlert('Atencao', 'Informe seu e-mail e sua senha para entrar.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        setEmail('');
        setSenha('');
        await onLoginSuccess(data);
        showAlert('Bem-vindo', 'Entrada realizada com sucesso!');
      } else {
        showAlert('Senha incorreta ou e-mail invalido', data.erro || 'Verifique seus dados e tente novamente.');
      }
    } catch (error) {
      showAlert('Erro de conexao', 'Nao foi possivel conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Entrar na Conta</Text>
          <Text style={styles.authSubtitle}>Acesse seu painel sincronizado com o MySQL.</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {carregando ? (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={{ marginTop: 6, color: '#64748B', fontSize: 13 }}>Autenticando...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={realizarLogin}>
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={onIrCadastro}>
            <Text style={styles.linkText}>Nao tem conta? Cadastre-se</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={onVoltarVisitante}>
            <Text style={styles.backText}>Voltar para a tela inicial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 36,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    width: '100%'
  },
  authTitle: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  authSubtitle: { fontSize: 14.5, color: '#64748B', marginBottom: 24, lineHeight: 22 },
  label: { fontSize: 13.5, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#2563EB', fontSize: 14.5, fontWeight: '600' },
  backText: { color: '#64748B', fontSize: 14 },
});