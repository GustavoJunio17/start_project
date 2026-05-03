# Docker Quick Start

## 🚀 Início Rápido (5 minutos)

### 1. Preparar variáveis de ambiente
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

### 2. Iniciar com o script deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

Escolha opção 1 para desenvolvimento ou 2 para produção.

### 3. Acessar a aplicação
```
http://localhost:3000
```

---

## 📋 Arquivos Docker Criados

| Arquivo | Propósito |
|---------|-----------|
| `Dockerfile` | Build da aplicação Next.js (multi-stage) |
| `docker-compose.yml` | Orquestração em desenvolvimento (app + postgres) |
| `docker-compose.prod.yml` | Orquestração em produção (app + postgres + nginx) |
| `.dockerignore` | Arquivos ignorados no build |
| `deploy.sh` | Script interativo para deployment |
| `DOCKER.md` | Documentação completa |
| `nginx.conf.example` | Configuração Nginx reverse proxy |

---

## 🎯 Casos de Uso

### Desenvolvimento Local
```bash
docker-compose up -d
```
Inicia app (3000) + postgres (5432)

### Produção com SSL
```bash
# Configure certificados SSL primeiro
sudo certbot certonly -d seu-dominio.com

# Edit nginx.conf.example com seu domínio

docker-compose -f docker-compose.prod.yml up -d
```
Inicia app (3000 interno) + postgres + nginx (80, 443)

---

## 🔧 Comandos Úteis

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f app

# Entrar no container
docker-compose exec app sh

# Executar migrations
docker-compose exec app npm run migrate

# Parar
docker-compose down

# Limpar tudo
docker-compose down -v
```

---

## ⚙️ Variáveis de Ambiente Importantes

```
JWT_SECRET=valor-secreto-32-caracteres
SETUP_SECRET=outro-secreto-32-caracteres
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://startpro:startpro@postgres:5432/startpro
```

---

## 🐛 Troubleshooting

**Porta 3000 em uso?**
```bash
# Mudar em .env
APP_PORT=3001
```

**Banco não conecta?**
```bash
docker-compose logs postgres
```

**Limpar e recomeçar?**
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 📚 Leitura Adicional

Ver `DOCKER.md` para documentação completa.
