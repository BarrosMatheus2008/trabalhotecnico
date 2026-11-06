const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'chave_secreta_super_segura';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'controle_estudos'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Servidor rodando na porta 3000 e conectado ao MySQL!');
});

// AUTENTICAÇÃO
app.post('/register', async (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    db.query(
      'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, nivel || 'usuario'],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao cadastrar. E-mail já em uso.' });
        res.json({ message: 'Usuário cadastrado com sucesso!' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: usuario.id, nivel: usuario.nivel }, SECRET_KEY, { expiresIn: '2h' });

    res.json({ 
      message: 'Login realizado com sucesso!', 
      token, 
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } 
    });
  });
});

// ROTA PARA ALTERAR SENHA (PERFIL)
app.put('/usuarios/senha', async (req, res) => {
  const { usuarioId, novaSenha } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashedPassword, usuarioId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao alterar senha.' });
      res.json({ message: 'Senha alterada com sucesso!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// CRUD DE ESTUDOS (FILTRADO POR USUÁRIO LOGADO)
app.get('/estudos/usuario/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;
  db.query('SELECT * FROM estudos WHERE usuario_id = ?', [usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/estudos', (req, res) => {
  const { disciplina, conteudo, horasEstudadas, status, usuarioId } = req.body;
  const query = 'INSERT INTO estudos (disciplina, conteudo, horasEstudadas, status, usuario_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [disciplina, conteudo, horasEstudadas, status || 'Pendente', usuarioId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estudo cadastrado com sucesso!', id: result.insertId });
  });
});

app.put('/estudos/:id', (req, res) => {
  const { id } = req.params;
  const { disciplina, conteudo, horasEstudadas, status } = req.body;
  const query = 'UPDATE estudos SET disciplina = ?, conteudo = ?, horasEstudadas = ?, status = ? WHERE id = ?';
  db.query(query, [disciplina, conteudo, horasEstudadas, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estudo atualizado com sucesso!' });
  });
});

app.delete('/estudos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM estudos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estudo excluído com sucesso!' });
  });
});

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});