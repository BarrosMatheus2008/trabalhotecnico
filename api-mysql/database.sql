DROP DATABASE IF EXISTS controle_estudos;
CREATE DATABASE controle_estudos;
USE controle_estudos;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) DEFAULT 'comum'
);

CREATE TABLE estudos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    disciplina VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    horasEstudadas INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);