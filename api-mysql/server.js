const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'chave_secreta_super_segura_trabalho';

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
    console.log('Conectado ao banco de dados MySQL com sucesso!');
});

// Rota de Login Blindada com Logs no Terminal
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    console.log(`> Tentativa de login recebida para o e-mail: ${email}`);

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Erro no SQL:', err);
            return res.status(500).json({ erro: 'Erro no servidor ao buscar usuário.' });
        }
        
        if (results.length === 0) {
            console.log('-> E-mail não encontrado no banco.');
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const usuario = results[0];
        
        try {
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                console.log('-> Senha incorreta.');
                return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
            }

            const token = jwt.sign({ id: usuario.id, nivel: usuario.nivel }, SECRET_KEY, { expiresIn: '2h' });
            console.log(`-> Login bem-sucedido para: ${usuario.nome}`);

            res.json({ 
                mensagem: 'Login bem-sucedido!', 
                token, 
                usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } 
            });
        } catch (bcryptError) {
            console.error('Erro no bcrypt:', bcryptError);
            res.status(500).json({ erro: 'Erro interno ao validar senha.' });
        }
    });
});

// Demais rotas básicas para manter a API íntegra
app.post('/register', async (req, res) => {
    const { nome, email, senha, nivel } = req.body;
    try {
        const hashSenha = await bcrypt.hash(senha, 10);
        const query = 'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)';
        db.query(query, [nome, email, hashSenha, nivel || 'comum'], (err, result) => {
            if (err) return res.status(500).json({ erro: 'Erro ao cadastrar usuário.', detalhe: err });
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno.' });
    }
});

app.get('/estudos', (req, res) => {
    res.json([]);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});