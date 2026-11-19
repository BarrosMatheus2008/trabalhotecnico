import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function FormScreen({
  modo = 'logado',
  editandoId = null,
  disciplina: disciplinaProp,
  setDisciplina: setDisciplinaProp,
  conteudo: conteudoProp,
  setConteudo: setConteudoProp,
  horasEstudadas: horasProp,
  setHorasEstudadas: setHorasProp,
  statusEstudo: statusProp,
  setStatusEstudo: setStatusProp,
  prioridade: prioridadeProp,
  setPrioridade: setPrioridadeProp,
  onSalvar,
  onCancelarEdicao,
  onExigirLogin
}) {
  const [discLocal, setDiscLocal] = useState('');
  const [contLocal, setContLocal] = useState('');
  const [horasLocal, setHorasLocal] = useState('');
  const [statusLocal, setStatusLocal] = useState('Pendente');
  const [prioLocal, setPrioLocal] = useState('Média');

  const isVisitante = modo === 'visitante';
  const disciplina = isVisitante ? discLocal : disciplinaProp;
  const setDisciplina = isVisitante ? setDiscLocal : setDisciplinaProp;
  const conteudo = isVisitante ? contLocal : conteudoProp;
  const setConteudo = isVisitante ? setContLocal : setConteudoProp;
  const horasEstudadas = isVisitante ? horasLocal : horasProp;
  const setHorasEstudadas = isVisitante ? setHorasLocal : setHorasProp;
  const statusEstudo = isVisitante ? statusLocal : statusProp;
  const setStatusEstudo = isVisitante ? setStatusLocal : setStatusProp;
  const prioridade = isVisitante ? prioLocal : prioridadeProp;
  const setPrioridade = isVisitante ? setPrioLocal : setPrioridadeProp;

  return (
    <View style={styles.wideCard}>
      <Text style={styles.sectionTitle}>
        {isVisitante
          ? 'Simulacao Protegida com Alerta'
          : editandoId
          ? `Editando Estudo #${editandoId}`
          : 'Registrar Novo Estudo Personalizado'}
      </Text>
      <Text style={styles.sectionDescription}>
        {isVisitante
          ? 'O sistema exige autenticacao para salvar registros personalizados no banco.'
          : 'Defina disciplina, conteudo, horas, status e prioridade separados.'}
      </Text>

      <Text style={styles.label}>Nome da Disciplina</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Matematica"
        placeholderTextColor="#94A3B8"
        value={disciplina}
        onChangeText={setDisciplina}
      />

      <Text style={styles.label}>Conteudo Abordado</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Geometria Analitica"
        placeholderTextColor="#94A3B8"
        value={conteudo}
        onChangeText={setConteudo}
      />

      <Text style={styles.label}>Horas Dedicadas</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 3"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={horasEstudadas}
        onChangeText={setHorasEstudadas}
      />

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

      <Text style={styles.label}>Nivel de Prioridade</Text>
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

      {isVisitante ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onExigirLogin('salvar um estudo personalizado')}
        >
          <Text style={styles.primaryButtonText}>Salvar Estudo no Sistema</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={onSalvar}>
            <Text style={styles.primaryButtonText}>
              {editandoId ? 'Salvar Alteracoes (PUT)' : 'Salvar Estudo no MySQL (POST)'}
            </Text>
          </TouchableOpacity>

          {editandoId && (
            <TouchableOpacity style={styles.outlineButton} onPress={onCancelarEdicao}>
              <Text style={styles.outlineButtonText}>Cancelar Edicao</Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
  sectionDescription: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  label: { fontSize: 13.5, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12
  },
  optionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  optionChip: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  optionChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionText: { fontSize: 13.5, fontWeight: '600', color: '#475569' },
  optionTextActive: { color: '#FFFFFF' },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10
  },
  outlineButtonText: { color: '#334155', fontSize: 15, fontWeight: '600' },
});