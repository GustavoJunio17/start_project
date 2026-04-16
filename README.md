# Start - Sistema de Gestão de RH e Recrutamento

Uma plataforma moderna e integrada para gestão de talentos, recrutamento e administração de recursos humanos, construída com foco em eficiência e experiência do usuário.

## 🚀 Módulos do Sistema

O sistema é dividido em áreas específicas para cada tipo de usuário:

- **Admin/Plataforma**: Gestão global de empresas, configurações do sistema e auditoria.
- **Empresa**: Dashboard para publicação de vagas, triagem de candidatos e gestão de colaboradores.
- **Candidato**: Portal para busca de vagas, inscrição e acompanhamento de processos seletivos.
- **Gestor**: Ferramentas para acompanhamento de equipes e aprovações internas.
- **Vagas (Público)**: Quadro de vagas público otimizado para conversão de candidatos.

## 🛠️ Stack Tecnológica

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Banco**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticação**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)

## ⚙️ Configuração Inicial

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:

```env
DATABASE_URL=sua_url_do_banco
JWT_SECRET=seu_segredo_jwt
SETUP_SECRET=seu_segredo_de_setup
```

### Comandos

```bash
# Instalar dependências
npm install # ou pnpm install

# Rodar servidor de desenvolvimento
npm run dev
# ou
pnpm dev

# Build para produção
npm run build
```

## 🧹 Limpeza de Projeto

Recentemente o projeto passou por uma limpeza para remover documentações de migração legadas e centralizar as informações essenciais neste README. Arquivos temporários e scripts de teste manuais também foram movidos para o `.gitignore`.

---

Desenvolvido para transformar a gestão de pessoas com agilidade e tecnologia.
