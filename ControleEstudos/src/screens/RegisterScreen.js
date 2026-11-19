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

export default function RegisterScreen({
  apiUrl,
  showAlert,
  onIrLogin,
  onVoltarVisitante
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelCadastro, setNivelCadastro] = useState('comum');
  const [carregando, setCarregando] = useState(false);

  const realizarCadastro = async () => {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nomeLimpo && !emailLimpo && !senha) {
      showAlert('Erro no cadastro', 'Preencha Nome, E-mail e Senha para criar sua conta.');
      return;
    }
    if (!nomeLimpo) {
      showAlert('Erro no campo Nome', 'Informe o seu nome para continuar.');
      return;
    }
    if (nomeLimpo.length < 2) {
      showAlert('Erro no campo Nome', 'O nome precisa ter pelo menos 2 caracteres.');
      return;
    }
    if (!emailLimpo) {
      showAlert('Erro no campo E-mail', 'Informe um e-mail valido.');
      return;
    }
    if (!emailRegex.test(emailLimpo)) {
      showAlert('Erro no campo E-mail', 'Formato de e-mail invalido. Exemplo: usuario@email.com');
      return;
    }
    if (!senha) {
      showAlert('Erro no campo Senha', 'Digite uma senha para sua conta.');
      return;
    }
    if (senha.length < 4) {
      showAlert('Erro no campo Senha', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeLimpo,
          email: emailLimpo,
          senha,
          nivel: nivelCadastro
        })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const tituloSucesso =
          data.status_aprovacao === 'pendente' ? 'Aguardando Aprovacao' : 'Sucesso';
        showAlert(
          tituloSucesso,
          data.mensagem || 'Conta cadastrada com sucesso! Faca o seu login.',
          () => {
            setNome('');
            setEmail('');
            setSenha('');
            setNivelCadastro('comum');
            onIrLogin();
          }
        );
      } else {
        showAlert(
          `Erro no cadastro (${response.status})`,
          data.erro || 'Nao foi possivel concluir o cadastro. Verifique os dados informados.'
        );
      }
    } catch (error) {
      showAlert(
        'Erro de conexao com a API',
        `Nao foi possivel alcancar ${apiUrl}/register. Confira se o server.js esta rodando e se o IPv4 esta correto.`
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Criar Conta</Text>
          <Text style={styles.authSubtitle}>
            Cadastre-se e escolha o nivel de acesso (se ja houver admin, novos admins exigem aprovacao).
          </Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#94A3B8"
            value={nome}
            onChangeText={setNome}
          />

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
            placeholder="Crie uma senha"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Nivel de Usuario</Text>
          <View style={styles.optionsRow}>
            {[
              { key: 'comum', label: 'Estudante (comum)' },
              { key: 'admin', label: 'Coordenador (admin)' }
            ].map((nv) => (
              <TouchableOpacity
                key={nv.key}
                style={[styles.optionChip, nivelCadastro === nv.key && styles.optionChipActive]}
                onPress={() => setNivelCadastro(nv.key)}
              >
                <Text style={[styles.optionText, nivelCadastro === nv.key && styles.optionTextActive]}>
                  {nv.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {carregando ? (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={{ marginTop: 6, color: '#64748B', fontSize: 13 }}>Cadastrando...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={realizarCadastro}>
              <Text style={styles.primaryButtonText}>Cadastrar Conta</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={onIrLogin}>
            <Text style={styles.linkText}>Ja tem conta? Fazer login</Text>
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
  optionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  optionChip: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  optionChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionText: { fontSize: 13.5, fontWeight: '600', color: '#475569' },
  optionTextActive: { color: '#FFFFFF' },
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