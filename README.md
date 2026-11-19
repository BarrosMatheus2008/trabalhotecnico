# Controle de Estudos Pro

Aplicacao full-stack em **React Native (Expo)**, **Node.js (Express)** e **MySQL** com autenticacao **JWT (`Bearer Token`)**, hash de senha (`bcryptjs`), controle de niveis (`comum` e `admin`) e CRUD completo de estudos.

## Problema e Solucao
Estudantes costumam perder o controle de horas dedicadas, prioridades e status dos conteudos entre varias disciplinas. O aplicativo centraliza o registro e acompanhamento dos estudos com autenticacao segura e persistencia em banco relacional.

## Estrutura de Pastas
- `api-mysql/database.sql`: script de criacao do banco `controle_estudos` e tabelas `usuarios` e `estudos`.
- `api-mysql/server.js`: API REST com cadastro, login, hash de senha, middleware JWT, controle de nivel e rotas CRUD (`GET`, `POST`, `PUT`, `DELETE`).
- `ControleEstudos/App.js`: interface principal do aplicativo (modo visitante, login, cadastro, painel de estatisticas e CRUD).
- `ControleEstudos/SobreAppSection.js`: secao informativa e simulador de carga horaria.

## Como Rodar
1. **Banco MySQL**: execute `api-mysql/database.sql` no seu servidor MySQL.
2. **API REST**:
   ```bash
   cd api-mysql
   npm install express mysql2 bcryptjs jsonwebtoken cors
   node server.js