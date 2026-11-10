import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      showAlert('Atenção', 'Preencha todos os campos para se cadastrar!');
      return;
    }

    try {
      const response = await api.post('/register', { nome, email, senha });
      showAlert('Sucesso', response.data.message || 'Cadastro realizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      const mensagemErro = error.response?.data?.error || 'Erro ao realizar o cadastro.';
      showAlert('Erro no Cadastro', mensagemErro);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setNome}
      />

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

      <TouchableOpacity style={styles.botao} onPress={handleRegister} activeOpacity={0.8}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.linkVoltar}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9', padding: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  input: { width: '100%', maxWidth: 400, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  botao: { width: '100%', maxWidth: 400, backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkVoltar: { color: '#007bff', fontSize: 14, marginTop: 10 }
});
