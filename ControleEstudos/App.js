import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SobreAppSection from './SobreAppSection';

// SEU IPV4 CORRETO
const API_URL = 'http://172.20.135.89:3000';

const showAlert = (titulo, mensagem, onConfirm = null) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    if (onConfirm) onConfirm();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: onConfirm }]);
  }
};

export default function App() {
  const [telaAtual, setTelaAtual] = useState('visitante');
  const [abaVisitante, setAbaVisitante] = useState('inicio');
  const [carregando, setCarregando] = useState(false);
  const [inicializando, setInicializando] = useState(true);

  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [horasEstudadas, setHorasEstudadas] = useState('');
  const [statusEstudo, setStatusEstudo] = useState('Pendente');
  const [prioridade, setPrioridade] = useState('Média');
  const [listaEstudos, setListaEstudos] = useState([]);

  useEffect(() => {
    verificarSessaoSalva();
  }, []);

  const verificarSessaoSalva = async () => {
    try {
      const tokenSalvo = await AsyncStorage.getItem('@token');
      const usuarioSalvo = await AsyncStorage.getItem('@usuario');

      if (tokenSalvo && usuarioSalvo) {
        setToken(tokenSalvo);
        setUsuario(JSON.parse(usuarioSalvo));
        setTelaAtual('home');
        buscarEstudos(tokenSalvo);
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
    } finally {
      setInicializando(false);
    }
  };

  const exigirLoginParaAcao = (acao) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`🔒 Acesso Restrito\n\nPara ${acao}, você precisa estar logado na sua conta.\n\nDeseja ir para a tela de login agora?`);
      if (confirmar) setTelaAtual('login');
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        '🔒 Acesso Restrito',
        `Para ${acao}, você precisa estar logado na sua conta.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => setTelaAtual('login') },
          { text: 'Criar Conta', onPress: () => setTelaAtual('cadastro') }
        ]
      );
    }
  };

  const realizarCadastro = async () => {
    if (!nome || !email || !senha) {
      showAlert('Atenção', 'Preencha todos os campos para se cadastrar.');
      return;
    }
    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, nivel: 'comum' })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        showAlert('Sucesso 🎉', 'Conta cadastrada com sucesso! Faça o seu login.', () => {
          setNome('');
          setEmail('');
          setSenha('');
          setTelaAtual('login');
        });
      } else {
        showAlert('Erro no cadastro', data.erro || 'Não foi possível cadastrar.');
      }
    } catch (error) {
      showAlert('Erro de conexão', 'Verifique se o servidor Node.js está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  const realizarLogin = async () => {
    if (!email || !senha) {
      showAlert('Atenção', 'Informe seu e-mail e sua senha para entrar.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        await AsyncStorage.setItem('@token', data.token);
        await AsyncStorage.setItem('@usuario', JSON.stringify(data.usuario));

        setToken(data.token);
        setUsuario(data.usuario);
        setEmail('');
        setSenha('');
        setTelaAtual('home');
        buscarEstudos(data.token);
        showAlert('Bem-vindo!', 'Entrada realizada com sucesso!');
      } else {
        showAlert('Senha incorreta ou e-mail inválido', 'Por favor, verifique seus dados e tente novamente.');
      }
    } catch (error) {
      showAlert('Erro de conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const realizarLogout = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUsuario(null);
    setListaEstudos([]);
    setAbaVisitante('inicio');
    setTelaAtual('visitante');
  };

  const buscarEstudos = async (tokenAtivo = token) => {
    try {
      const response = await fetch(`${API_URL}/estudos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAtivo}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        showAlert('Sessão expirada', 'Faça login novamente.', realizarLogout);
        return;
      }
      const data = await response.json();
      if (response.ok) setListaEstudos(data);
    } catch (error) {
      console.error('Erro ao buscar estudos:', error);
    }
  };

  const adicionarEstudo = async () => {
    if (!disciplina || !conteudo || !horasEstudadas) {
      showAlert('Atenção', 'Preencha disciplina, conteúdo e horas.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/estudos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          disciplina: `${disciplina} [Prioridade: ${prioridade}]`,
          conteudo: conteudo,
          horasEstudadas: Number(horasEstudadas),
          status: statusEstudo
        })
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('Sucesso 🎉', 'Estudo personalizado salvo no MySQL com sucesso!');
        setDisciplina('');
        setConteudo('');
        setHorasEstudadas('');
        buscarEstudos();
      } else {
        showAlert('Erro', data.erro || 'Não foi possível salvar.');
      }
    } catch (error) {
      showAlert('Erro', 'Falha de comunicação com o servidor.');
    }
  };

  const deletarEstudo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/estudos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showAlert('Removido', 'Registro de estudo excluído.');
        buscarEstudos();
      }
    } catch (error) {
      showAlert('Erro', 'Não foi possível excluir.');
    }
  };

  // Cálculos estatísticos para os gráficos em tempo real
  const totalHoras = listaEstudos.reduce((acc, curr) => acc + (Number(curr.horasEstudadas) || 0), 0);
  const totalConcluidos = listaEstudos.filter(item => item.status === 'Concluído').length;
  const totalEmAndamento = listaEstudos.filter(item => item.status === 'Em Andamento').length;
  const totalPendentes = listaEstudos.filter(item => item.status === 'Pendente' || !item.status).length;

  if (inicializando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: '#475569' }}>Carregando sistema...</Text>
      </View>
    );
  }

  if (telaAtual === 'visitante') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.headerTitle}>📚 Controle de Estudos Pro</Text>
              <Text style={styles.headerSubtitle}>Modo Visitante • Navegação Ampla</Text>
            </View>
            <TouchableOpacity style={styles.headerLoginBtn} onPress={() => setTelaAtual('login')}>
              <Text style={styles.headerLoginText}>Entrar na Conta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.navBar}>
            <TouchableOpacity style={[styles.navTab, abaVisitante === 'inicio' && styles.navTabActive]} onPress={() => setAbaVisitante('inicio')}>
              <Text style={[styles.navTabText, abaVisitante === 'inicio' && styles.navTabTextActive]}>Início</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navTab, abaVisitante === 'sobre' && styles.navTabActive]} onPress={() => setAbaVisitante('sobre')}>
              <Text style={[styles.navTabText, abaVisitante === 'sobre' && styles.navTabTextActive]}>Sobre o App & Especificações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navTab, abaVisitante === 'demonstracao' && styles.navTabActive]} onPress={() => setAbaVisitante('demonstracao')}>
              <Text style={[styles.navTabText, abaVisitante === 'demonstracao' && styles.navTabTextActive]}>Testar Painel Protegido</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {abaVisitante === 'inicio' && (
            <View>
              <View style={styles.wideCard}>
                <Text style={styles.heroBadge}>PLATAFORMA ACADÊMICA PROFISSIONAL</Text>
                <Text style={styles.heroTitle}>Transforme sua rotina de estudos em aprovação certa.</Text>
                <Text style={styles.heroText}>
                  Desenvolvido para estudantes que buscam alto desempenho. Monitore suas horas líquidas, organize prioridades e mantenha seu histórico sincronizado em tempo real com MySQL e segurança JWT.
                </Text>
                
                <View style={styles.inicioInfoGrid}>
                  <View style={styles.inicioBox}>
                    <Text style={styles.inicioBoxTitle}>⚡ Organização Total</Text>
                    <Text style={styles.inicioBoxDesc}>Gerencie disciplinas e conteúdos pendentes com facilidade.</Text>
                  </View>
                  <View style={styles.inicioBox}>
                    <Text style={styles.inicioBoxTitle}>🔒 Segurança Avançada</Text>
                    <Text style={styles.inicioBoxDesc}>Autenticação com criptografia de ponta a ponta.</Text>
                  </View>
                  <View style={styles.inicioBox}>
                    <Text style={styles.inicioBoxTitle}>📊 Métricas Claras</Text>
                    <Text style={styles.inicioBoxDesc}>Acompanhe seu avanço acadêmico dia após dia.</Text>
                  </View>
                </View>

                <View style={styles.heroActionsRow}>
                  <TouchableOpacity style={styles.primaryButton} onPress={() => setTelaAtual('cadastro')}>
                    <Text style={styles.primaryButtonText}>Criar Minha Conta Gratuita</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.outlineButton} onPress={() => setAbaVisitante('sobre')}>
                    <Text style={styles.outlineButtonText}>Conhecer Todos os Recursos</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {abaVisitante === 'sobre' && (
            <SobreAppSection 
              onAcessarLogin={() => setTelaAtual('login')} 
              onIrCadastro={() => setTelaAtual('cadastro')} 
            />
          )}

          {abaVisitante === 'demonstracao' && (
            <View style={styles.wideCard}>
              <Text style={styles.sectionTitle}>✨ Simulação Protegida com Alerta</Text>
              <Text style={styles.sectionDescription}>O sistema obriga você a estar logado para salvar registros personalizados no banco.</Text>
              
              <Text style={styles.label}>Disciplina</Text>
              <TextInput style={styles.input} placeholder="Ex: Matemática" placeholderTextColor="#94A3B8" value={disciplina} onChangeText={setDisciplina} />
              
              <Text style={styles.label}>Conteúdo</Text>
              <TextInput style={styles.input} placeholder="Ex: Álgebra" placeholderTextColor="#94A3B8" value={conteudo} onChangeText={setConteudo} />
              
              <Text style={styles.label}>Horas</Text>
              <TextInput style={styles.input} placeholder="Ex: 2" placeholderTextColor="#94A3B8" keyboardType="numeric" value={horasEstudadas} onChangeText={setHorasEstudadas} />

              <Text style={styles.label}>Status do Estudo</Text>
              <View style={styles.optionsRow}>
                {['Pendente', 'Em Andamento', 'Concluído'].map((st) => (
                  <TouchableOpacity 
                    key={st} 
                    style={[styles.optionChip, statusEstudo === st && styles.optionChipActive]}
                    onPress={() => setStatusEstudo(st)}
                  >
                    <Text style={[styles.optionText, statusEstudo === st && styles.optionTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Nível de Prioridade</Text>
              <View style={styles.optionsRow}>
                {['Baixa', 'Média', 'Alta'].map((pr) => (
                  <TouchableOpacity 
                    key={pr} 
                    style={[styles.optionChip, prioridade === pr && styles.optionChipActive]}
                    onPress={() => setPrioridade(pr)}
                  >
                    <Text style={[styles.optionText, prioridade === pr && styles.optionTextActive]}>{pr}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={() => exigirLoginParaAcao('salvar um estudo personalizado')}>
                <Text style={styles.primaryButtonText}>Salvar Estudo no Sistema 🔒</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (telaAtual === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Entrar na Conta</Text>
            <Text style={styles.authSubtitle}>Acesse seu painel sincronizado com o MySQL.</Text>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="seuemail@exemplo.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#94A3B8" secureTextEntry value={senha} onChangeText={setSenha} />
            
            {carregando ? (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={{ marginTop: 6, color: '#64748B', fontSize: 13 }}>Autenticando...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={realizarLogin}>
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.linkButton} onPress={() => setTelaAtual('cadastro')}>
              <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => setTelaAtual('visitante')}>
              <Text style={styles.backText}>← Voltar para a tela normal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (telaAtual === 'cadastro') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Criar Conta</Text>
            <Text style={styles.authSubtitle}>Cadastre-se para liberar o painel.</Text>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor="#94A3B8" value={nome} onChangeText={setNome} />
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="seuemail@exemplo.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="Crie uma senha" placeholderTextColor="#94A3B8" secureTextEntry value={senha} onChangeText={setSenha} />
            
            {carregando ? (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={{ marginTop: 6, color: '#64748B', fontSize: 13 }}>Cadastrando...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={realizarCadastro}>
                <Text style={styles.primaryButtonText}>Cadastrar Conta</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.linkButton} onPress={() => setTelaAtual('login')}>
              <Text style={styles.linkText}>Já tem conta? Fazer login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => setTelaAtual('visitante')}>
              <Text style={styles.backText}>← Voltar para a tela normal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitle}>Olá, {usuario?.nome || 'Estudante'} 👋</Text>
            <Text style={styles.headerSubtitle}>Painel Acadêmico • Autenticado via JWT</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={realizarLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Painel de Estatísticas e Métricas Acadêmicas */}
        <View style={styles.wideCard}>
          <Text style={styles.sectionTitle}>📈 Painel de Estatísticas e Desempenho</Text>
          <Text style={styles.sectionDescription}>Métricas em tempo real calculadas com base nos seus registros no MySQL.</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCardBox, { borderLeftColor: '#2563EB' }]}>
              <Text style={styles.statNum}>{totalHoras}h</Text>
              <Text style={styles.statLabelText}>Total de Horas</Text>
            </View>
            <View style={[styles.statCardBox, { borderLeftColor: '#10B981' }]}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>{totalConcluidos}</Text>
              <Text style={styles.statLabelText}>Concluídos</Text>
            </View>
            <View style={[styles.statCardBox, { borderLeftColor: '#D97706' }]}>
              <Text style={[styles.statNum, { color: '#D97706' }]}>{totalEmAndamento}</Text>
              <Text style={styles.statLabelText}>Em Andamento</Text>
            </View>
            <View style={[styles.statCardBox, { borderLeftColor: '#EF4444' }]}>
              <Text style={[styles.statNum, { color: '#EF4444' }]}>{totalPendentes}</Text>
              <Text style={styles.statLabelText}>Pendentes</Text>
            </View>
          </View>
        </View>

        {/* Formulário de Registro de Estudo */}
        <View style={styles.wideCard}>
          <Text style={styles.sectionTitle}>✨ Registrar Novo Estudo Personalizado</Text>
          <Text style={styles.sectionDescription}>Defina disciplina, conteúdo, horas, status e prioridade.</Text>
          
          <Text style={styles.label}>Nome da Disciplina</Text>
          <TextInput style={styles.input} placeholder="Ex: Matemática" placeholderTextColor="#94A3B8" value={disciplina} onChangeText={setDisciplina} />
          
          <Text style={styles.label}>Conteúdo Abordado</Text>
          <TextInput style={styles.input} placeholder="Ex: Geometria Analítica" placeholderTextColor="#94A3B8" value={conteudo} onChangeText={setConteudo} />
          
          <Text style={styles.label}>Horas Dedicadas</Text>
          <TextInput style={styles.input} placeholder="Ex: 3" placeholderTextColor="#94A3B8" keyboardType="numeric" value={horasEstudadas} onChangeText={setHorasEstudadas} />

          <Text style={styles.label}>Status do Estudo</Text>
          <View style={styles.optionsRow}>
            {['Pendente', 'Em Andamento', 'Concluído'].map((st) => (
              <TouchableOpacity 
                key={st} 
                style={[styles.optionChip, statusEstudo === st && styles.optionChipActive]}
                onPress={() => setStatusEstudo(st)}
              >
                <Text style={[styles.optionText, statusEstudo === st && styles.optionTextActive]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nível de Prioridade</Text>
          <View style={styles.optionsRow}>
            {['Baixa', 'Média', 'Alta'].map((pr) => (
              <TouchableOpacity 
                key={pr} 
                style={[styles.optionChip, prioridade === pr && styles.optionChipActive]}
                onPress={() => setPrioridade(pr)}
              >
                <Text style={[styles.optionText, prioridade === pr && styles.optionTextActive]}>{pr}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={adicionarEstudo}>
            <Text style={styles.primaryButtonText}>Salvar Estudo no MySQL</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Estudos */}
        <View style={styles.wideCard}>
          <Text style={styles.sectionTitle}>📊 Meus Estudos Registrados ({listaEstudos.length})</Text>
          {listaEstudos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum estudo cadastrado no momento. Adicione sua primeira matéria acima!</Text>
            </View>
          ) : (
            listaEstudos.map((item) => (
              <View key={item.id} style={styles.studyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.disciplina}</Text>
                  <Text style={styles.statusBadge}>{item.status || 'Pendente'}</Text>
                </View>
                <Text style={styles.cardContent}><Text style={styles.bold}>Conteúdo:</Text> {item.conteudo}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardHours}>⏱️ {item.horasEstudadas}h dedicadas</Text>
                  <TouchableOpacity onPress={() => deletarEstudo(item.id)}>
                    <Text style={styles.deleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  header: { backgroundColor: '#1E293B', paddingTop: 20, paddingBottom: 16, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 6 },
  headerInner: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  headerLoginBtn: { backgroundColor: '#2563EB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  headerLoginText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  navBar: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', backgroundColor: '#334155', borderRadius: 12, padding: 6, marginTop: 18 },
  navTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  navTabActive: { backgroundColor: '#2563EB' },
  navTabText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
  navTabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContainer: { padding: 24, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  wideCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, marginBottom: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginBottom: 14 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, lineHeight: 36 },
  heroText: { fontSize: 15.5, color: '#475569', lineHeight: 24, marginBottom: 24, maxWidth: 900 },
  inicioInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  inicioBox: { flex: 1, minWidth: 240, backgroundColor: '#F8FAFC', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  inicioBoxTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  inicioBoxDesc: { fontSize: 13.5, color: '#475569', lineHeight: 20 },
  heroActionsRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  statCardBox: { flex: 1, minWidth: 200, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, borderLeftWidth: 5, borderWidth: 1, borderColor: '#E2E8F0' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', marginBottom: 4 },
  statLabelText: { fontSize: 13.5, fontWeight: '600', color: '#64748B' },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  outlineButton: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  outlineButtonText: { color: '#334155', fontSize: 15, fontWeight: '600' },
  logoutButton: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13.5 },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  authCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 36, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5, width: '100%' },
  authTitle: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  authSubtitle: { fontSize: 14.5, color: '#64748B', marginBottom: 24, lineHeight: 22 },
  label: { fontSize: 13.5, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 4 },
  optionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  optionChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', backgroundColor: '#F8FAFC' },
  optionChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionText: { fontSize: 13.5, fontWeight: '600', color: '#475569' },
  optionTextActive: { color: '#FFFFFF' },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#2563EB', fontSize: 14.5, fontWeight: '600' },
  backText: { color: '#64748B', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', marginBottom: 12 },
  emptyCard: { backgroundColor: '#F8FAFC', padding: 28, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontSize: 15, textAlign: 'center' },
  studyCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 14, borderLeftWidth: 5, borderLeftColor: '#2563EB', borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  statusBadge: { fontSize: 12, fontWeight: 'bold', color: '#2563EB', backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardContent: { fontSize: 14.5, color: '#475569', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  cardHours: { fontSize: 13.5, color: '#64748B', fontWeight: '500' },
  deleteText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
  bold: { fontWeight: '600', color: '#0F172A' },
});