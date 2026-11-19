# Controle de Estudos Pro

Aplicação full-stack para organização e acompanhamento de estudos, com autenticação via **JWT**, senhas criptografadas com **bcrypt**, persistência em **MySQL** e interface desenvolvida em **React Native + Expo** (suportando Web e Mobile).

## Funcionalidades

- **Modo Visitante**: navegação inicial, apresentação do sistema e acesso ao fluxo de login/cadastro.
- **Autenticação e Níveis de Acesso**:
  - Cadastro e login de usuários com `bcrypt` e token `JWT` (`Bearer Token`).
  - Separação entre visão de **usuário comum** e visão de **administrador** (`admin`).
- **CRUD de Estudos**:
  - Criar, listar, editar e excluir registros de estudo (`disciplina`, `conteudo`, `horasEstudadas`, `status` e `prioridade`).
- **Gestão Administrativa de Usuários**:
  - Visualização de usuários cadastrados com busca por nome/e-mail, filtros por nível (`Todos`, `Comuns`, `Admins`) e cards expansíveis.
  - Exclusão de contas de usuários pelo administrador com remoção segura dos estudos vinculados.

## Stack Tecnológica

- **Front-end**: React Native, Expo, AsyncStorage
- **Back-end**: Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, `cors`
- **Banco de Dados**: MySQL (`mysql2/promise`)

## Estrutura do Projeto

```text
Trabalhotec/
├── api-mysql/
│   ├── server.js          # API REST, autenticação JWT, CRUD de estudos e rotas /admin
│   ├── database.sql       # Script de criação/estrutura das tabelas
│   └── package.json
├── ControleEstudos/
│   ├── App.js             # Navegação principal, sessão e integração com a API
│   ├── src/
│   │   └── screens/       # Telas (HomeScreen, FormScreen, ProfileScreen, LoginScreen, RegisterScreen, AboutScreen)
│   └── package.json
└── README.md