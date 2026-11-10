import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform } from 'react-native';
import api from '../services/api';

export default function FormScreen({ route, navigation }) {
  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [horasEstudadas, setHorasEstudadas] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [idEditando, setIdEditando] = useState(null);

  const usuarioId = route.params?.usuarioId;

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Se o usuário for visitante (id === 0), bloqueia o acesso ao formulário e obriga o login/cadastro
  useEffect(() => {
    if (!usuarioId || usuarioId === 0) {
      if (Platform.OS === 'web') {
        window.alert('Acesso Restrito\n\nVocê está a navegar no modo visitante. Para cadastrar ou gerenciar estudos, é necessário entrar na sua conta.');
        navigation.replace('Login');
      } else {
        Alert.alert(
          'Acesso Restrito',
          'Você está a navegar no modo visitante. Para cadastrar ou gerenciar estudos, é necessário entrar na sua conta.',
          [{ text: 'Fazer Login', onPress: () => navigation.replace('Login') }]
        );
      }
    }
  }, [usuarioId, navigation]);

  useEffect(() => {
    if (route.params?.estudo) {
      const { id, disciplina, conteudo, horasEstudadas, status } = route.params.estudo;
      setIdEditando(id);
      setDisciplina(disciplina);
      setConteudo(conteudo);
      setHorasEstudadas(String(horasEstudadas));
      setStatus(status || 'Pendente');
    }
  }, [route.params]);

  const handleSalvar = async () => {
    if (!disciplina.trim() || !conteudo.trim() || !horasEstudadas.trim()) {
      showAlert('Atenção', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const dados = { disciplina, conteudo, horasEstudadas: Number(horasEstudadas), status, usuarioId };
      if (idEditando) {
        await api.put(`/estudos/${idEditando}`, dados);
        showAlert('Sucesso', 'Estudo atualizado com sucesso!');
      } else {
        await api.post('/estudos', dados);
        showAlert('Sucesso', 'Estudo cadastrado com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{idEditando ? 'Editar Estudo' : 'Novo Estudo'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Disciplina"
        placeholderTextColor="#888"
        value={disciplina}
        onChangeText={setDisciplina}
      />

      <TextInput
        style={styles.input}
        placeholder="Conteúdo"
        placeholderTextColor="#888"
        value={conteudo}
        onChangeText={setConteudo}
      />

      <TextInput
        style={styles.input}
        placeholder="Horas Estudadas"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={horasEstudadas}
        onChangeText={setHorasEstudadas}
      />

      <TextInput
        style={styles.input}
        placeholder="Status (Pendente / Concluído)"
        placeholderTextColor="#888"
        value={status}
        onChangeText={setStatus}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} activeOpacity={0.8}>
        <Text style={styles.textoBotao}>Salvar Registro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  botaoSalvar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});