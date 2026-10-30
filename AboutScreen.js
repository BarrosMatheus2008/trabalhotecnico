import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Sobre o Controle de Estudos</Text>
      <Text style={styles.descricao}>
        O **Controle de Estudos** é uma plataforma criada para ajudar estudantes a organizar sua rotina acadêmica.
      </Text>

      <Text style={styles.subtitulo}>Objetivos Principais:</Text>
      <Text style={styles.item}>• Centralizar matérias e conteúdos em um só lugar.[cite: 1]</Text>
      <Text style={styles.item}>• Acompanhar a carga horária e o tempo dedicado a cada assunto.[cite: 1]</Text>
      <Text style={styles.item}>• Monitorar o progresso através de status de conclusão.[cite: 1]</Text>
      <Text style={styles.item}>• Manter seus dados protegidos com login pessoal e senha criptografada.[cite: 10]</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  descricao: { fontSize: 16, color: '#555', lineHeight: 22, marginBottom: 20 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  item: { fontSize: 15, color: '#444', marginBottom: 8 }
});