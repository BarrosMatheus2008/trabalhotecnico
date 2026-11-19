import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import FormScreen from './src/screens/FormScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const IPV4_REDE = 'http://172.20.135.89:3000';
export const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : IPV4_REDE;

export const showAlert = (titulo, mensagem, onConfirm = null) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    if (onConfirm) onConfirm();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: onConfirm }]);
  }
};

function extrairListaUsuarios(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.usuarios)) return payload.usuarios;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('visitante');
  const [abaVisitante, setAbaVisitante] = useState('inicio');
  const [abaLogado, setAbaLogado] = useState('painel');
  const [inicializando, setInicializando] = useState(true);

  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [horasEstudadas, setHorasEstudadas] = useState('');
  const [statusEstudo, setStatusEstudo] = useState('Pendente');
  const [prioridade, setPrioridade] = useState('Media');

  const [listaEstudos, setListaEstudos] = useState([]);
  const [resumoAdmin, setResumoAdmin] = useState(null);
  const [usuariosLista, setUsuariosLista] = useState([]);

  useEffect(() => {
    verificarSessaoSalva();
  }, []);

  const verificarSessaoSalva = async () => {
    try {
      const tokenSalvo = await AsyncStorage.getItem('@token');
      const usuarioSalvo = await AsyncStorage.getItem('@usuario');

      if (tokenSalvo && usuarioSalvo) {
        const parsedUser = JSON.parse(usuarioSalvo);
        setToken(tokenSalvo);
        setUsuario(parsedUser);
        setTelaAtual('home');
        buscarEstudos(tokenSalvo);
        if (String(parsedUser?.nivel || '').toLowerCase() === 'admin') {
          buscarResumoAdmin(tokenSalvo);
          buscarUsuariosAdmin(tokenSalvo);
        } else {
          setResumoAdmin(null);
          setUsuariosLista([]);
        }
      }
    } catch (error) {
      console.error('Erro ao restaurar sessao:', error);
    } finally {
      setInicializando(false);
    }
  };

  const limparFormularioEstudo = () => {
    setEditandoId(null);
    setDisciplina('');
    setConteudo('');
    setHorasEstudadas('');
    setStatusEstudo('Pendente');
    setPrioridade('Media');
  };

  const realizarLogout = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUsuario(null);
    setResumoAdmin(null);
    setUsuariosLista([]);
    setListaEstudos([]);
    limparFormularioEstudo();
    setAbaVisitante('inicio');
    setAbaLogado('painel');
    setTelaAtual('visitante');
  };

  const buscarResumoAdmin = async (tokenAtivo = token) => {
    try {
      const response = await fetch(`${API_URL}/admin/resumo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAtivo}`
        }
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setResumoAdmin(data?.resumo || data || null);
      }
    } catch (error) {
      console.error('Erro ao buscar resumo admin:', error);
    }
  };

  const buscarUsuariosAdmin = async (tokenAtivo = token) => {
    try {
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAtivo}`
        }
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        const lista = extrairListaUsuarios(data);
        setUsuariosLista(lista);
      } else {
        console.warn('GET /admin/usuarios retornou erro:', response.status, data);
        setUsuariosLista([]);
      }
    } catch (error) {
      console.error('Erro ao buscar usuarios admin:', error);
    }
  };

  const excluirUsuarioAdmin = async (idUsuario) => {
    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${idUsuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        showAlert('Removido', data.mensagem || 'Usuario excluido!');
        await buscarUsuariosAdmin();
        await buscarResumoAdmin();
        await buscarEstudos();
      } else {
        showAlert('Erro', data.erro || 'Nao foi possivel excluir usuario.');
      }
    } catch (error) {
      showAlert('Erro', 'Falha de comunicacao com o servidor.');
    }
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
        showAlert('Sessao expirada', 'Faca login novamente.', realizarLogout);
        return;
      }
      const data = await response.json().catch(() => []);
      if (response.ok) {
        setListaEstudos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar estudos:', error);
    }
  };

  const iniciarEdicaoEstudo = (item) => {
    setEditandoId(item.id);
    setDisciplina(item.disciplina || '');
    setConteudo(item.conteudo || '');
    setHorasEstudadas(String(item.horasEstudadas ?? ''));
    setStatusEstudo(item.status || 'Pendente');
    setPrioridade(item.prioridade || 'Media');
    setAbaLogado('formulario');
  };

  const salvarEstudo = async () => {
    if (!disciplina || !conteudo || !horasEstudadas) {
      showAlert('Atencao', 'Preencha disciplina, conteudo e horas.');
      return;
    }

    const payload = {
      disciplina,
      conteudo,
      horasEstudadas: Number(horasEstudadas),
      status: statusEstudo,
      prioridade
    };

    try {
      const url = editandoId ? `${API_URL}/estudos/${editandoId}` : `${API_URL}/estudos`;
      const metodo = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        showAlert(
          'Sucesso',
          editandoId ? 'Estudo atualizado no MySQL!' : 'Estudo salvo no MySQL!'
        );
        limparFormularioEstudo();
        buscarEstudos();
        if (String(usuario?.nivel || '').toLowerCase() === 'admin') {
          buscarResumoAdmin();
        }
        setAbaLogado('painel');
      } else {
        showAlert('Erro', data.erro || 'Nao foi possivel salvar.');
      }
    } catch (error) {
      showAlert('Erro', 'Falha de comunicacao com o servidor.');
    }
  };

  const deletarEstudo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/estudos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        if (editandoId === id) limparFormularioEstudo();
        showAlert('Removido', 'Registro de estudo excluido.');
        buscarEstudos();
        if (String(usuario?.nivel || '').toLowerCase() === 'admin') {
          buscarResumoAdmin();
        }
      } else {
        showAlert('Erro', data.erro || 'Nao foi possivel excluir.');
      }
    } catch (error) {
      showAlert('Erro', 'Nao foi possivel excluir.');
    }
  };

  const aoLogarComSucesso = async (data) => {
    await AsyncStorage.setItem('@token', data.token);
    await AsyncStorage.setItem('@usuario', JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    setAbaLogado('painel');
    setTelaAtual('home');
    buscarEstudos(data.token);
    if (String(data?.usuario?.nivel || '').toLowerCase() === 'admin') {
      buscarResumoAdmin(data.token);
      buscarUsuariosAdmin(data.token);
    } else {
      setResumoAdmin(null);
      setUsuariosLista([]);
    }
  };

  const ehAdmin = String(usuario?.nivel || '').toLowerCase() === 'admin';

  if (inicializando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: '#475569' }}>Carregando sistema...</Text>
      </View>
    );
  }

  if (telaAtual === 'login') {
    return (
      <LoginScreen
        apiUrl={API_URL}
        showAlert={showAlert}
        onLoginSuccess={aoLogarComSucesso}
        onIrCadastro={() => setTelaAtual('cadastro')}
        onVoltarVisitante={() => setTelaAtual('visitante')}
      />
    );
  }

  if (telaAtual === 'cadastro') {
    return (
      <RegisterScreen
        apiUrl={API_URL}
        showAlert={showAlert}
        onIrLogin={() => setTelaAtual('login')}
        onVoltarVisitante={() => setTelaAtual('visitante')}
      />
    );
  }

  if (telaAtual === 'visitante') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.headerTitle}>Controle de Estudos Pro</Text>
              <Text style={styles.headerSubtitle}>Modo Visitante • Navegacao Ampla</Text>
            </View>
            <TouchableOpacity style={styles.headerLoginBtn} onPress={() => setTelaAtual('login')}>
              <Text style={styles.headerLoginText}>Entrar na Conta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navTab, abaVisitante === 'inicio' && styles.navTabActive]}
              onPress={() => setAbaVisitante('inicio')}
            >
              <Text style={[styles.navTabText, abaVisitante === 'inicio' && styles.navTabTextActive]}>Início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navTab, abaVisitante === 'sobre' && styles.navTabActive]}
              onPress={() => setAbaVisitante('sobre')}
            >
              <Text style={[styles.navTabText, abaVisitante === 'sobre' && styles.navTabTextActive]}>
                Sobre o App & Especificacoes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navTab, abaVisitante === 'demonstracao' && styles.navTabActive]}
              onPress={() => setAbaVisitante('demonstracao')}
            >
              <Text style={[styles.navTabText, abaVisitante === 'demonstracao' && styles.navTabTextActive]}>
                Testar Painel Protegido
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {abaVisitante === 'inicio' && (
            <HomeScreen
              modo="visitante"
              onIrCadastro={() => setTelaAtual('cadastro')}
              onIrSobre={() => setAbaVisitante('sobre')}
            />
          )}

          {abaVisitante === 'sobre' && (
            <AboutScreen
              onAcessarLogin={() => setTelaAtual('login')}
              onIrCadastro={() => setTelaAtual('cadastro')}
            />
          )}

          {abaVisitante === 'demonstracao' && (
            <FormScreen
              modo="visitante"
              showAlert={showAlert}
              onExigirLogin={(acao) => {
                if (Platform.OS === 'web') {
                  const confirmar = window.confirm(
                    `Acesso Restrito\n\nPara ${acao}, faca login ou crie uma conta.\n\nDeseja ir para a tela de login agora?`
                  );
                  if (confirmar) setTelaAtual('login');
                } else {
                  const { Alert } = require('react-native');
                  Alert.alert(
                    'Acesso Restrito',
                    `Para ${acao}, faca login ou crie uma conta.`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Fazer Login', onPress: () => setTelaAtual('login') },
                      { text: 'Criar Conta', onPress: () => setTelaAtual('cadastro') }
                    ]
                  );
                }
              }}
            />
          )}
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
            <Text style={styles.headerTitle}>Ola, {usuario?.nome || 'Estudante'}</Text>
            <Text style={styles.headerSubtitle}>
              Nivel: {usuario?.nivel || 'comum'} • JWT Bearer Token
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={realizarLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navTab, abaLogado === 'painel' && styles.navTabActive]}
            onPress={() => setAbaLogado('painel')}
          >
            <Text style={[styles.navTabText, abaLogado === 'painel' && styles.navTabTextActive]}>
              Painel & Estudos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, abaLogado === 'formulario' && styles.navTabActive]}
            onPress={() => setAbaLogado('formulario')}
          >
            <Text style={[styles.navTabText, abaLogado === 'formulario' && styles.navTabTextActive]}>
              {editandoId ? `Editar #${editandoId}` : 'Novo Estudo'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, abaLogado === 'perfil' && styles.navTabActive]}
            onPress={() => {
              setAbaLogado('perfil');
              if (ehAdmin) {
                buscarUsuariosAdmin();
                buscarResumoAdmin();
              }
            }}
          >
            <Text style={[styles.navTabText, abaLogado === 'perfil' && styles.navTabTextActive]}>
              Perfil & Nivel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {abaLogado === 'painel' && (
          <HomeScreen
            modo="logado"
            usuario={usuario}
            resumoAdmin={ehAdmin ? resumoAdmin : null}
            listaEstudos={listaEstudos}
            onEditarEstudo={iniciarEdicaoEstudo}
            onExcluirEstudo={deletarEstudo}
            onIrNovoEstudo={() => {
              limparFormularioEstudo();
              setAbaLogado('formulario');
            }}
          />
        )}

        {abaLogado === 'formulario' && (
          <FormScreen
            modo="logado"
            editandoId={editandoId}
            disciplina={disciplina}
            setDisciplina={setDisciplina}
            conteudo={conteudo}
            setConteudo={setConteudo}
            horasEstudadas={horasEstudadas}
            setHorasEstudadas={setHorasEstudadas}
            statusEstudo={statusEstudo}
            setStatusEstudo={setStatusEstudo}
            prioridade={prioridade}
            setPrioridade={setPrioridade}
            onSalvar={salvarEstudo}
            onCancelarEdicao={() => {
              limparFormularioEstudo();
              setAbaLogado('painel');
            }}
          />
        )}

        {abaLogado === 'perfil' && (
          <ProfileScreen
            usuario={usuario}
            resumoAdmin={ehAdmin ? resumoAdmin : null}
            totalEstudos={listaEstudos.length}
            usuariosLista={ehAdmin ? usuariosLista : []}
            onExcluirUsuario={ehAdmin ? excluirUsuarioAdmin : undefined}
            onLogout={realizarLogout}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  header: {
    backgroundColor: '#1E293B',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6
  },
  headerInner: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  headerLoginBtn: { backgroundColor: '#2563EB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  headerLoginText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  navBar: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 6,
    marginTop: 18
  },
  navTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  navTabActive: { backgroundColor: '#2563EB' },
  navTabText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
  navTabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  scrollContainer: { padding: 24, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  logoutButton: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13.5 }
});