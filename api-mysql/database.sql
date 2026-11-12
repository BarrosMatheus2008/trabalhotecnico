-- Criação do banco de dados do sistema de controle de estudos
CREATE DATABASE IF NOT EXISTS controle_estudos;
USE controle_estudos;

-- Tabela de Níveis de Usuário (ex: Aluno/Comum e Administrador)
CREATE TABLE IF NOT EXISTS niveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- Inserindo os níveis iniciais padrão
INSERT INTO niveis (nome) VALUES ('Comum'), ('Administrador');

-- Tabela de Usuários (com suporte a hash de senha e níveis de acesso)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Armazenará o hash gerado pelo bcrypt
    nivel_id INT NOT NULL,
    FOREIGN KEY (nivel_id) REFERENCES niveis(id)
);

-- Tabela da Entidade Principal do seu Projeto (ex: Tarefas / Matérias de Estudo)
CREATE TABLE IF NOT EXISTS estudos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'Pendente',
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);