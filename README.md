# Controle de Estudos - Aplicação Mobile com JWT e Níveis de Usuário

Plataforma de gestão acadêmica e organização de rotina de estudos desenvolvida em React Native com Expo, integrada a uma API REST em Node.js/Express e base de dados relacional MySQL.

---

## 💡 1. Problema Atual e Solução Proposta

* **O Problema:** Estudantes frequentemente enfrentam dificuldades para organizar a sua carga horária, gerir disciplinas e acompanhar o progresso das suas tarefas de estudo antes das avaliações.
* **A Solução:** O aplicativo **Controle de Estudos** resolve este problema permitindo o planeamento individualizado, controlo de horas dedicadas e monitorização de status de tarefas (Pendente/Concluído) em tempo real, com isolamento seguro de dados por utilizador.

---

## 🚀 2. Tecnologias Utilizadas

* **Front-end:** React Native, Expo, React Navigation (Native Stack), Axios.
* **Back-end:** Node.js, Express REST API, JSONWebToken (JWT), Bcrypt.js, CORS.
* **Banco de Dados:** MySQL.

---

## 👥 3. Níveis de Usuário e Permissões

* **Modo Visitante / Exploração:** Permite visualizar a interface e a tela de informações sem necessidade de cadastro prévio. A tentativa de criar ou gerir dados força o redirecionamento para o login.
* **Perfil Usuário / Estudante:** Acesso autenticado exclusivo aos seus próprios estudos cadastrados (isolados via chave estrangeira `usuario_id`).
* **Perfil Administrador:** Permite auditoria global e visualização de registos no sistema.

---

## 🔒 4. Segurança e Arquitetura

* **Autenticação JWT:** Proteção de rotas no back-end com validação de tokens enviados via cabeçalho *Bearer Token*.
* **Hash de Senhas:** Criptografia segura de credenciais utilizando a biblioteca `bcrypt` no servidor.
* **Alertas Universais:** Compatibilidade multiplataforma nativa para lidar com diálogos de confirmação tanto em navegadores Web quanto em dispositivos móveis (Android/iOS).

---

## ⚙️ 5. Como Executar o Projeto

1. **Configurar o Banco de Dados:**
   * Crie uma base de dados no MySQL chamada `controle_estudos` e execute os scripts de criação de tabelas para `usuarios` e `estudos` (com chave estrangeira `usuario_id`).
2. **Executar a API (Back-end):**
   * Entre na pasta da API (`cd api-mysql`), instale as dependências (`npm install`) e inicie o servidor (`node server.js` ou `npm start`).
3. **Executar o Aplicativo (Front-end):**
   * Na pasta do projeto (`ControleEstudos`), instale as dependências (`npm install`) e execute o Expo (`npx expo start`).