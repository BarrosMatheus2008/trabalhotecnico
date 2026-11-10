import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from 'react-native';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      showAlert('Atenção', 'Por favor, preencha o e-mail e a senha!');
      return;
    }

    try {
      const response = await api.post('/login', { email, senha });
      const { message, token, usuario } = response.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      showAlert('Sucesso', message || 'Login efetuado com sucesso!');
      navigation.replace('Home', { usuario, token });
    } catch (error) {
      const mensagemErro = error.response?.data?.error || 'Erro ao conectar com o servidor.';
      showAlert('Erro no Login', mensagemErro);
    }
  };

  return (
    <View style={styles.container}>
      {/* Clique no título leva para a tela de organização das matérias */}
      <TouchableOpacity 
        onPress={() => {
          const usuarioVisitante = { id: 0, nome: 'Visitante', email: 'visitante@estudos.com', nivel: 'visitante' };
          navigation.navigate('Home', { usuario: usuarioVisitante });
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.titulo}>Controle de Estudos 📚</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitulo}>Plataforma de Gestão Acadêmica</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin} activeOpacity={0.8}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.botaoSobre} 
        onPress={() => navigation.navigate('About')} 
        activeOpacity={0.8}
      >
        <Text style={styles.textoBotaoSobre}>ℹ️ Conhecer o Aplicativo (Sobre)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
        <Text style={styles.linkCadastro}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9', padding: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginBottom: 5 },
  subtitulo: { fontSize: 15, color: '#666', marginBottom: 25 },
  input: { width: '100%', maxWidth: 400, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  botao: { width: '100%', maxWidth: 400, backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoSobre: { width: '100%', maxWidth: 400, backgroundColor: '#6c757d', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  textoBotaoSobre: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkCadastro: { color: '#007bff', fontSize: 14, marginTop: 10 }
});