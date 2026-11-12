# Controle de Estudos — Aplicação Mobile com Autenticação JWT

Aplicação mobile desenvolvida para auxiliar estudantes na organização de tarefas, matérias e rotinas de estudo, oferecendo controle de acesso por níveis de usuário e integração completa com API REST e banco de dados relacional[cite: 1, 2].

---

## 1. Problema Identificado e Solução Proposta

* **Problema:** Muitos estudantes enfrentam dificuldades para organizar prazos, disciplinas e metas de estudo de forma centralizada e estruturada, o que prejudica o acompanhamento do progresso acadêmico[cite: 2, 3].
* **Público Afetado:** Estudantes do ensino médio, técnico e pré-vestibular.
* **Solução:** O aplicativo **Controle de Estudos** centraliza o gerenciamento de atividades acadêmicas em uma interface mobile intuitiva, permitindo cadastrar, consultar, atualizar e excluir metas de estudo (CRUD), com autenticação segura e controle de permissões por perfil[cite: 2, 5].

---

## 2. Tecnologias Utilizadas

* **Front-end Mobile:** React Native com Expo e React Navigation[cite: 2].
* **Back-end (API REST):** Node.js com Express[cite: 2].
* **Banco de Dados:** MySQL[cite: 2].
* **Segurança e Autenticação:** Criptografia de senhas com `bcrypt` e autenticação baseada em JSON Web Token (`JWT`) com envio via cabeçalho `Bearer Token`[cite: 2].

---

## 3. Níveis de Usuário e Controle de Permissões

O sistema implementa dois níveis de acesso controlados via *middleware* no back-end[cite: 2, 5]:

1. **Usuário Comum (Estudante):** Pode realizar cadastro, efetuar login, visualizar suas informações e gerenciar suas próprias atividades de estudo (CRUD).
2. **Administrador:** Possui acesso privilegiado às rotas administrativas protegidas para supervisão e gestão geral do sistema.

---

## 4. Estrutura do Repositório

```text
Trabalhotec/
├── ControleEstudos/       # Código-fonte do aplicativo mobile (React Native / Expo)
│   ├── src/
│   │   ├── screens/       # Telas (Login, Cadastro, Home, Perfil, Formulários)
│   │   └── services/      # Integração com a API (fetch / Bearer Token)
│   └── App.js
├── api-mysql/             # Código-fonte da API REST (Node.js / Express)
│   ├── database.sql       # Script SQL de criação do banco de dados e tabelas
│   ├── server.js          # Configuração do servidor, rotas, middlewares e JWT
│   └── package.json
└── README.md              # Documentação oficial do projeto