// src/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import api from './api';

export default function HomeScreen({ navigation }) {
  const [estudos, setEstudos] = useState([]);

  async function carregarEstudos() {
    try {
      const response = await api.get('/estudos');
      setEstudos(response.data);
    } catch (error) {
      alert("Não foi possível carregar os dados da API. Verifique se o JSON Server está rodando.");
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarEstudos();
    });
    return unsubscribe;
  }, [navigation]);

  // Função de exclusão otimizada para Web e Mobile
  async function handleExcluir(id) {
    const confirmar = window.confirm("Deseja realmente excluir este registo de estudo?");
    
    if (confirmar) {
      try {
        console.log("A tentar excluir o ID:", id);
        await api.delete(`/estudos/${id}`);
        setEstudos(prevEstudos => prevEstudos.filter(item => item.id !== id));
        alert("Estudo excluído com sucesso!");
      } catch (error) {
        console.error("Erro detalhado ao excluir:", error);
        alert("Não foi possível excluir o registo. Verifique a API.");
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      <View style={styles.header}>
        <Text style={styles.titulo}>📚 Controle de Estudos</Text>
        <Text style={styles.subtitulo}>Gerencie suas matérias e metas</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.botaoNovo} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FormScreen')}
      >
        <Text style={styles.textoBotaoNovo}>+ Cadastrar Novo Estudo</Text>
      </TouchableOpacity>

      <FlatList
        data={estudos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listaContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.materia}>{item.disciplina}</Text>
              <View style={[styles.badge, { backgroundColor: item.status === 'Concluído' ? '#22c55e' : '#f59e0b' }]}>
                <Text style={styles.badgeText}>{item.status || 'Pendente'}</Text>
              </View>
            </View>

            <Text style={styles.conteudo}>📖 {item.conteudo}</Text>
            <Text style={styles.horas}>⏱️ Carga horária: {item.horasEstudadas}h</Text>
            
            <View style={styles.botoesAcao}>
              <TouchableOpacity 
                style={styles.botaoEditar} 
                onPress={() => navigation.navigate('FormScreen', { estudoEditando: item })}
              >
                <Text style={styles.textoAcaoEditar}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.botaoExcluir} 
                onPress={() => handleExcluir(item.id)}
              >
                <Text style={styles.textoAcaoExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e293b', padding: 20, paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  listaContainer: { padding: 16 },
  botaoNovo: { backgroundColor: '#2563eb', marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  textoBotaoNovo: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  materia: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  conteudo: { fontSize: 14, color: '#475569', marginBottom: 6 },
  horas: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  botoesAcao: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, gap: 8 },
  botaoEditar: { backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  textoAcaoEditar: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 13 },
  botaoExcluir: { backgroundColor: '#fef2f2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },
  textoAcaoExcluir: { color: '#dc2626', fontWeight: 'bold', fontSize: 13 }
});