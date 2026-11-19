import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function ProfileScreen({
  usuario,
  resumoAdmin,
  totalEstudos,
  usuariosLista = [],
  onExcluirUsuario,
  onLogout
}) {
  const nivel = usuario?.nivel || 'comum';

  return (
    <View style={styles.wideCard}>
      <Text style={styles.sectionTitle}>Perfil e Nivel de Acesso</Text>
      <Text style={styles.sectionDescription}>
        Informacoes da sessao autenticada com JWT e regras de permissao no back-end.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLine}><Text style={styles.bold}>Nome:</Text> {usuario?.nome || '-'}</Text>
        <Text style={styles.infoLine}><Text style={styles.bold}>E-mail:</Text> {usuario?.email || '-'}</Text>
        <Text style={styles.infoLine}><Text style={styles.bold}>Nivel:</Text> {nivel}</Text>
        <Text style={styles.infoLine}><Text style={styles.bold}>Estudos visiveis:</Text> {totalEstudos}</Text>
      </View>

      <View style={styles.permBox}>
        <Text style={styles.permTitle}>Permissoes do Nivel "{nivel}"</Text>
        <Text style={styles.permText}>
          {nivel === 'admin'
            ? '• Visualiza estudos de todos os usuarios cadastrados.\n• Pode editar ou excluir qualquer registro de estudo.\n• Pode excluir outros usuarios cadastrados.'
            : '• Cria, lista, edita e exclui apenas os proprios registros de estudo.\n• Rotas administrativas exigem nivel admin no back-end.'}
        </Text>
        {nivel === 'admin' && resumoAdmin && (
          <Text style={styles.adminResumoText}>
            Resumo Global: {resumoAdmin.totalUsuarios} usuarios • {resumoAdmin.totalEstudos} estudos •{' '}
            {resumoAdmin.totalHoras}h
          </Text>
        )}
      </View>

      {nivel === 'admin' && (
        <View style={styles.adminUsersBox}>
          <Text style={styles.permTitle}>Usuarios Cadastrados ({usuariosLista.length})</Text>
          {usuariosLista.map((u) => {
            const ehPropriaConta = Number(u.id) === Number(usuario?.id);
            return (
              <View key={u.id} style={styles.userRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    {u.nome} ({u.nivel})
                  </Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>

                {!ehPropriaConta && (
                  <TouchableOpacity
                    style={styles.deleteUserBtn}
                    onPress={() => onExcluirUsuario(u.id)}
                  >
                    <Text style={styles.actionBtnText}>Excluir</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Encerrar Sessao (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: '#64748B', marginBottom: 18 },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    gap: 8
  },
  infoLine: { fontSize: 15, color: '#334155' },
  permBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20
  },
  permTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  permText: { fontSize: 14, color: '#1E40AF', lineHeight: 22 },
  adminResumoText: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginTop: 10 },
  adminUsersBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 20,
    gap: 10
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    flexWrap: 'wrap'
  },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  deleteUserBtn: { backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12.5 },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  bold: { fontWeight: '700', color: '#0F172A' },
})
const confirmarExclusao = (item) => {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`Deseja realmente excluir o usuário "${item.nome}" (ID #${item.id})?`);
    if (ok) {
      onExcluirUsuario(item.id);
    }
  } else {
    Alert.alert(
      'Excluir usuário',
      `Deseja realmente excluir "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onExcluirUsuario(item.id) }
      ]
    );
  }
};