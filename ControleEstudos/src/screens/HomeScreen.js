import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({
  modo = 'visitante',
  usuario = null,
  resumoAdmin = null,
  listaEstudos = [],
  onIrCadastro,
  onIrSobre,
  onEditarEstudo,
  onExcluirEstudo,
  onIrNovoEstudo
}) {
  if (modo === 'visitante') {
    return (
      <View style={styles.wideCard}>
        <Text style={styles.heroBadge}>PLATAFORMA ACADEMICA PROFISSIONAL</Text>
        <Text style={styles.heroTitle}>Transforme sua rotina de estudos em aprovacao certa.</Text>
        <Text style={styles.heroText}>
          Monitore suas horas liquidas, organize prioridades e mantenha seu historico sincronizado com MySQL,
          JWT e controle de niveis de usuario.
        </Text>

        <View style={styles.inicioInfoGrid}>
          <View style={styles.inicioBox}>
            <Text style={styles.inicioBoxTitle}>Organizacao Total</Text>
            <Text style={styles.inicioBoxDesc}>Gerencie disciplinas, status, prioridades e edicao de estudos.</Text>
          </View>
          <View style={styles.inicioBox}>
            <Text style={styles.inicioBoxTitle}>Seguranca com JWT</Text>
            <Text style={styles.inicioBoxDesc}>Senhas com hash bcrypt, Bearer Token e niveis comum/admin.</Text>
          </View>
          <View style={styles.inicioBox}>
            <Text style={styles.inicioBoxTitle}>Metricas Claras</Text>
            <Text style={styles.inicioBoxDesc}>Acompanhe horas totais e andamento em tempo real.</Text>
          </View>
        </View>

        <View style={styles.heroActionsRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={onIrCadastro}>
            <Text style={styles.primaryButtonText}>Criar Minha Conta Gratuita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={onIrSobre}>
            <Text style={styles.outlineButtonText}>Conhecer Todos os Recursos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalHoras = listaEstudos.reduce((acc, curr) => acc + (Number(curr.horasEstudadas) || 0), 0);
  const totalConcluidos = listaEstudos.filter((item) => item.status === 'Concluído').length;
  const totalEmAndamento = listaEstudos.filter((item) => item.status === 'Em Andamento').length;
  const totalPendentes = listaEstudos.filter((item) => item.status === 'Pendente' || !item.status).length;

  return (
    <View>
      <View style={styles.wideCard}>
        <Text style={styles.sectionTitle}>Permissoes do Nivel: {usuario?.nivel || 'comum'}</Text>
        <Text style={styles.sectionDescription}>
          {usuario?.nivel === 'admin'
            ? 'Nivel admin: visualiza todos os registros e pode editar/excluir qualquer estudo.'
            : 'Nivel comum: gerencia seus proprios registros de estudo no MySQL.'}
        </Text>
        {usuario?.nivel === 'admin' && resumoAdmin && (
          <Text style={styles.adminResumoText}>
            Visao Geral Admin: {resumoAdmin.totalUsuarios} usuarios • {resumoAdmin.totalEstudos} estudos •{' '}
            {resumoAdmin.totalHoras}h no total
          </Text>
        )}
      </View>

      <View style={styles.wideCard}>
        <Text style={styles.sectionTitle}>Estatisticas e Desempenho</Text>
        <Text style={styles.sectionDescription}>Metricas em tempo real calculadas a partir dos estudos listados.</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCardBox, { borderLeftColor: '#2563EB' }]}>
            <Text style={styles.statNum}>{totalHoras}h</Text>
            <Text style={styles.statLabelText}>Total de Horas</Text>
          </View>
          <View style={[styles.statCardBox, { borderLeftColor: '#10B981' }]}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{totalConcluidos}</Text>
            <Text style={styles.statLabelText}>Concluidos</Text>
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

      <View style={styles.wideCard}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Estudos Registrados ({listaEstudos.length})</Text>
          <TouchableOpacity style={styles.smallPrimaryBtn} onPress={onIrNovoEstudo}>
            <Text style={styles.smallPrimaryBtnText}>+ Novo Estudo</Text>
          </TouchableOpacity>
        </View>

        {listaEstudos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum estudo cadastrado no momento.</Text>
          </View>
        ) : (
          listaEstudos.map((item) => (
            <View key={item.id} style={styles.studyCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {item.disciplina} • Prioridade: {item.prioridade || 'Média'}
                </Text>
                <Text style={styles.statusBadge}>{item.status || 'Pendente'}</Text>
              </View>
              <Text style={styles.cardContent}>
                <Text style={styles.bold}>Conteudo:</Text> {item.conteudo}
              </Text>
              {item.nome_usuario && (
                <Text style={styles.cardMeta}>
                  Autor: {item.nome_usuario} ({item.nivel_usuario || 'comum'})
                </Text>
              )}
              <View style={styles.cardFooter}>
                <Text style={styles.cardHours}>{item.horasEstudadas}h dedicadas</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => onEditarEstudo(item)}>
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onExcluirEstudo(item.id)}>
                    <Text style={styles.deleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
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
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 14
  },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, lineHeight: 36 },
  heroText: { fontSize: 15.5, color: '#475569', lineHeight: 24, marginBottom: 24, maxWidth: 900 },
  inicioInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  inicioBox: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  inicioBoxTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  inicioBoxDesc: { fontSize: 13.5, color: '#475569', lineHeight: 20 },
  heroActionsRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  outlineButtonText: { color: '#334155', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  adminResumoText: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  statCardBox: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', marginBottom: 4 },
  statLabelText: { fontSize: 13.5, fontWeight: '600', color: '#64748B' },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
    flexWrap: 'wrap'
  },
  smallPrimaryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  smallPrimaryBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyText: { color: '#64748B', fontSize: 15, textAlign: 'center' },
  studyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  cardContent: { fontSize: 14.5, color: '#475569', marginBottom: 6 },
  cardMeta: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10
  },
  cardHours: { fontSize: 13.5, color: '#64748B', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 16 },
  editText: { color: '#2563EB', fontSize: 14, fontWeight: 'bold' },
  deleteText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
  bold: { fontWeight: '600', color: '#0F172A' },
});