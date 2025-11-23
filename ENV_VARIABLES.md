# Variáveis de Ambiente Necessárias

Este documento lista todas as variáveis de ambiente necessárias para o projeto funcionar corretamente em produção na Vercel.

## Variáveis Obrigatórias

### Database

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

URL de conexão com PostgreSQL. Configure uma instância PostgreSQL na Vercel ou use um serviço externo.

### Multi-tenancy

```bash
NEXT_PUBLIC_BASE_DOMAIN="evolue.com.br"
```

Domínio base da aplicação. Configure com seu domínio real de produção.

### Better Auth

```bash
BETTER_AUTH_SECRET="your-secret-key-here-change-in-production"
```

Secret usado para criptografar tokens e sessões. Gere um valor seguro aleatório para produção.

### Email (Resend)

```bash
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
```

Chave da API do Resend para envio de emails. Obtenha em https://resend.com

```bash
RESEND_FROM_EMAIL="noreply@evolue.com.br"
```

Email remetente padrão. Deve ser verificado no Resend.

## Variáveis Opcionais

### Better Auth URL

```bash
BETTER_AUTH_URL="https://app.evolue.com.br"
```

URL base do Better Auth em produção. Deixe vazio para auto-detecção.

### Email Verification

```bash
SKIP_EMAIL_VERIFICATION="false"
```

Pular verificação de email. Em produção, mantenha como `false` ou remova esta variável.

### Node Environment

```bash
NODE_ENV="production"
```

Ambiente de execução. Configure como `production` na Vercel.

## Configuração na Vercel

1. Acesse o painel do projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione todas as variáveis listadas acima
4. Certifique-se de configurar para **Production**, **Preview** e **Development** conforme necessário
5. **IMPORTANTE**: Configure o `DATABASE_URL` antes do primeiro deploy para que as migrações sejam executadas automaticamente

## Migrações do Banco de Dados

As migrações do Prisma são executadas automaticamente durante o build através do script `build` no `package.json`:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Isso garante que:

1. O Prisma Client seja gerado
2. As migrações sejam aplicadas ao banco de dados
3. O build do Next.js seja executado

**Nota**: Certifique-se de que o `DATABASE_URL` está configurado corretamente antes do primeiro deploy, caso contrário o build falhará.

## Notas Importantes

- **Nunca commite** arquivos `.env` com valores reais no repositório
- Use variáveis de ambiente da Vercel para valores sensíveis
- O `BETTER_AUTH_SECRET` deve ser único e seguro
- O `RESEND_FROM_EMAIL` deve estar verificado no Resend antes de usar em produção
- Configure domínios wildcard (`*.evolue.com.br`) na Vercel para suportar multi-tenancy
- **O `DATABASE_URL` deve estar configurado antes do primeiro deploy** para que as migrações sejam executadas
