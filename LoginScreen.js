import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from 'react-native';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Função de alerta universal (funciona no celular e no navegador web)
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
      const response = await axios.post('http://localhost:3000/login', { email, senha });
      showAlert('Sucesso', response.data.message || 'Login efetuado com sucesso!');
      navigation.replace('Home', { usuario: response.data.usuario });
    } catch (error) {
      const mensagemErro = error.response?.data?.error || 'Erro ao conectar com o servidor.';
      showAlert('Erro no Login', mensagemErro);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle de Estudos</Text>
      <Text style={styles.subtitulo}>Faça login para continuar</Text>

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

      <TouchableOpacity style={styles.botao} onPress={handleLogin} activeOpacity={0.7}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
        <Text style={styles.linkCadastro}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9', padding: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: { width: '100%', maxWidth: 400, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  botao: { width: '100%', maxWidth: 400, backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkCadastro: { color: '#007bff', fontSize: 14, marginTop: 10 }
});