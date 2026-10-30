import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';

export default function ProfileScreen({ route, navigation }) {
  const usuario = route.params?.usuario || { id: 1, nome: 'Usuário', email: 'email@teste.com', nivel: 'usuario' };
  const [novaSenha, setNovaSenha] = useState('');

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleAlterarSenha = async () => {
    if (!novaSenha.trim()) {
      showAlert('Atenção', 'Digite a nova senha antes de salvar.');
      return;
    }
    try {
      await axios.put('http://localhost:3000/usuarios/senha', { usuarioId: usuario.id, novaSenha });
      showAlert('Sucesso', 'Sua senha foi alterada com sucesso!');
      setNovaSenha('');
    } catch (error) {
      showAlert('Erro', 'Não foi possível alterar a senha.');
    }
  };

  // Função de Logout corrigida e Direta
  const handleLogout = () => {
    const confirmar = Platform.OS === 'web' 
      ? window.confirm('Deseja realmente terminar a sessão?') 
      : true;

    if (Platform.OS === 'web' && confirmar) {
      navigation.replace('Login');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Sair da Conta',
        'Deseja realmente terminar a sessão?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sim', 
            onPress: () => navigation.replace('Login') 
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarTexto}>👤</Text>
      </View>

      <Text style={styles.nome}>{usuario.nome}</Text>
      <Text style={styles.email}>{usuario.email}</Text>
      <Text style={styles.nivel}>Nível de Acesso: {usuario.nivel}</Text>

      <View style={styles.secaoSenha}>
        <Text style={styles.secaoTitulo}>Alterar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
        />
        <TouchableOpacity style={styles.botaoSenha} onPress={handleAlterarSenha} activeOpacity={0.7}>
          <Text style={styles.textoBotao}>Atualizar Senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.textoBotaoLogout}>Sair da Conta (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20, alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTexto: { fontSize: 40 },
  nome: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 16, color: '#666', marginBottom: 5 },
  nivel: { fontSize: 14, color: '#28a745', fontWeight: 'bold', marginBottom: 25 },
  secaoSenha: { width: '100%', maxWidth: 400, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 25 },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { backgroundColor: '#f4f6f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  botaoSenha: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center' },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  botaoLogout: { width: '100%', maxWidth: 400, backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center' },
  textoBotaoLogout: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});