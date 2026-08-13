# Deploy da API no Render

Guia para publicar a API no [Render](https://render.com) usando um MySQL hospedado na nuvem.

> Por que MySQL externo? O Render **não** oferece MySQL gerenciado (só PostgreSQL),
> e o seu MySQL local não é acessível pela internet. Então o banco de produção
> fica num serviço externo gratuito e o Render acessa por lá.

---

## 1. Criar o MySQL grátis (Aiven)

Recomendado: [Aiven](https://aiven.io) — plano free de MySQL, sem cartão.

1. Crie conta em https://console.aiven.io/signup.
2. **Create service** > **MySQL**.
3. Escolha o plano **Free**, um provedor/região (qualquer um) e crie.
4. Aguarde o status virar **Running** (alguns minutos).
5. Na aba **Overview** > **Connection information**, anote:
   - **Host** (ex: `mysql-xxxx.aivencloud.com`)
   - **Port** (ex: `12345`)
   - **User** (ex: `avnadmin`)
   - **Password**
   - **Database name** (ex: `defaultdb`)

> Alternativas free: [Clever Cloud](https://www.clever-cloud.com) (MySQL DEV) ou
> [Railway](https://railway.app) (MySQL, com crédito de trial).

### Monte a DATABASE_URL

Com os dados acima, a URL fica assim (necessária para as migrations):

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=accept_invalid_certs
```

Exemplo:
```
mysql://avnadmin:senha123@mysql-xxxx.aivencloud.com:12345/defaultdb?sslaccept=accept_invalid_certs
```

> **Atenção ao SSL:** o Aiven mostra a URI com `?ssl-mode=REQUIRED`, mas isso é
> parâmetro do cliente MySQL — o **Prisma migrate** não entende. Troque por
> `?sslaccept=accept_invalid_certs` para as migrations conectarem via SSL.
>
> Se a senha tiver caracteres especiais (`@ : / ? #`), faça URL-encode deles.

---

## 2. Subir a API no Render (Blueprint)

O arquivo [`render.yaml`](./render.yaml) já configura o serviço.

1. Dê push da branch **feat/infra-global** no GitHub (é a branch que o Blueprint
   deploya; depois você pode mergear pra MAIN e trocar a branch no Render).
2. No Render: **New** > **Blueprint** > conecte o repositório `API-GER-EXTENSAO`.
3. O Render lê o `render.yaml` e mostra o serviço `api-ger-extensao`.
4. Ele vai pedir as variáveis marcadas como `sync: false`. Preencha:

   | Variável            | Valor                                             |
   |---------------------|---------------------------------------------------|
   | `DATABASE_URL`      | a URL montada no passo 1                           |
   | `DATABASE_HOST`     | Host do Aiven                                      |
   | `DATABASE_PORT`     | Port do Aiven                                      |
   | `DATABASE_USER`     | User do Aiven                                      |
   | `DATABASE_PASSWORD` | Password do Aiven                                  |
   | `DATABASE_NAME`     | Database do Aiven                                  |
   | `CORS_ORIGINS`      | origens do front (ou vazio p/ liberar todas)       |

   > `JWT_SECRET` é gerado automaticamente. `PORT` é injetado pelo Render.
   > `DATABASE_SSL=true` já vem definido no `render.yaml` (SSL obrigatório no Aiven).

5. **Apply / Create**. O build roda `prisma generate` + `prisma migrate deploy`
   (cria as tabelas no banco novo) e sobe a API.
6. Ao terminar, a API fica em `https://api-ger-extensao.onrender.com`.
   Teste: `GET https://api-ger-extensao.onrender.com/health` deve retornar `{ "status": "ok" }`.

---

## 3. (Opcional) Popular com dados de teste

O banco de produção sobe vazio. Para criar os usuários de teste, rode o seed
apontando para o banco da nuvem — a partir da sua máquina:

```bash
# Use a mesma DATABASE_URL e demais variáveis do banco de produção
DATABASE_URL="mysql://..." DATABASE_HOST="..." DATABASE_PORT="..." \
DATABASE_USER="..." DATABASE_PASSWORD="..." DATABASE_NAME="..." \
npx tsx prisma/seed.ts
```

No PowerShell (Windows):

```powershell
$env:DATABASE_URL="mysql://..."; $env:DATABASE_HOST="..."; $env:DATABASE_PORT="..."
$env:DATABASE_USER="..."; $env:DATABASE_PASSWORD="..."; $env:DATABASE_NAME="..."
npx tsx prisma/seed.ts
```

---

## Observações

- **Plano free do Render** hiberna após ~15 min sem tráfego; a primeira
  requisição depois disso demora alguns segundos para "acordar".
- **Uploads (`/uploads`)**: o disco do plano free é efêmero e é apagado a cada
  deploy/restart. Para arquivos persistentes, use um disco pago do Render ou um
  storage externo (ex: S3/Supabase Storage) — fica como melhoria futura.
- **Migrations**: rodam automaticamente no build a cada deploy.
