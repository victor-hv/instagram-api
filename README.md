# 🚀 Instagram API - Vercel

API própria para buscar dados de perfis do Instagram sem depender de terceiros.

## ✨ Features

- ✅ Busca dados públicos do Instagram
- ✅ 2 métodos com fallback automático
- ✅ CORS habilitado
- ✅ 100% Serverless (Vercel)
- ✅ Deploy automático via GitHub
- ✅ Gratuito

## 📋 Endpoints

### GET /api/profile

Retorna dados de um perfil do Instagram.

**Query Parameters:**
- `username` (obrigatório) - Username do Instagram (com ou sem @)

**Exemplo:**
```
https://seu-projeto.vercel.app/api/profile?username=badgallore
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "pk": "294452354",
    "username": "badgallore",
    "full_name": "Lorena Maria",
    "biography": "badgallore@mynd8.com.br",
    "profile_pic_url": "https://...",
    "is_private": false,
    "is_verified": true,
    "is_business": false,
    "media_count": 542,
    "follower_count": 6338378,
    "following_count": 1238,
    "external_url": "https://www.fashionnova.com",
    "category": "Artist"
  }
}
```

## 🚀 Deploy no Vercel

### Método 1: Via GitHub (Recomendado)

1. **Crie um repositório no GitHub**
   - Vá em https://github.com/new
   - Nome: `instagram-api`
   - Público ou Privado
   - Clique em **Create repository**

2. **Upload dos arquivos**
   - Faça upload de todos os arquivos deste projeto
   - Estrutura deve ficar:
     ```
     instagram-api/
     ├── api/
     │   └── profile.js
     ├── package.json
     ├── vercel.json
     └── README.md
     ```

3. **Conecte no Vercel**
   - Vá em https://vercel.com
   - Clique em **"Add New..."** → **"Project"**
   - Clique em **"Import Git Repository"**
   - Selecione seu repositório `instagram-api`
   - Clique em **"Import"**
   - Deixe as configurações padrão
   - Clique em **"Deploy"**

4. **Aguarde ~1 minuto**
   - Vercel vai fazer o build e deploy
   - Você receberá uma URL tipo: `https://instagram-api-xxx.vercel.app`

5. **Teste!**
   ```
   https://seu-projeto.vercel.app/api/profile?username=badgallore
   ```

### Método 2: Via Vercel CLI

1. **Instale o Vercel CLI** (precisa Node.js)
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Desenvolvimento Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/instagram-api.git
   cd instagram-api
   ```

2. **Instale dependências**
   ```bash
   npm install
   ```

3. **Rode localmente**
   ```bash
   vercel dev
   ```

4. **Acesse**
   ```
   http://localhost:3000/api/profile?username=badgallore
   ```

## 📊 Limites (Free Tier)

- ✅ 100GB bandwidth/mês
- ✅ ~1 milhão de requests/mês
- ✅ Deploy ilimitado
- ✅ HTTPS automático
- ✅ Global CDN

## ⚠️ Notas Importantes

1. **Instagram pode bloquear** muitas requisições do mesmo IP
2. **Use cache** no frontend quando possível
3. **Não abuse** - respeite os limites do Instagram
4. **Perfis privados** retornam dados limitados

## 🛠️ Troubleshooting

### Erro 404 - "Deployment not found"

Isso significa que a estrutura de pastas está errada. Verifique:
- ✅ Arquivo `api/profile.js` está dentro da pasta `api/`
- ✅ Arquivo `package.json` está na raiz
- ✅ Arquivo `vercel.json` está na raiz

### Erro "User not found"

- Verifique se o username está correto
- Perfil pode estar privado ou bloqueado
- Instagram pode estar bloqueando temporariamente

### API lenta

- Instagram pode estar com rate limit
- Tente novamente em alguns minutos
- Considere adicionar cache

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do Vercel (aba **Deployments** → clique no deploy → **Logs**)
2. Estrutura de pastas está correta
3. URL da API está correta

## 📄 Licença

MIT - Use como quiser!

---

**Feito com ❤️ por você!**
