const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_controle_estudos_pro';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'controle_estudos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuario = decoded;
    next();
  });
}

function exigirAdmin(req, res, next) {
  if (!req.usuario || String(req.usuario.nivel || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

async function handlerCadastro(req, res) {
  try {
    const nome = req.body?.nome;
    const email = req.body?.email;
    const senha = req.body?.senha;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
    }

    const nomeLimpo = String(nome).trim();
    const emailLimpo = String(email).trim().toLowerCase();

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [emailLimpo]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
      [nomeLimpo, emailLimpo, senhaHash, 'comum']
    );

    const usuarioCriado = {
      id: result.insertId,
      nome: nomeLimpo,
      email: emailLimpo,
      nivel: 'comum'
    };

    const token = jwt.sign(usuarioCriado, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: usuarioCriado
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
}

async function handlerLogin(req, res) {
  try {
    const email = req.body?.email;
    const senha = req.body?.senha;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe email e senha.' });
    }

    const [rows] = await pool.query(
      'SELECT id, nome, email, senha, nivel FROM usuarios WHERE email = ? LIMIT 1',
      [String(email).trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const user = rows[0];
    const senhaValida = await bcrypt.compare(String(senha), user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const payloadUsuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      nivel: user.nivel
    };

    const token = jwt.sign(payloadUsuario, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      usuario: payloadUsuario
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
}

// Rotas de autenticação (compatíveis com /auth/... e /...)
app.post('/auth/register', handlerCadastro);
app.post('/register', handlerCadastro);
app.post('/auth/login', handlerLogin);
app.post('/login', handlerLogin);

// CRUD de estudos
app.get('/estudos', autenticarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, usuario_id, disciplina, conteudo, horasEstudadas, status, prioridade
       FROM estudos
       WHERE usuario_id = ?
       ORDER BY id DESC`,
      [req.usuario.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar estudos:', error);
    return res.status(500).json({ erro: 'Erro ao buscar estudos.' });
  }
});

app.post('/estudos', autenticarToken, async (req, res) => {
  try {
    const { disciplina, conteudo, horasEstudadas, status, prioridade } = req.body;
    if (!disciplina || !conteudo || horasEstudadas === undefined) {
      return res.status(400).json({ erro: 'Preencha disciplina, conteúdo e horas.' });
    }

    const [result] = await pool.query(
      `INSERT INTO estudos (usuario_id, disciplina, conteudo, horasEstudadas, status, prioridade)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id,
        disciplina,
        conteudo,
        Number(horasEstudadas),
        status || 'Pendente',
        prioridade || 'Media'
      ]
    );

    return res.status(201).json({ id: result.insertId, mensagem: 'Estudo criado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar estudo:', error);
    return res.status(500).json({ erro: 'Erro ao criar estudo.' });
  }
});

app.put('/estudos/:id', autenticarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { disciplina, conteudo, horasEstudadas, status, prioridade } = req.body;

    const [result] = await pool.query(
      `UPDATE estudos
       SET disciplina = ?, conteudo = ?, horasEstudadas = ?, status = ?, prioridade = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        disciplina,
        conteudo,
        Number(horasEstudadas),
        status || 'Pendente',
        prioridade || 'Media',
        id,
        req.usuario.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Estudo não encontrado.' });
    }

    return res.json({ mensagem: 'Estudo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar estudo:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar estudo.' });
  }
});

app.delete('/estudos/:id', autenticarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query(
      'DELETE FROM estudos WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Estudo não encontrado.' });
    }

    return res.json({ mensagem: 'Estudo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir estudo:', error);
    return res.status(500).json({ erro: 'Erro ao excluir estudo.' });
  }
});

// Rotas Admin
app.get('/admin/resumo', autenticarToken, exigirAdmin, async (req, res) => {
  try {
    const [[totaisUsuarios]] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');
    const [[totaisEstudos]] = await pool.query(
      'SELECT COUNT(*) AS totalEstudos, COALESCE(SUM(horasEstudadas), 0) AS totalHoras FROM estudos'
    );

    return res.json({
      resumo: {
        totalUsuarios: Number(totaisUsuarios.totalUsuarios || 0),
        totalEstudos: Number(totaisEstudos.totalEstudos || 0),
        totalHoras: Number(totaisEstudos.totalHoras || 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo admin:', error);
    return res.status(500).json({ erro: 'Erro ao buscar resumo administrativo.' });
  }
});

app.get('/admin/usuarios', autenticarToken, exigirAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.nome,
        u.email,
        u.nivel,
        COUNT(e.id) AS total_estudos,
        COALESCE(SUM(e.horasEstudadas), 0) AS total_horas
      FROM usuarios u
      LEFT JOIN estudos e ON e.usuario_id = u.id
      GROUP BY u.id, u.nome, u.email, u.nivel
      ORDER BY u.id ASC
    `);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ erro: 'Erro ao buscar usuários no banco.' });
  }
});

app.delete('/admin/usuarios/:id', autenticarToken, exigirAdmin, async (req, res) => {
  const idAlvo = Number(req.params.id);
  const idLogado = Number(req.usuario.id);

  if (!Number.isInteger(idAlvo) || idAlvo <= 0) {
    return res.status(400).json({ erro: 'ID de usuário inválido.' });
  }

  if (idAlvo === idLogado) {
    return res.status(400).json({ erro: 'Você não pode excluir a própria conta admin ativa.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM estudos WHERE usuario_id = ?', [idAlvo]);
    const [result] = await conn.query('DELETE FROM usuarios WHERE id = ?', [idAlvo]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    await conn.commit();
    return res.json({ mensagem: 'Usuário excluído com sucesso!' });
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao excluir usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao excluir usuário.' });
  } finally {
    conn.release();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});