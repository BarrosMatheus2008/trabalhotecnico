import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Box Header - Apresentação Principal */}
      <View style={styles.boxHeader}>
        <Text style={styles.tituloHeader}>Controle de Estudos 🎓</Text>
        <Text style={styles.subtituloHeader}>
          Plataforma de Gestão Acadêmica e Organização de Rotina
        </Text>
      </View>

      {/* Box 1 - Visão Geral do Problema & Solução */}
      <View style={styles.boxCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcone}>💡</Text>
          <Text style={styles.cardTitulo}>Problema & Proposta</Text>
        </View>
        <Text style={styles.cardTexto}>
          Estudantes frequentemente enfrentam dificuldades para gerenciar sua carga horária, organizar disciplinas e acompanhar o progresso das suas tarefas antes das avaliações.
        </Text>
        <Text style={styles.cardTexto}>
          O <Text style={styles.bold}>Controle de Estudos</Text> reduz a desorganização permitindo o planejamento individualizado, monitoramento de horas dedicadas e status em tempo real.
        </Text>
      </View>

      {/* Box 2 - Funcionalidades Chave */}
      <View style={styles.boxCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcone}>🚀</Text>
          <Text style={styles.cardTitulo}>Principais Recursos</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>CRUD de Estudos:</Text> Cadastro, edição, listagem e remoção de registros de disciplinas.</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Gestão de Status:</Text> Acompanhamento dinâmico entre tarefas Pendentes e Concluídas.</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Carga Horária:</Text> Controle individualizado do tempo de estudo por conteúdo.</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Alertas Universais:</Text> Validações nativas para navegadores Web e dispositivos móveis (Android/iOS).</Text>
        </View>
      </View>

      {/* Box 3 - Segurança & Autenticação */}
      <View style={styles.boxCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcone}>🔒</Text>
          <Text style={styles.cardTitulo}>Segurança & Arquitetura</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Autenticação JWT:</Text> Proteção de rotas no back-end com JSON Web Tokens via Bearer Header.</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Hash de Senhas:</Text> Criptografia segura utilizando a biblioteca bcrypt no servidor Express.</Text>
        </View>
        <View style={styles.itemLinha}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemTexto}><Text style={styles.bold}>Isolamento de Dados:</Text> Vínculo direto de cada registro ao usuário por Chave Estrangeira (<Text style={styles.code}>usuario_id</Text>).</Text>
        </View>
      </View>

      {/* Box 4 - Perfis de Acesso */}
      <View style={styles.boxCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcone}>👥</Text>
          <Text style={styles.cardTitulo}>Níveis de Usuário</Text>
        </View>
        <View style={styles.boxSubitem}>
          <Text style={styles.subitemTitulo}>👤 Perfil Estudante / Usuário</Text>
          <Text style={styles.subitemTexto}>Acesso exclusivo aos seus próprios estudos cadastrados, com permissão total de alteração e exclusão apenas dos seus registros.</Text>
        </View>
        <View style={styles.boxSubitem}>
          <Text style={styles.subitemTitulo}>👑 Perfil Administrador (Admin)</Text>
          <Text style={styles.subitemTexto}>Visualização geral do sistema, auditoria global de estudos cadastrados na plataforma e gerenciamento de acessos.</Text>
        </View>
      </View>

      {/* Box 5 - Stack Tecnológico */}
      <View style={styles.boxCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcone}>⚙️</Text>
          <Text style={styles.cardTitulo}>Tecnologias Utilizadas</Text>
        </View>
        <Text style={styles.cardTexto}>
          <Text style={styles.bold}>Front-end:</Text> React Native, Expo, React Navigation (Native Stack), Axios.
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.bold}>Back-end:</Text> Node.js, Express REST API, JSONWebToken (JWT), Bcrypt.js, CORS.
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.bold}>Banco de Dados:</Text> MySQL Relacional.
        </Text>
      </View>

      {/* Footer Info */}
      <View style={styles.boxFooter}>
        <Text style={styles.textoFooter}>Desenvolvido para o Projeto Avaliativo de Aplicação Mobile com JWT</Text>
        <Text style={styles.versaoTexto}>Versão 2.0.0 — Todos os direitos reservados</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2f5' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  boxHeader: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tituloHeader: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtituloHeader: { fontSize: 14, color: '#e0e0e0', textAlign: 'center' },
  boxCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcone: { fontSize: 22, marginRight: 10 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  cardTexto: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  itemLinha: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { fontSize: 16, color: '#007bff', marginRight: 8, lineHeight: 20 },
  itemTexto: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  bold: { fontWeight: 'bold', color: '#222' },
  code: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#d63384' },
  boxSubitem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    marginBottom: 10,
  },
  subitemTitulo: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subitemTexto: { fontSize: 13, color: '#666', lineHeight: 18 },
  boxFooter: { alignItems: 'center', marginTop: 10, paddingVertical: 10 },
  textoFooter: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 4 },
  versaoTexto: { fontSize: 11, color: '#aaa', fontWeight: 'bold' }
});