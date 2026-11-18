// Ajuste para o IP da máquina onde a API roda (não use localhost em celular físico)
export const API_URL = 'http://192.168.0.10:3000';

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.erro || 'Erro na requisição');
    err.status = res.status;
    throw err;
  }

  return data;
}
