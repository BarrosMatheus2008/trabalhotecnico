const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'controle_estudos_jwt_secret_2026';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'controle_estudos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de autenticacao JWT (Bearer Token)
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token nao fornecido. Faca login.' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ erro: 'Token invalido ou expirado.' });
    }
    req.usuario = payload;
    next();
  });
}

// Middleware de verificacao de nivel de usuario
function exigirNivel(...niveisPermitidos) {
  return (req, res, next) => {
    const nivelAtual = req.usuario?.nivel || 'comum';
    if (!niveisPermitidos.includes(nivelAtual)) {
      return res.status(403).json({
        erro: `Acesso negado. Permissao exigida: ${niveisPermitidos.join(' ou ')}.`
      });
    }
    next();
  };
}

app.get('/', (req, res) => {
  res.json({ status: 'API Controle de Estudos Pro rodando' });
});

// Cadastro com hash de senha, validacoes especificas e niveis ('comum' ou 'admin')
app.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, nivel } = req.body;

    const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
    const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const senhaTexto = typeof senha === 'string' ? senha : '';

    if (!nomeLimpo) {
      return res.status(400).json({ erro: 'Campo Nome: informe o seu nome completo.' });
    }
    if (nomeLimpo.length < 2) {
      return res.status(400).json({ erro: 'Campo Nome: o nome deve ter pelo menos 2 caracteres.' });
    }

    if (!emailLimpo) {
      return res.status(400).json({ erro: 'Campo E-mail: informe um endereco de e-mail.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      return res.status(400).json({ erro: 'Campo E-mail: formato invalido (ex.: nome@exemplo.com).' });
    }

    if (!senhaTexto) {
      return res.status(400).json({ erro: 'Campo Senha: crie uma senha para a conta.' });
    }
    if (senhaTexto.length < 4) {
      return res.status(400).json({ erro: 'Campo Senha: a senha deve ter pelo menos 4 caracteres.' });
    }

    const nivelValidado = nivel === 'admin' ? 'admin' : 'comum';

    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailLimpo]
    );
    if (existente.length > 0) {
      return res.status(409).json({
        erro: `Campo E-mail: o e-mail "${emailLimpo}" ja esta cadastrado em outra conta.`
      });
    }

    const senhaHash = await bcrypt.hash(senhaTexto, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
      [nomeLimpo, emailLimpo, senhaHash, nivelValidado]
    );

    return res.status(201).json({
      mensagem: 'Conta cadastrada com sucesso! Faca o seu login.',
      usuario: {
        id: resultado.insertId,
        nome: nomeLimpo,
        email: emailLimpo,
        nivel: nivelValidado
      }
    });
  } catch (error) {
    console.error('Erro no /register:', error);
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        erro: 'Banco de dados: tabela de usuarios nao encontrada. Execute o database.sql no MySQL.'
      });
    }
    if (error && error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        erro: `Banco de dados: coluna ausente (${error.sqlMessage}). Atualize as tabelas no MySQL.`
      });
    }
    if (error && (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR')) {
      return res.status(500).json({
        erro: 'Banco de dados MySQL: falha de conexao ou credenciais no servidor.'
      });
    }
    return res.status(500).json({ erro: 'Servidor: erro interno inesperado ao cadastrar usuario.' });
  }
});

// Login e emissao de JWT
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const emailLimpo = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, nome, email, senha, nivel FROM usuarios WHERE email = ?',
      [emailLimpo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuarioDB = rows[0];
    const senhaValida = await bcrypt.compare(String(senha), usuarioDB.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      {
        id: usuarioDB.id,
        nome: usuarioDB.nome,
        email: usuarioDB.email,
        nivel: usuarioDB.nivel
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuarioDB.id,
        nome: usuarioDB.nome,
        email: usuarioDB.email,
        nivel: usuarioDB.nivel
      }
    });
  } catch (error) {
    console.error('Erro no /login:', error);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

// Rota exclusiva para nivel 'admin': resumo geral
app.get('/admin/resumo', autenticarToken, exigirNivel('admin'), async (req, res) => {
  try {
    const [[totais]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios) AS totalUsuarios,
        (SELECT COUNT(*) FROM estudos) AS totalEstudos,
        (SELECT COALESCE(SUM(horasEstudadas), 0) FROM estudos) AS totalHoras
    `);
    return res.json({
      nivel: req.usuario.nivel,
      resumo: totais
    });
  } catch (error) {
    console.error('Erro em /admin/resumo:', error);
    return res.status(500).json({ erro: 'Erro ao carregar resumo administrativo.' });
  }
});

// Rota exclusiva para nivel 'admin': listar usuarios
app.get('/admin/usuarios', autenticarToken, exigirNivel('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, nivel, criado_em FROM usuarios ORDER BY id ASC'
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erro em GET /admin/usuarios:', error);
    return res.status(500).json({ erro: 'Erro ao listar usuarios.' });
  }
});

// Rota exclusiva para nivel 'admin': excluir usuario
app.delete('/admin/usuarios/:id', autenticarToken, exigirNivel('admin'), async (req, res) => {
  try {
    const idAlvo = Number(req.params.id);
    if (idAlvo === Number(req.usuario.id)) {
      return res.status(400).json({ erro: 'Voce nao pode excluir a sua propria conta ativa de admin.' });
    }

    const [rows] = await pool.query('SELECT id, nome, nivel FROM usuarios WHERE id = ?', [idAlvo]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = ?', [idAlvo]);
    return res.json({ mensagem: `Usuario "${rows[0].nome}" excluido com sucesso.` });
  } catch (error) {
    console.error('Erro em DELETE /admin/usuarios/:id:', error);
    return res.status(500).json({ erro: 'Erro ao excluir usuario.' });
  }
});

// READ - Lista estudos do usuario (ou todos se for admin)
app.get('/estudos', autenticarToken, async (req, res) => {
  try {
    if (req.usuario.nivel === 'admin') {
      const [rows] = await pool.query(`
        SELECT e.*, u.nome AS nome_usuario, u.nivel AS nivel_usuario
        FROM estudos e
        JOIN usuarios u ON u.id = e.usuario_id
        ORDER BY e.id DESC
      `);
      return res.json(rows);
    }

    const [rows] = await pool.query(
      'SELECT * FROM estudos WHERE usuario_id = ? ORDER BY id DESC',
      [req.usuario.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erro no GET /estudos:', error);
    return res.status(500).json({ erro: 'Erro ao buscar estudos.' });
  }
});

// CREATE - Cria estudo com status e prioridade separados
app.post('/estudos', autenticarToken, async (req, res) => {
  try {
    const { disciplina, conteudo, horasEstudadas, status, prioridade } = req.body;
    if (!disciplina || !conteudo || horasEstudadas === undefined || horasEstudadas === '') {
      return res.status(400).json({ erro: 'Preencha disciplina, conteudo e horas.' });
    }

    const horasNumero = Number(horasEstudadas);
    if (Number.isNaN(horasNumero) || horasNumero < 0) {
      return res.status(400).json({ erro: 'Informe um numero valido de horas.' });
    }

    const statusValido = ['Pendente', 'Em Andamento', 'Concluído'].includes(status)
      ? status
      : 'Pendente';
    const prioridadeValida = ['Baixa', 'Média', 'Alta'].includes(prioridade)
      ? prioridade
      : 'Média';

    const [result] = await pool.query(
      `INSERT INTO estudos (usuario_id, disciplina, conteudo, horasEstudadas, status, prioridade)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id,
        String(disciplina).trim(),
        String(conteudo).trim(),
        horasNumero,
        statusValido,
        prioridadeValida
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      mensagem: 'Estudo salvo com sucesso.'
    });
  } catch (error) {
    console.error('Erro no POST /estudos:', error);
    return res.status(500).json({ erro: error.sqlMessage || 'Erro ao salvar estudo.' });
  }
});

// UPDATE - Atualiza estudo (dono do registro ou admin)
app.put('/estudos/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM estudos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Estudo nao encontrado.' });
    }

    const estudoAtual = rows[0];
    const ehDono = estudoAtual.usuario_id === req.usuario.id;
    const ehAdmin = req.usuario.nivel === 'admin';

    if (!ehDono && !ehAdmin) {
      return res.status(403).json({ erro: 'Sem permissao para editar este estudo.' });
    }

    const disciplina = req.body.disciplina !== undefined
      ? String(req.body.disciplina).trim()
      : estudoAtual.disciplina;
    const conteudo = req.body.conteudo !== undefined
      ? String(req.body.conteudo).trim()
      : estudoAtual.conteudo;
    const horasEstudadas = req.body.horasEstudadas !== undefined && req.body.horasEstudadas !== ''
      ? Number(req.body.horasEstudadas)
      : estudoAtual.horasEstudadas;
    const status = ['Pendente', 'Em Andamento', 'Concluído'].includes(req.body.status)
      ? req.body.status
      : estudoAtual.status;
    const prioridade = ['Baixa', 'Média', 'Alta'].includes(req.body.prioridade)
      ? req.body.prioridade
      : estudoAtual.prioridade;

    await pool.query(
      `UPDATE estudos
       SET disciplina = ?, conteudo = ?, horasEstudadas = ?, status = ?, prioridade = ?
       WHERE id = ?`,
      [disciplina, conteudo, horasEstudadas, status, prioridade, id]
    );

    return res.json({ mensagem: 'Estudo atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro no PUT /estudos/:id:', error);
    return res.status(500).json({ erro: error.sqlMessage || 'Erro ao atualizar estudo.' });
  }
});

// DELETE - Remove estudo (dono do registro ou admin)
app.delete('/estudos/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM estudos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Estudo nao encontrado.' });
    }

    const estudoAtual = rows[0];
    const ehDono = estudoAtual.usuario_id === req.usuario.id;
    const ehAdmin = req.usuario.nivel === 'admin';

    if (!ehDono && !ehAdmin) {
      return res.status(403).json({ erro: 'Sem permissao para excluir este estudo.' });
    }

    await pool.query('DELETE FROM estudos WHERE id = ?', [id]);
    return res.json({ mensagem: 'Estudo excluido com sucesso.' });
  } catch (error) {
    console.error('Erro no DELETE /estudos/:id:', error);
    return res.status(500).json({ erro: 'Erro ao excluir estudo.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
})
app.delete('/admin/usuarios/:id', autenticarToken, exigirAdmin, async (req, res) => {
  const idAlvo = Number(req.params.id);
  const idLogado = Number(req.usuario.id);

  if (!idAlvo) {
    return res.status(400).json({ erro: 'ID de usuário inválido.' });
  }

  if (idAlvo === idLogado) {
    return res.status(400).json({ erro: 'Você não pode excluir a própria conta admin ativa.' });
  }

  try {
    // Se a tabela estudos tiver chave estrangeira para usuario_id sem ON DELETE CASCADE,
    // remova os estudos do usuário antes para o MySQL não bloquear por foreign key:
    await pool.query('DELETE FROM estudos WHERE usuario_id = ?', [idAlvo]);

    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [idAlvo]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.json({ mensagem: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao excluir usuário no banco.' });
  }
});