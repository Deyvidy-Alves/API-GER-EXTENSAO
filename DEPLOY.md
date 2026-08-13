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
6. Ao terminar, a API fica no ar. **Atenção:** o Render acrescenta um sufixo
   aleatório ao domínio, então a URL final **não** é exatamente o nome do serviço.
   A URL real deste deploy é:

   ```
   https://api-ger-extensao-zcrp.onrender.com
   ```

   A URL exata aparece no log do deploy (`Available at your primary URL ...`) e no
   topo do serviço no painel do Render. Teste:
   `GET https://api-ger-extensao-zcrp.onrender.com/health` deve retornar `{ "status": "ok" }`.

   > Abrir a **raiz** (`/`) no navegador retorna `{"error":"Rota nao encontrada."}` —
   > isso é **normal**: a API não tem página inicial, só endpoints. Essa resposta em
   > JSON, aliás, confirma que a API está no ar. Use `/health` para o "sinal de vida".

---

## 3. (Opcional) Popular o banco com dados de teste

O banco de produção sobe **vazio** (só com as tabelas). Para criar os usuários de
teste, rode o seed a partir da sua máquina apontando para o banco da **nuvem**.

### 3.1. Aponte as variáveis para o banco da nuvem

O seu `.env` local aponta para o MySQL de `localhost`. Para os comandos abaixo
usarem o banco da nuvem, defina as variáveis do Aiven na **mesma janela** do
PowerShell antes de rodar (o `dotenv` **não** sobrescreve o que você já definiu,
então os valores abaixo têm prioridade):

```powershell
$env:DATABASE_HOST="mysql-xxxx.aivencloud.com"
$env:DATABASE_PORT="18805"
$env:DATABASE_USER="avnadmin"
$env:DATABASE_PASSWORD="sua-senha"
$env:DATABASE_NAME="defaultdb"
$env:DATABASE_SSL="true"
$env:DATABASE_URL="mysql://avnadmin:sua-senha@mysql-xxxx.aivencloud.com:18805/defaultdb?sslaccept=accept_invalid_certs"
```

> ⚠️ Essas variáveis valem **só naquela janela**. Abriu outro terminal? Defina de
> novo — senão os comandos do Prisma vão mexer no banco `localhost` por engano.
> **Sempre confira** a linha `Datasource "db": MySQL database "..." at "..."` que o
> Prisma imprime: precisa mostrar `defaultdb ... aivencloud.com`, e não `localhost`.

### 3.2. Se o DNS da sua rede não resolver o host do Aiven

Alguns roteadores têm o DNS quebrado e o Node não acha o endereço, dando o erro
`getaddrinfo ENOTFOUND mysql-xxxx.aivencloud.com`. Para contornar, descubra o IP
usando o DNS do Google:

```powershell
nslookup mysql-xxxx.aivencloud.com 8.8.8.8
```

Copie o `Address` retornado e, num PowerShell **como Administrador**, aponte esse IP
para o host no arquivo `hosts` do Windows:

```powershell
Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "IP_DO_AIVEN mysql-xxxx.aivencloud.com"
ipconfig /flushdns
```

> O IP do Aiven pode mudar com o tempo. Se voltar a dar `ENOTFOUND`, refaça o
> `nslookup` e atualize a linha do `hosts`. Correção definitiva: trocar o DNS do
> Windows/roteador para `8.8.8.8`. **Isso vale só para a sua máquina** — o Render
> resolve o host normalmente e não precisa de nada disso.

### 3.3. Rode o seed

Com as variáveis apontando para a nuvem:

```powershell
npx tsx prisma/seed.ts
```

Sucesso: `✅ Seed concluída — todas as tabelas populadas.`

> **Erro de coluna inexistente?** Se o seed reclamar algo como
> `The column users.fotoPerfil does not exist`, o banco da nuvem está
> dessincronizado das migrations (marcadas como aplicadas sem terem criado as
> colunas). Como o banco de produção está vazio, resete-o — isso apaga tudo e
> reaplica as 11 migrations do zero. **Confira o `Datasource` antes** para não
> resetar o `localhost` por engano:
>
> ```powershell
> npx prisma migrate reset --force
> ```

---

## Observações

- **Plano free do Render** hiberna após ~15 min sem tráfego; a primeira
  requisição depois disso demora alguns segundos para "acordar".
- **Uploads (`/uploads`)**: o disco do plano free é efêmero e é apagado a cada
  deploy/restart. Para arquivos persistentes, use um disco pago do Render ou um
  storage externo (ex: S3/Supabase Storage) — fica como melhoria futura.
- **Migrations**: rodam automaticamente no build a cada deploy.
