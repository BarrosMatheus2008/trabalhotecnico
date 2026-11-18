const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'chave_secreta_super_segura_trabalho';

// Conexão com o MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'controle_estudos'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL com sucesso!');
});

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT (Protege Rotas)
// ==========================================
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token mal formatado.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        req.usuario = decoded; // Guarda os dados decodificados (id, nivel)
        next();
    });
}

// ==========================================
// ROTAS PÚBLICAS (Cadastro e Login)
// ==========================================
app.post('/register', async (req, res) => {
    const { nome, email, senha, nivel } = req.body;
    try {
        const hashSenha = await bcrypt.hash(senha, 10);
        const userNivel = nivel || 'comum';
        
        const query = 'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)';
        db.query(query, [nome, email, hashSenha, userNivel], (err, result) => {
            if (err) return res.status(500).json({ erro: 'Erro ao cadastrar usuário no banco.', detalhe: err });
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (results.length === 0) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

        // Gera o token JWT válido por 2 horas
        const token = jwt.sign({ id: usuario.id, nivel: usuario.nivel }, SECRET_KEY, { expiresIn: '2h' });

        res.json({ 
            mensagem: 'Login bem-sucedido!', 
            token, 
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } 
        });
    });
});

// ==========================================
// ROTA SEGURA DE ALTERAÇÃO DE SENHA (Usa o ID do Token)
// ==========================================
app.put('/alterar-senha', verificarToken, async (req, res) => {
    const { novaSenha } = req.body;
    const usuarioId = req.usuario.id; // Extraído de forma segura do Token JWT

    try {
        const hashSenha = await bcrypt.hash(novaSenha, 10);
        const query = 'UPDATE usuarios SET senha = ? WHERE id = ?';

        db.query(query, [hashSenha, usuarioId], (err, result) => {
            if (err) return res.status(500).json({ erro: 'Erro ao atualizar senha.' });
            res.json({ mensagem: 'Senha alterada com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno.' });
    }
});

// ==========================================
// ROTAS DE CRUD (Protegidas por JWT)
// ==========================================
app.get('/estudos', verificarToken, (req, res) => {
    const query = 'SELECT * FROM estudos WHERE usuario_id = ?';
    db.query(query, [req.usuario.id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar estudos.' });
        res.json(results);
    });
});

app.post('/estudos', verificarToken, (req, res) => {
    const { disciplina, conteudo, horasEstudadas, status } = req.body;
    const usuario_id = req.usuario.id;

    const query = 'INSERT INTO estudos (usuario_id, disciplina, conteudo, horasEstudadas, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [usuario_id, disciplina, conteudo, horasEstudadas, status || 'Pendente'], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao criar estudo.' });
        res.status(201).json({ mensagem: 'Estudo criado com sucesso!', id: result.insertId });
    });
});

app.put('/estudos/:id', verificarToken, (req, res) => {
    const { disciplina, conteudo, horasEstudadas, status } = req.body;
    const estudoId = req.params.id;

    const query = 'UPDATE estudos SET disciplina = ?, conteudo = ?, horasEstudadas = ?, status = ? WHERE id = ? AND usuario_id = ?';
    db.query(query, [disciplina, conteudo, horasEstudadas, status, estudoId, req.usuario.id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar estudo.' });
        res.json({ mensagem: 'Estudo atualizado com sucesso!' });
    });
});

app.delete('/estudos/:id', verificarToken, (req, res) => {
    const estudoId = req.params.id;
    const query = 'DELETE FROM estudos WHERE id = ? AND usuario_id = ?';

    db.query(query, [estudoId, req.usuario.id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao deletar estudo.' });
        res.json({ mensagem: 'Estudo removido com sucesso!' });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});