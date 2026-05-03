# Docker Setup Guide

## Pré-requisitos

- Docker e Docker Compose instalados
- Variáveis de ambiente configuradas no arquivo `.env`

## Configuração

### 1. Preparar o arquivo `.env`

Copie `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Configure as variáveis críticas:
```
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
SETUP_SECRET=seu_setup_secret_super_seguro_aqui
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
DATABASE_URL=postgresql://startpro:startpro@postgres:5432/startpro
```

### 2. Build e Start

```bash
# Build das imagens Docker
docker-compose build

# Iniciar os containers
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Verificar status
docker-compose ps
```

### 3. Executar Migrações (primeira vez)

```bash
# Entrar no container da app
docker-compose exec app npm run migrate

# Seedar dados de exemplo (opcional)
docker-compose exec app npm run seed:disc
docker-compose exec app npm run seed:examples
```

## Comandos Úteis

```bash
# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do PostgreSQL
docker-compose logs -f postgres

# Parar containers
docker-compose down

# Parar e remover volumes (limpar BD)
docker-compose down -v

# Reiniciar
docker-compose restart

# Acessar shell do container da app
docker-compose exec app sh

# Acessar psql do PostgreSQL
docker-compose exec postgres psql -U startpro -d startpro
```

## Acesso

- **Aplicação**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Troubleshooting

### Porta 3000 já está em uso
```bash
# Mudar porta no .env
APP_PORT=3001
docker-compose up -d
```

### Porta 5432 já está em uso
```bash
# Mudar porta no .env
DB_PORT=5433
docker-compose up -d
```

### Erro de conexão com banco
```bash
# Verifique se o PostgreSQL está saudável
docker-compose ps

# Veja os logs do postgres
docker-compose logs postgres
```

### Limpar tudo e começar do zero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Em Produção

Para ambiente de produção:

1. **Use secrets seguros** — Configure JWT_SECRET e SETUP_SECRET com valores aleatórios de 32+ caracteres
2. **Change POSTGRES_PASSWORD** — Use senha forte no banco
3. **Reverse Proxy** — Configure Nginx/Apache na frente da app
4. **SSL/TLS** — Use certificados válidos para HTTPS
5. **Environment** — Configure NODE_ENV=production
6. **Backups** — Configure rotina de backup do volume pgdata

### Exemplo com Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoramento

Verifique se os containers estão saudáveis:

```bash
# Health check contínuo
watch -n 5 'docker-compose ps'

# Ver métricas
docker stats
```
