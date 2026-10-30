import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ route, navigation }) {
  const [estudos, setEstudos] = useState([]);
  
  // Captura o usuário logado com segurança (com fallback padrão caso venha vazio)
  const usuario = route.params?.usuario || { id: 1, nome: 'Usuário' };

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Configuração do Cabeçalho Superior
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <Text style={styles.headerTitulo}>Controle de Estudos ℹ️</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile', { usuario })} 
          style={styles.headerPerfilBotao}
        >
          <Text style={styles.headerPerfilTexto}>👤 {usuario.nome}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, usuario]);

  // Carrega os estudos do usuário
  const carregarEstudos = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/estudos/usuario/${usuario.id}`);
      setEstudos(response.data);
    } catch (error) {
      showAlert('Erro', 'Não foi possível carregar os seus estudos.');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarEstudos();
    });
    return unsubscribe;
  }, [navigation]);

  // Função de Exclusão Corrigida e Compatível com Web/Mobile
  const handleExcluir = async (idEstudo) => {
    if (!idEstudo) {
      showAlert('Erro', 'ID do estudo inválido.');
      return;
    }

    // Confirmação universal para Web e Mobile
    const confirmar = Platform.OS === 'web' 
      ? window.confirm('Tem certeza que deseja excluir este estudo?') 
      : true;

    if (Platform.OS === 'web' && !confirmar) return;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Confirmação',
        'Tem certeza que deseja excluir este estudo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => executarExclusao(idEstudo)
          }
        ]
      );
    } else {
      executarExclusao(idEstudo);
    }
  };

  const executarExclusao = async (idEstudo) => {
    try {
      await axios.delete(`http://localhost:3000/estudos/${idEstudo}`);
      showAlert('Sucesso', 'Estudo excluído com sucesso!');
      carregarEstudos();
    } catch (error) {
      showAlert('Erro', 'Não foi possível excluir o estudo no servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.botaoNovo} 
        onPress={() => navigation.navigate('Form', { usuarioId: usuario.id })}
      >
        <Text style={styles.textoBotaoNovo}>+ Cadastrar Novo Estudo</Text>
      </TouchableOpacity>

      <FlatList
        data={estudos}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.disciplina}>{item.disciplina}</Text>
            <Text style={styles.conteudo}>Conteúdo: {item.conteudo}</Text>
            <Text style={styles.horas}>Horas: {item.horasEstudadas}h</Text>
            <Text style={styles.status}>Status: {item.status}</Text>

            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={styles.botaoEditar} 
                onPress={() => navigation.navigate('Form', { estudo: item, usuarioId: usuario.id })}
              >
                <Text style={styles.textoBotaoAcao}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.botaoExcluir} 
                onPress={() => handleExcluir(item.id)}
              >
                <Text style={styles.textoBotaoAcao}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
  headerTitulo: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
  headerPerfilBotao: { backgroundColor: '#e9ecef', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  headerPerfilTexto: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  botaoNovo: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  textoBotaoNovo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  disciplina: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  conteudo: { fontSize: 14, color: '#666', marginBottom: 3 },
  horas: { fontSize: 14, color: '#666', marginBottom: 3 },
  status: { fontSize: 14, color: '#007bff', marginBottom: 10, fontWeight: 'bold' },
  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  botaoEditar: { backgroundColor: '#ffc107', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
  botaoExcluir: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
  textoBotaoAcao: { color: '#fff', fontWeight: 'bold' }
});