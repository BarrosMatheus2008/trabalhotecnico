import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@controle_estudos:token';
const USUARIO_KEY = '@controle_estudos:usuario';

// Salva token e dados públicos do usuário (nunca a senha)
export async function salvarSessao(token, usuario) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USUARIO_KEY, JSON.stringify(usuario)],
  ]);
}

// Retorna { token, usuario } ou null se não houver sessão salva
export async function carregarSessao() {
  const [[, token], [, usuarioJson]] = await AsyncStorage.multiGet([TOKEN_KEY, USUARIO_KEY]);

  if (!token || !usuarioJson) return null;

  try {
    return { token, usuario: JSON.parse(usuarioJson) };
  } catch {
    // Dado corrompido: descarta para evitar travar o app
    await limparSessao();
    return null;
  }
}

export async function limparSessao() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
}
