# 📚 Documentação de Rotas - StartPro

Plataforma SaaS de RH multi-tenant. Documentação completa de todos os endpoints da API.

**Atualizado:** 23 de Abril, 2026  
**Stack:** Next.js 13+ (App Router) + PostgreSQL + JWT

---

## 🔐 Autenticação

Todos os endpoints (exceto os marcados como públicos) requerem:
- **JWT Token** no cookie `auth_token` ou header `Authorization: Bearer <token>`
- **Role-based access control (RBAC)** para operações específicas

### Roles Disponíveis
- `super_admin` - Acesso total ao sistema
- `super_gestor` - Gestor de múltiplas empresas
- `admin` - Administrador de uma empresa
- `gestor_rh` - Gestor de RH da empresa
- `colaborador` - Funcionário da empresa
- `candidato` - Candidato externo

---

## 📋 Índice de Endpoints

### Autenticação
- [POST /api/auth/login](#post-apiauthlogin)
- [POST /api/auth/register](#post-apiauthregister)
- [POST /api/auth/logout](#post-apiauthlogout)
- [GET /api/auth/me](#get-apiauthme)
- [POST /api/auth/change-password](#post-apiauthchange-password)
- [POST /api/auth/forgot-password](#post-apiauthforgot-password)
- [POST /api/auth/reset-password](#post-apiauthrest-password)
- [POST /api/auth/setup-admin](#post-apiauthsetup-admin)

### Admin - Empresas
- [POST /api/admin/empresas](#post-apiadminempresas)
- [GET /api/admin/empresas](#get-apiadminempresas)
- [GET /api/admin/empresas-list](#get-apiadminempresaslist)
- [GET /api/admin/empresas/:id](#get-apiadminempresasid)
- [PUT /api/admin/empresas/:id](#put-apiadminempresasid)
- [DELETE /api/admin/empresas/:id](#delete-apiadminempresasid)

### Admin - Usuários
- [POST /api/admin/usuarios](#post-apiadminusuarios)
- [GET /api/admin/usuarios](#get-apiadminusuarios)
- [GET /api/admin/usuarios/:id](#get-apiadminusuariosid)
- [PUT /api/admin/usuarios/:id](#put-apiadminusuariosid)
- [DELETE /api/admin/usuarios/:id](#delete-apiadminusuariosid)

### Admin - KPIs
- [GET /api/admin/kpis](#get-apiadminkpis)

### Vagas
- [GET /api/vagas](#get-apvagas)
- [POST /api/vagas](#post-apivagas)
- [GET /api/vagas/:id](#get-apivagasid)
- [PUT /api/vagas/:id](#put-apivagasid)
- [DELETE /api/vagas/:id](#delete-apivagasid)
- [GET /api/vagas/:id/candidatos](#get-apivagasidcandidatos)
- [GET /api/empresas/:id/vagas](#get-apiempresasidvagas)

### Candidaturas
- [GET /api/candidaturas](#get-apicandidaturas)
- [POST /api/candidaturas](#post-apicandidaturas)
- [GET /api/candidaturas/:id](#get-apicandidaturasid)
- [PUT /api/candidaturas/:id](#put-apicandidaturasid)
- [DELETE /api/candidaturas/:id](#delete-apicandidaturasid)

### Candidatos
- [GET /api/candidatos/search](#get-apicandidatossearch)

### Colaboradores
- [POST /api/colaboradores/register](#post-apicaboradoresregister)

### Convites
- [POST /api/convites](#post-apiconvites)
- [GET /api/convites/aceitar](#get-apiconvitesaceitar)

### Testes (DISC)
- [POST /api/testes/disc/responder](#post-apitestesdiscresponder)

### Utilidade
- [GET /api/db](#get-apidb)

---

## 🔑 Endpoints Detalhados

### Autenticação

#### **POST** `/api/auth/login`
Realizar login no sistema.

**Público:** Não  
**Rate Limit:** 5 tentativas em 15 minutos por IP

**Request Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "SenhaForte123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "nome_completo": "João Silva",
    "role": "admin",
    "empresa_id": "uuid"
  }
}
```

**Erros:**
- `400` - Email ou senha não fornecidos
- `401` - Credenciais inválidas
- `403` - Conta desativada
- `429` - Muitas tentativas (rate limit)

---

#### **POST** `/api/auth/register`
Registrar novo usuário (candidato ou com convite).

**Público:** Sim  
**Rate Limit:** 10 tentativas em 1 hora por IP

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "password": "SenhaForte123!",
  "telefone": "11999999999",
  "conviteToken": "token-opcional"
}
```

**Validações de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "nome_completo": "João Silva",
    "role": "candidato",
    "empresa_id": null
  }
}
```

**Erros:**
- `400` - Validação falhou
- `409` - Email já cadastrado
- `429` - Rate limit excedido

---

#### **POST** `/api/auth/logout`
Fazer logout e invalidar token.

**Autenticado:** Sim

**Response (200):**
```json
{ "success": true }
```

---

#### **GET** `/api/auth/me`
Obter dados do usuário autenticado.

**Autenticado:** Sim

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@empresa.com",
  "nome_completo": "João Silva",
  "role": "admin",
  "empresa_id": "uuid"
}
```

---

#### **POST** `/api/auth/change-password`
Alterar senha do usuário autenticado.

**Autenticado:** Sim

**Request Body:**
```json
{
  "senhaAtual": "SenhaAntiga123!",
  "senhaNova": "SenhaNovaForte456!"
}
```

**Response (200):**
```json
{ "success": true, "message": "Senha alterada com sucesso" }
```

**Erros:**
- `400` - Senha atual incorreta
- `401` - Não autenticado

---

#### **POST** `/api/auth/forgot-password`
Solicitar reset de senha por email.

**Público:** Sim  
**Rate Limit:** Aplicado

**Request Body:**
```json
{
  "email": "usuario@empresa.com"
}
```

**Response (200):**
```json
{ "success": true, "message": "Email de reset enviado se o email existir" }
```

---

#### **POST** `/api/auth/reset-password`
Resetar senha usando token do email.

**Público:** Sim

**Request Body:**
```json
{
  "token": "token-do-email",
  "novaSenha": "SenhaNovaForte456!"
}
```

**Response (200):**
```json
{ "success": true, "message": "Senha resetada com sucesso" }
```

**Erros:**
- `400` - Token inválido ou expirado
- `400` - Senha não válida

---

#### **POST** `/api/auth/setup-admin`
Criar super admin inicial (apenas se não existir nenhum).

**Público:** Sim (proteção por SETUP_SECRET)

**Request Body:**
```json
{
  "email": "admin@empresa.com",
  "senha": "SenhaForte123!",
  "setupSecret": "valor-do-.env.SETUP_SECRET"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@empresa.com",
    "role": "super_admin"
  }
}
```

**Erros:**
- `400` - Super admin já existe
- `401` - SETUP_SECRET inválido

---

### Admin - Empresas

#### **POST** `/api/admin/empresas`
Criar nova empresa com usuário admin.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`

**Request Body:**
```json
{
  "nome": "Tech Solutions",
  "cnpj": "12.345.678/0001-90",
  "area_atuacao": "Digital",
  "plano": "profissional",
  "email_admin": "admin@techsolutions.com",
  "senha_admin": "SenhaForte123!",
  "email_contato": "contato@techsolutions.com",
  "telefone": "1133334444"
}
```

**Validações:**
- CNPJ: formato válido e único
- Email: formato válido
- Plano: `starter`, `profissional` ou `enterprise`
- Senha: 8+ chars, maiúscula, minúscula, número

**Response (201):**
```json
{
  "empresa": {
    "id": "uuid",
    "nome": "Tech Solutions",
    "cnpj": "12345678000190",
    "segmento": "Digital",
    "plano": "profissional",
    "status": "ativa",
    "data_cadastro": "2026-04-23T10:30:00Z"
  },
  "admin": {
    "id": "uuid",
    "email": "admin@techsolutions.com",
    "role": "admin"
  },
  "mensagem": "Empresa criada com sucesso!..."
}
```

**Erros:**
- `400` - Validação falhou
- `409` - CNPJ ou email já existem
- `403` - Sem permissão

---

#### **GET** `/api/admin/empresas`
Listar empresas (conforme role).

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`, `admin`

**Query Params:**
- `pageNumber` (opcional) - Padrão: 1
- `pageSize` (opcional) - Padrão: 10

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Tech Solutions",
    "cnpj": "12345678000190",
    "segmento": "Digital",
    "plano": "profissional",
    "status": "ativa",
    "data_cadastro": "2026-04-23T10:30:00Z"
  }
]
```

---

#### **GET** `/api/admin/empresas-list`
Listar empresas simplificado (apenas id e nome).

**Autenticado:** Sim

**Response (200):**
```json
[
  { "id": "uuid", "nome": "Tech Solutions" },
  { "id": "uuid", "nome": "Startup XYZ" }
]
```

---

#### **GET** `/api/admin/empresas/:id`
Obter detalhes de uma empresa.

**Autenticado:** Sim

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Tech Solutions",
  "cnpj": "12345678000190",
  "segmento": "Digital",
  "plano": "profissional",
  "status": "ativa",
  "data_cadastro": "2026-04-23T10:30:00Z"
}
```

**Erros:**
- `404` - Empresa não encontrada

---

#### **PUT** `/api/admin/empresas/:id`
Atualizar informações da empresa.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`, `admin` (só da sua empresa)

**Request Body (todos opcionais):**
```json
{
  "nome": "Tech Solutions v2",
  "area_atuacao": "Software",
  "plano": "enterprise",
  "email_contato": "novo@techsolutions.com",
  "telefone": "1144444444",
  "status": "ativa"
}
```

**Response (200):** Empresa atualizada

---

#### **DELETE** `/api/admin/empresas/:id`
Deletar empresa (soft delete).

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`

**Response (204):** No content

---

### Admin - Usuários

#### **POST** `/api/admin/usuarios`
Criar novo usuário.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`

**Request Body:**
```json
{
  "email": "novo@empresa.com",
  "nome_completo": "João Silva",
  "telefone": "11999999999",
  "role": "admin",
  "empresa_id": "uuid"
}
```

**Roles Aceitos:** `admin`, `gestor_rh`, `colaborador`

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "novo@empresa.com",
    "nome_completo": "João Silva",
    "role": "admin",
    "empresa_id": "uuid",
    "created_at": "2026-04-23T10:30:00Z"
  },
  "message": "Usuário criado. Senha padrão: Senha123!"
}
```

**Erros:**
- `400` - Campos obrigatórios faltando
- `409` - Email já cadastrado
- `404` - Empresa não encontrada

---

#### **GET** `/api/admin/usuarios`
Listar usuários.

**Autenticado:** Sim

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "nome_completo": "João Silva",
    "role": "admin",
    "empresa_id": "uuid",
    "ativo": true,
    "created_at": "2026-04-23T10:30:00Z"
  }
]
```

---

#### **GET** `/api/admin/usuarios/:id`
Obter detalhes de um usuário.

**Autenticado:** Sim

**Response (200):** Usuário com todos os dados

**Erros:**
- `404` - Usuário não encontrado

---

#### **PUT** `/api/admin/usuarios/:id`
Atualizar usuário.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`, `admin`

**Request Body (todos opcionais):**
```json
{
  "nome_completo": "João Silva Novo",
  "telefone": "11988888888",
  "role": "gestor_rh",
  "ativo": true
}
```

**Response (200):** Usuário atualizado

---

#### **DELETE** `/api/admin/usuarios/:id`
Deletar usuário (soft delete).

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`

**Response (204):** No content

---

### Admin - KPIs

#### **GET** `/api/admin/kpis`
Obter KPIs do dashboard admin.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`, `admin`

**Response (200):**
```json
{
  "totalEmpresas": 15,
  "totalUsuarios": 245,
  "totalVagas": 87,
  "totalCandidatos": 1203,
  "vagasAbertas": 32,
  "candidaturasRecentes": 45
}
```

---

### Vagas

#### **GET** `/api/vagas`
Listar vagas.

**Autenticado:** Sim

**Comportamento por Role:**
- `super_admin`/`super_gestor`: Todas as vagas
- `admin`/`gestor_rh`: Vagas da sua empresa
- `candidato`/`colaborador`: Apenas vagas públicas

**Query Params:**
- `pageNumber` (opcional)
- `pageSize` (opcional)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "empresa_id": "uuid",
    "titulo": "Desenvolvedor Full Stack",
    "descricao": "Procuramos um dev experiente...",
    "requisitos": ["Node.js", "React", "PostgreSQL"],
    "categoria": "Desenvolvimento",
    "perfil_disc_ideal": { "D": 7, "I": 6, "S": 4, "C": 8 },
    "publica": true,
    "created_at": "2026-04-23T10:30:00Z"
  }
]
```

---

#### **POST** `/api/vagas`
Criar nova vaga.

**Autenticado:** Sim  
**Roles:** `admin`, `gestor_rh`, `super_admin`, `super_gestor`

**Request Body:**
```json
{
  "titulo": "Desenvolvedor Full Stack",
  "descricao": "Procuramos um dev experiente...",
  "requisitos": ["Node.js", "React", "PostgreSQL"],
  "categoria": "Desenvolvimento",
  "perfil_disc_ideal": {
    "D": 7,
    "I": 6,
    "S": 4,
    "C": 8
  },
  "publica": true,
  "empresa_id": "uuid (apenas super roles)"
}
```

**Response (201):** Vaga criada com id

**Erros:**
- `400` - Título obrigatório
- `403` - Sem permissão

---

#### **GET** `/api/vagas/:id`
Obter detalhes de uma vaga.

**Autenticado:** Sim

**Response (200):** Vaga com todos os dados

---

#### **PUT** `/api/vagas/:id`
Atualizar vaga.

**Autenticado:** Sim  
**Roles:** Quem criou ou admin da empresa

**Request Body:** Campos opcionais (mesmo do POST)

**Response (200):** Vaga atualizada

---

#### **DELETE** `/api/vagas/:id`
Deletar vaga.

**Autenticado:** Sim

**Response (204):** No content

---

#### **GET** `/api/vagas/:id/candidatos`
Listar candidatos para uma vaga.

**Autenticado:** Sim  
**Roles:** `admin`, `gestor_rh` da empresa

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "status": "em_analise",
    "score_disc": 85,
    "data_candidatura": "2026-04-20T15:00:00Z"
  }
]
```

---

#### **GET** `/api/empresas/:id/vagas`
Listar vagas de uma empresa específica.

**Autenticado:** Sim

**Response (200):** Array de vagas

---

### Candidaturas

#### **GET** `/api/candidaturas`
Listar candidaturas.

**Autenticado:** Sim

**Comportamento por Role:**
- `super_admin`: Todas as candidaturas
- `admin`/`gestor_rh`: Candidaturas das vagas da empresa
- `candidato`: Suas próprias candidaturas

**Query Params:**
- `pageNumber`, `pageSize` (opcionais)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "vaga_id": "uuid",
    "candidato_id": "uuid",
    "status": "em_analise",
    "score": 85,
    "data_candidatura": "2026-04-20T15:00:00Z"
  }
]
```

---

#### **POST** `/api/candidaturas`
Criar nova candidatura.

**Autenticado:** Sim

**Request Body:**
```json
{
  "vaga_id": "uuid"
}
```

**Response (201):** Candidatura criada

**Erros:**
- `400` - Vaga não encontrada
- `409` - Já se candidatou para esta vaga

---

#### **GET** `/api/candidaturas/:id`
Obter detalhes de uma candidatura.

**Autenticado:** Sim

**Response (200):** Candidatura com dados completos

---

#### **PUT** `/api/candidaturas/:id`
Atualizar status de candidatura.

**Autenticado:** Sim  
**Roles:** `admin`, `gestor_rh`

**Request Body:**
```json
{
  "status": "aprovado|rejeitado|em_analise|entrevista",
  "observacoes": "Texto opcional"
}
```

**Response (200):** Candidatura atualizada

---

#### **DELETE** `/api/candidaturas/:id`
Cancelar candidatura.

**Autenticado:** Sim

**Response (204):** No content

---

### Candidatos

#### **GET** `/api/candidatos/search`
Buscar candidatos.

**Autenticado:** Sim

**Query Params:**
- `q` - Termo de busca (nome, email)
- `status` (opcional) - Filtrar por status

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "profile_disc": "D",
    "score": 75
  }
]
```

---

### Colaboradores

#### **POST** `/api/colaboradores/register`
Registrar novo colaborador (por convite).

**Público:** Sim (com `conviteToken`)

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "SenhaForte123!",
  "cpf": "123.456.789-00",
  "data_nascimento": "1990-05-15",
  "setor": "Desenvolvimento",
  "cargo": "Desenvolvedor",
  "telefone": "11999999999",
  "conviteToken": "token-do-convite"
}
```

**Response (201):** Colaborador registrado

**Erros:**
- `400` - Convite inválido/expirado
- `409` - Email já cadastrado

---

### Convites

#### **POST** `/api/convites`
Criar convite para novo usuário.

**Autenticado:** Sim  
**Roles:** `super_admin`, `super_gestor`, `admin`  
**Rate Limit:** 20 convites por hora por IP

**Request Body:**
```json
{
  "email": "novo@empresa.com",
  "role": "admin|gestor_rh|colaborador|candidato",
  "empresa_id": "uuid (opcional para super roles)"
}
```

**Response (201):**
```json
{
  "success": true,
  "convite": {
    "email": "novo@empresa.com",
    "token": "hash-token",
    "expira_em": "2026-05-04T10:30:00Z",
    "link": "https://app.com/auth/register?convite=hash-token"
  }
}
```

**Erros:**
- `400` - Email ou role inválidos
- `429` - Rate limit

---

#### **GET** `/api/convites/aceitar`
Aceitar convite (redireciona para registro).

**Público:** Sim

**Query Params:**
- `token` - Token do convite

**Response (302):** Redireciona para página de registro

---

### Testes (DISC)

#### **POST** `/api/testes/disc/responder`
Submeter respostas do teste DISC.

**Autenticado:** Sim

**Request Body:**
```json
{
  "respostas": [
    { "pergunta_id": 1, "resposta": "D" },
    { "pergunta_id": 2, "resposta": "I" }
  ]
}
```

**Response (201):**
```json
{
  "score": {
    "D": 85,
    "I": 72,
    "S": 60,
    "C": 78
  },
  "perfil_dominante": "D",
  "data_conclusao": "2026-04-23T10:30:00Z"
}
```

---

### Utilidade

#### **GET** `/api/db`
Health check do banco de dados.

**Público:** Sim

**Response (200):**
```json
{
  "status": "connected",
  "message": "Database is healthy"
}
```

**Response (500):**
```json
{
  "status": "error",
  "message": "Connection failed"
}
```

---

## 🛡️ Convenções de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { /* dados */ }
}
```

### Erro
```json
{
  "error": "Mensagem de erro",
  "details": { /* info adicional */ }
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔐 Permissões por Role

| Ação | super_admin | super_gestor | admin | gestor_rh | colaborador | candidato |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| Criar empresa | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar empresas | ✅ | ✅ | Própria | ❌ | ❌ | ❌ |
| Criar usuários | ✅ | ✅ | Própria | Própria | ❌ | ❌ |
| Gerenciar vagas | ✅ | ✅ | Própria | Própria | ❌ | ❌ |
| Ver todas vagas | ✅ | ✅ | Própria | Própria | Públicas | Públicas |
| Candidatar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver candidaturas | ✅ | ✅ | Própria | Própria | Próprias | Próprias |
| Criar convites | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost:5432/startpro

# Autenticação
JWT_SECRET=dev-secret-change-in-production
AUTH_COOKIE=auth_token
SETUP_SECRET=startup-admin-setup-secret

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password
SMTP_FROM=noreply@app.com
```

---

## 🚀 Próximas Integrações

- [ ] Integração com Sênior ERP
- [ ] Webhooks para eventos
- [ ] Relatórios em PDF
- [ ] Chat em tempo real
- [ ] Notificações por push
- [ ] Análise de perfil comportamental DISC

---

*Documentação completa e atualizada. Para dúvidas, consulte o código nos controllers de `/src/app/api/`*
