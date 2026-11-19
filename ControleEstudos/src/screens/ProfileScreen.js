import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';

export default function ProfileScreen({
  usuario,
  resumoAdmin,
  totalEstudos = 0,
  usuariosLista = [],
  onExcluirUsuario,
  onLogout
}) {
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos'); // 'todos' | 'admin' | 'comum'
  const [expandidos, setExpandidos] = useState({});
  const [excluindoId, setExcluindoId] = useState(null);

  const isAdmin = String(usuario?.nivel || '').toLowerCase() === 'admin';

  const listaSegura = useMemo(() => {
    if (!isAdmin) return [];
    if (Array.isArray(usuariosLista)) return usuariosLista;
    if (Array.isArray(usuariosLista?.usuarios)) return usuariosLista.usuarios;
    if (Array.isArray(usuariosLista?.data)) return usuariosLista.data;
    return [];
  }, [isAdmin, usuariosLista]);

  const contagens = useMemo(() => {
    const total = listaSegura.length;
    const admins = listaSegura.filter(
      (u) => String(u?.nivel || u?.nivel_acesso || '').toLowerCase() === 'admin'
    ).length;
    const comuns = total - admins;
    return { total, admins, comuns };
  }, [listaSegura]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return listaSegura.filter((item, idx) => {
      const idItem = item?.id ?? idx;
      const nivelItem = String(item?.nivel || item?.nivel_acesso || 'comum').toLowerCase();

      const bateNivel =
        filtroNivel === 'todos' ||
        (filtroNivel === 'admin' && nivelItem === 'admin') ||
        (filtroNivel === 'comum' && nivelItem !== 'admin');

      if (!bateNivel) return false;
      if (!termo) return true;

      const nome = String(item?.nome || '').toLowerCase();
      const email = String(item?.email || '').toLowerCase();
      return nome.includes(termo) || email.includes(termo) || String(idItem).includes(termo);
    });
  }, [listaSegura, busca, filtroNivel]);

  const alternarExpandir = (chave) => {
    setExpandidos((prev) => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  const dispararExclusao = async (item) => {
    if (!isAdmin || !onExcluirUsuario || item?.id == null) return;
    if (Number(item.id) === Number(usuario?.id)) return;

    const nomeUsuario = item?.nome || 'Usuário';
    const emailUsuario = item?.email || '';
    const mensagemConfirmacao = `Deseja realmente excluir o usuário "${nomeUsuario}" (${emailUsuario})? Todos os estudos vinculados a ele também serão removidos.`;

    if (Platform.OS === 'web') {
      const confirmado = window.confirm(mensagemConfirmacao);
      if (!confirmado) return;
    } else {
      const { Alert } = require('react-native');
      const confirmado = await new Promise((resolve) => {
        Alert.alert('Confirmar exclusão', mensagemConfirmacao, [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) }
        ]);
      });
      if (!confirmado) return;
    }

    try {
      setExcluindoId(item.id);
      await onExcluirUsuario(item.id);
    } finally {
      setExcluindoId(null);
    }
  };

  // Visão exclusiva de usuário comum: sem estatísticas gerais e sem gestão/edição de usuários
  if (!isAdmin) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(usuario?.nome || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{usuario?.nome || 'Usuário'}</Text>
              <Text style={styles.profileEmail}>{usuario?.email || 'sem e-mail'}</Text>
            </View>
            <View style={[styles.roleBadge, styles.roleComum]}>
              <Text style={[styles.roleText, styles.roleComumText]}>
                {(usuario?.nivel || 'comum').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalEstudos}</Text>
              <Text style={styles.statLabel}>Seus estudos cadastrados</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Visão exclusiva de administrador
  return (
    <View style={styles.wrapper}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(usuario?.nome || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{usuario?.nome || 'Administrador'}</Text>
            <Text style={styles.profileEmail}>{usuario?.email || 'sem e-mail'}</Text>
          </View>
          <View style={[styles.roleBadge, styles.roleAdmin]}>
            <Text style={[styles.roleText, styles.roleAdminText]}>ADMIN</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalEstudos}</Text>
            <Text style={styles.statLabel}>Estudos listados</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {resumoAdmin?.totalUsuarios ?? contagens.total}
            </Text>
            <Text style={styles.statLabel}>Usuários no sistema</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adminPanel}>
        <Text style={styles.sectionTitle}>Gerenciar Usuários Cadastrados</Text>
        <Text style={styles.sectionSubtitle}>
          Visualize as contas cadastradas, abra os detalhes e exclua usuários quando necessário.
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Nome ou e-mail do usuário"
          placeholderTextColor="#64748B"
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, filtroNivel === 'todos' && styles.chipActive]}
            onPress={() => setFiltroNivel('todos')}
          >
            <Text style={[styles.chipText, filtroNivel === 'todos' && styles.chipTextActive]}>
              Todos · {contagens.total}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filtroNivel === 'comum' && styles.chipActive]}
            onPress={() => setFiltroNivel('comum')}
          >
            <Text style={[styles.chipText, filtroNivel === 'comum' && styles.chipTextActive]}>
              Comuns · {contagens.comuns}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filtroNivel === 'admin' && styles.chipActive]}
            onPress={() => setFiltroNivel('admin')}
          >
            <Text style={[styles.chipText, filtroNivel === 'admin' && styles.chipTextActive]}>
              Admins · {contagens.admins}
            </Text>
          </TouchableOpacity>
        </View>

        {usuariosFiltrados.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhum usuário encontrado para o filtro atual.</Text>
          </View>
        ) : (
          usuariosFiltrados.map((item, idx) => {
            const chave = item?.id ?? `idx-${idx}`;
            const nivelExibido = String(item?.nivel || item?.nivel_acesso || 'comum').toUpperCase();
            const horasExibidas = item?.total_horas ?? item?.totalHoras ?? 0;
            const estudosExibidos = item?.total_estudos ?? item?.totalEstudos ?? 0;
            const aberto = !!expandidos[chave];
            const ehContaAtual = item?.id != null && Number(item.id) === Number(usuario?.id);
            const estaExcluindo = excluindoId === item?.id;

            return (
              <View key={chave} style={styles.userCard}>
                <TouchableOpacity
                  style={styles.userCardHeader}
                  activeOpacity={0.8}
                  onPress={() => alternarExpandir(chave)}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.userCategory}>{nivelExibido}</Text>
                    <Text style={styles.userName}>{item?.nome || 'Sem nome'}</Text>
                    <Text style={styles.userEmail}>{item?.email || 'Sem e-mail'}</Text>
                  </View>
                  <Text style={styles.chevron}>{aberto ? '⌃' : '⌄'}</Text>
                </TouchableOpacity>

                {aberto && (
                  <View style={styles.userCardBody}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>ID: #{chave}</Text>
                      <Text style={styles.metaText}>Estudos: {estudosExibidos}</Text>
                      <Text style={styles.metaText}>Horas: {horasExibidas}h</Text>
                    </View>

                    {ehContaAtual ? (
                      <Text style={styles.selfNote}>Esta é a sua conta ativa no momento.</Text>
                    ) : (
                      <TouchableOpacity
                        style={[styles.deleteBtn, estaExcluindo && styles.deleteBtnDisabled]}
                        disabled={estaExcluindo || item?.id == null}
                        onPress={() => dispararExclusao(item)}
                      >
                        <Text style={styles.deleteBtnText}>
                          {estaExcluindo ? 'Excluindo...' : 'Excluir Usuário'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 18
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  roleAdmin: {
    backgroundColor: '#DBEAFE'
  },
  roleComum: {
    backgroundColor: '#E2E8F0'
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  roleAdminText: {
    color: '#1D4ED8'
  },
  roleComumText: {
    color: '#334155'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  logoutBtn: {
    marginTop: 16,
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  adminPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 16
  },
  chip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  chipActive: {
    backgroundColor: '#065F46',
    borderColor: '#065F46'
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  userCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
    overflow: 'hidden'
  },
  userCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userCategory: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    color: '#047857'
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064E3B',
    marginTop: 2
  },
  userEmail: {
    fontSize: 13,
    color: '#3F6212',
    marginTop: 2
  },
  chevron: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46'
  },
  userCardBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
    gap: 10
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#065F46'
  },
  selfNote: {
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic'
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  deleteBtnDisabled: {
    opacity: 0.6
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13.5
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13.5
  }
});