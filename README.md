# 📚 Registro de Estudantes - Sistema de Matrícula Online

Um sistema moderno para gestão de matrículas de estudantes com interface inspirada no WhatsApp, desenvolvido com React e Node.js.

![Sistema de Matrícula](https://i.imgur.com/PJNnUhc.png)

## 📋 Sobre o Projeto

Este é um sistema completo para gerenciamento de matrículas de estudantes, que permite aos administradores gerenciar matrículas, documentos e cursos, enquanto oferece aos estudantes uma experiência amigável e intuitiva para o processo de inscrição.

## ✨ Funcionalidades

### Para Estudantes:
- 💬 Interface de chat inspirada no WhatsApp para orientar o processo de matrícula
- 📝 Formulário de matrícula passo a passo e intuitivo
- 📄 Upload e gerenciamento de documentos necessários
- 📱 Interface responsiva e adaptada para dispositivos móveis

### Para Administradores:
- 👨‍💼 Painel administrativo completo
- 👥 Gerenciamento de estudantes (visualizar, editar, aprovar/rejeitar)
- 📂 Sistema de gerenciamento de documentos
- 🎓 Administração de cursos e turnos
- 🛠️ Personalização de campos do formulário e requisitos de documentos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL (via Drizzle ORM)
- **Autenticação**: Express Session, Passport.js

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/sistema-matricula.git
   cd sistema-matricula
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```

5. Acesse o sistema em `http://localhost:3000`

## 📊 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilitários e configurações
│   │   ├── pages/          # Páginas da aplicação
│   │   └── App.tsx         # Componente principal
│
├── server/                 # Backend Node.js/Express
│   ├── auth.ts             # Configuração de autenticação
│   ├── routes.ts           # Rotas da API
│   ├── storage.ts          # Interface de armazenamento
│   └── index.ts            # Ponto de entrada do servidor
│
└── shared/                 # Código compartilhado (front+back)
    └── schema.ts           # Schema do banco de dados
```

## 👤 Credenciais de Acesso

### Administrador
- **Usuário**: admin
- **Senha**: 888markmoney888

## 📝 Features Planejadas

- [ ] Notificações por e-mail para estudantes
- [ ] Exportação de dados para Excel/CSV
- [ ] Integração com WhatsApp para comunicação direta
- [ ] Dashboard com estatísticas e relatórios

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome](https://github.com/seu-usuario)

---

🚀 **Quer contribuir?** Faça um fork do projeto e envie um pull request!