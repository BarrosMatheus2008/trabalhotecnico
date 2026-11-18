import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FeatureCard = ({ icon, title, description, accentColor, isDesktop }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.featureCard, { width: isDesktop ? '31.5%' : '100%' }, hovered && styles.cardHovered]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${accentColor}15` }]}>
        <Ionicons name={icon} size={26} color={accentColor} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
};

const SimuladoCalculadora = () => {
  const [materias, setMaterias] = useState('4');
  const [horasDia, setHorasDia] = useState('3');
  const totalSemana = Number(materias) * Number(horasDia) * 5;

  return (
    <View style={styles.simulatorCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="calculator-outline" size={22} color="#D97706" />
        </View>
        <Text style={styles.sectionTitle}>Simulador Interativo de Carga Horária</Text>
      </View>
      <Text style={styles.paragraph}>
        Calcule rapidamente o seu potencial de dedicação semanal com base na sua rotina acadêmica:
      </Text>
      <View style={styles.simRow}>
        <View style={styles.simField}>
          <Text style={styles.label}>Matérias por dia:</Text>
          <TextInput 
            style={styles.inputSim} 
            keyboardType="numeric" 
            value={materias} 
            onChangeText={setMaterias} 
          />
        </View>
        <View style={styles.simField}>
          <Text style={styles.label}>Horas em cada matéria:</Text>
          <TextInput 
            style={styles.inputSim} 
            keyboardType="numeric" 
            value={horasDia} 
            onChangeText={setHorasDia} 
          />
        </View>
      </View>
      <View style={styles.simResultBox}>
        <Text style={styles.simResultText}>🔥 Você dedicará cerca de <Text style={{color: '#2563EB', fontWeight: 'bold'}}>{totalSemana} horas líquidas</Text> por semana aos estudos!</Text>
      </View>
    </View>
  );
};

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggleOpen} style={[styles.faqCard, open && styles.faqCardOpen]}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#2563EB" />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

export default function SobreAppSection({ onAcessarLogin, onIrCadastro }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const funcionalidades = [
    { icon: 'calendar-outline', title: 'Cronograma Semanal', description: 'Organize suas disciplinas por ciclos de foco otimizados.', accentColor: '#2563EB' },
    { icon: 'timer-outline', title: 'Cronômetro Líquido', description: 'Meça o tempo exato de foco em cada sessão sem distrações.', accentColor: '#10B981' },
    { icon: 'folder-open-outline', title: 'Divisão de Tópicos', description: 'Quebre conteúdos densos em subtópicos fáceis de dominar.', accentColor: '#7C3AED' },
    { icon: 'flash-outline', title: 'Técnica Pomodoro', description: 'Alterne blocos de estudo intenso com pausas estratégicas.', accentColor: '#D97706' },
    { icon: 'bar-chart-outline', title: 'Gráficos de Desempenho', description: 'Acompanhe relatórios visuais da sua evolução acadêmica.', accentColor: '#0284C7' },
    { icon: 'cloud-done-outline', title: 'Backup em Nuvem', description: 'Seus dados protegidos e sincronizados em tempo real via MySQL.', accentColor: '#16A34A' },
  ];

  const dicasEstudo = [
    { title: '💡 Active Recall (Recuperação Ativa)', desc: 'Em vez de apenas reler textos, force seu cérebro a relembrar o conteúdo ativamente.' },
    { title: '🔄 Revisão Espaçada', desc: 'Revise o material estudado após 1 dia, 7 dias e 30 dias para fixar na memória de longo prazo.' },
    { title: '🎯 Foco Único (Deep Work)', desc: 'Elimine o celular e distrações durante os blocos de estudo para dobrar sua retenção.' }
  ];

  const faqs = [
    { question: 'Como o app protege minha senha?', answer: 'Utilizamos criptografia bcrypt robusta no back-end e autenticação via token JWT.' },
    { question: 'Posso usar sem internet?', answer: 'O Modo Visitante funciona localmente, mas para salvar dados é necessária conexão com o servidor MySQL.' },
    { question: 'O aplicativo é gratuito para estudantes?', answer: 'Sim, totalmente gratuito para apoiar aprovações em vestibulares e concursos.' }
  ];

  return (
    <View style={[styles.wrapper, isDesktop && styles.wrapperDesktop]}>
      <LinearGradient colors={['#1E293B', '#2563EB', '#1D4ED8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
        <View style={styles.heroPill}>
          <Ionicons name="sparkles" size={14} color="#DBEAFE" />
          <Text style={styles.heroPillText}>VERSÃO PRO • EDIÇÃO EXPANDIDA</Text>
        </View>
        <Text style={styles.heroTitle}>Domine Seus Estudos com Tecnologia Avançada</Text>
        <Text style={styles.heroSlogan}>
          Uma plataforma completa projetada para transformar sua disciplina diária em aprovações garantidas.
        </Text>
        <View style={styles.heroButtonsRow}>
          <TouchableOpacity style={styles.heroBtnPrimary} onPress={onIrCadastro}>
            <Text style={styles.heroBtnPrimaryText}>Criar Conta Gratuita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtnOutline} onPress={onAcessarLogin}>
            <Text style={styles.heroBtnOutlineText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SimuladoCalculadora />

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="school-outline" size={22} color="#2563EB" />
          </View>
          <Text style={styles.sectionTitle}>Pilares de Alta Performance Acadêmica</Text>
        </View>
        <Text style={styles.paragraph}>
          Estudar muito nem sempre significa estudar bem. O <Text style={styles.bold}>Controle de Estudos Pro</Text> baseia-se em metodologias comprovadas de neurociência e produtividade:
        </Text>
        <View style={styles.dicasContainer}>
          {dicasEstudo.map((dica, idx) => (
            <View key={idx} style={styles.dicaBox}>
              <Text style={styles.dicaTitle}>{dica.title}</Text>
              <Text style={styles.dicaDesc}>{dica.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.externalSectionTitle}>Funcionalidades Detalhadas</Text>
        <Text style={styles.externalSectionSubtitle}>Tudo o que você precisa em uma interface fluida e moderna.</Text>
        <View style={styles.gridWrap}>
          {funcionalidades.map((item, idx) => (
            <FeatureCard key={idx} {...item} isDesktop={isDesktop} />
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#16A34A" />
          </View>
          <Text style={styles.sectionTitle}>Arquitetura e Segurança de Ponta</Text>
        </View>
        <Text style={styles.paragraph}>
          Desenvolvido com padrão corporativo utilizando <Text style={styles.bold}>React Native, Node.js, Express, JWT e MySQL</Text>. Seus dados acadêmicos ficam totalmente isolados e protegidos por criptografia de nível industrial.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.externalSectionTitle}>Dúvidas Frequentes (FAQ)</Text>
        {faqs.map((faq, idx) => (
          <FaqItem key={idx} {...faq} />
        ))}
      </View>

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Pronto para revolucionar seus estudos?</Text>
        <Text style={styles.ctaSubtitle}>Acesse agora a sua área restrita e comece a registrar suas conquistas.</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.ctaButton} onPress={onAcessarLogin}>
          <Text style={styles.ctaButtonText}>Acessar Área do Estudante</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Controle de Estudos Pro • 2026</Text>
        <Text style={styles.footerMeta}>Desenvolvido com excelência técnica para máxima performance.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', paddingHorizontal: 16, paddingBottom: 40 },
  wrapperDesktop: { maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 32 },
  heroBanner: { borderRadius: 24, padding: 36, marginBottom: 24, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  heroPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.18)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16, gap: 6 },
  heroPillText: { color: '#EFF6FF', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.8 },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, lineHeight: 40 },
  heroSlogan: { fontSize: 16, color: '#E2E8F0', lineHeight: 24, maxWidth: 780, marginBottom: 20 },
  heroButtonsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  heroBtnPrimary: { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12 },
  heroBtnPrimaryText: { color: '#2563EB', fontWeight: 'bold', fontSize: 14.5 },
  heroBtnOutline: { borderWidth: 1.5, borderColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12 },
  heroBtnOutlineText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14.5 },
  simulatorCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  simRow: { flexDirection: 'row', gap: 16, marginVertical: 12 },
  simField: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  inputSim: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#0F172A' },
  simResultBox: { backgroundColor: '#EFF6FF', padding: 14, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  simResultText: { fontSize: 14.5, color: '#1E3A8A', textAlign: 'center' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, marginBottom: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  sectionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  paragraph: { fontSize: 15, color: '#334155', lineHeight: 24, marginBottom: 16 },
  bold: { fontWeight: '700', color: '#0F172A' },
  dicasContainer: { gap: 12, marginTop: 8 },
  dicaBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  dicaTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  dicaDesc: { fontSize: 13.5, color: '#475569', lineHeight: 20 },
  sectionContainer: { marginBottom: 28 },
  externalSectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  externalSectionSubtitle: { fontSize: 15, color: '#64748B', marginBottom: 20, lineHeight: 22 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  featureCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: 'transparent' },
  cardHovered: { borderColor: '#93C5FD', transform: [{ translateY: -4 }], shadowOpacity: 0.15 },
  iconBadge: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#475569', lineHeight: 21 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  faqCardOpen: { borderColor: '#93C5FD', backgroundColor: '#F8FAFC' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  faqQuestion: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', flex: 1 },
  faqAnswer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', fontSize: 14.5, color: '#475569', lineHeight: 22 },
  ctaCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 36, alignItems: 'center', marginBottom: 32, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  ctaTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  ctaSubtitle: { fontSize: 15, color: '#CBD5E1', textAlign: 'center', lineHeight: 22, maxWidth: 600, marginBottom: 24 },
  ctaButton: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, gap: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
  footerMeta: { fontSize: 13, color: '#64748B', textAlign: 'center' },
});