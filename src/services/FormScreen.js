// src/FormScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import api from './api'; // Ajuste o caminho se necessário

export default function FormScreen({ route, navigation }) {
  const estudoEditando = route.params?.estudoEditando;

  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [horas, setHoras] = useState('');
  const [status, setStatus] = useState('Pendente');

  useEffect(() => {
    if (estudoEditando) {
      setDisciplina(estudoEditando.disciplina);
      setConteudo(estudoEditando.conteudo);
      setHoras(String(estudoEditando.horasEstudadas));
      setStatus(estudoEditando.status || 'Pendente');
    }
  }, [estudoEditando]);

  async function handleSalvar() {
    if (!disciplina || !conteudo || !horas) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      if (estudoEditando) {
        await api.put(`/estudos/${estudoEditando.id}`, {
          disciplina,
          conteudo,
          horasEstudadas: Number(horas),
          status
        });
        Alert.alert('Sucesso', 'Estudo atualizado com sucesso!');
      } else {
        await api.post('/estudos', {
          disciplina,
          conteudo,
          horasEstudadas: Number(horas),
          status: 'Pendente'
        });
        Alert.alert('Sucesso', 'Estudo cadastrado com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardForm}>
        <Text style={styles.titulo}>
          {estudoEditando ? '✏️ Editar Estudo' : '✨ Novo Estudo'}
        </Text>

        <Text style={styles.label}>Disciplina / Matéria</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: React Native" 
          placeholderTextColor="#94a3b8"
          value={disciplina} 
          onChangeText={setDisciplina} 
        />

        <Text style={styles.label}>Conteúdo Abordado</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Componentes, Props e CRUD" 
          placeholderTextColor="#94a3b8"
          value={conteudo} 
          onChangeText={setConteudo} 
        />

        <Text style={styles.label}>Horas Dedicadas</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 3" 
          placeholderTextColor="#94a3b8"
          keyboardType="numeric" 
          value={horas} 
          onChangeText={setHoras} 
        />

        {estudoEditando && (
          <>
            <Text style={styles.label}>Status do Estudo</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity 
                style={[styles.statusBtn, status === 'Pendente' && styles.statusPendenteActive]}
                onPress={() => setStatus('Pendente')}
              >
                <Text style={[styles.statusText, status === 'Pendente' && styles.statusTextActive]}>Pendente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusBtn, status === 'Concluído' && styles.statusConcluidoActive]}
                onPress={() => setStatus('Concluído')}
              >
                <Text style={[styles.statusText, status === 'Concluído' && styles.statusTextActive]}>Concluído</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.botaoSalvar} activeOpacity={0.8} onPress={handleSalvar}>
          <Text style={styles.textoBotao}>Salvar Registro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8fafc', justifyContent: 'center' },
  cardForm: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, backgroundColor: '#f8fafc', fontSize: 15, color: '#0f172a' },
  statusContainer: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statusBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', backgroundColor: '#f8fafc' },
  statusPendenteActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  statusConcluidoActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  statusText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  statusTextActive: { color: '#fff' },
  botaoSalvar: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 24, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});