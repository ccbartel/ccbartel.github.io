# Site de jogos (GitHub Pages)

Portal de jogos web. Primeiro jogo: **Guess the Flag**.

## Arquivos
| Arquivo | O que e |
|---|---|
| `site-config.js` | **Unico lugar para editar**: nome do site, dominio, usuario GitHub, e-mail, hosts extras, IDs do AdSense |
| `servir.py` | Servidor local para testar (`--help`) |
| `build.py` | Regenera o jogo ofuscado, `CNAME`, `ads.txt` e os textos das paginas a partir da config |
| `index.html`, `style.css` | Vitrine (grade de cartoes, 1 por jogo) |
| `privacy.html`, `contact.html` | Politica de privacidade (cookies do AdSense) e contato |
| `site.js` | Codigo comum: preenche nome/e-mail e monta os banners AdSense (ou "Ad space" se vazio) |
| `guess-the-flag/` | O jogo publicado: `index.html`, `game.js` (OFUSCADO, gerado), `assets/` |
| `src/guess-the-flag/game.src.js` | Codigo-fonte legivel do jogo. **Fica fora do git** (`.gitignore`), porque no GitHub Pages gratis o repositorio e publico. Faca backup dele (ex.: OneDrive) |
| `CNAME` | Dominio proprio (gerado pelo build; sem dominio, nao existe) |
| `ads.txt` | Autorizacao do AdSense (gerado pelo build com o seu pub-ID) |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos como estao |

## Trocar dominio, usuario ou AdSense
1. Abra `site-config.js` e mude os valores (aspas duplas, formato JSON).
   - `DOMAIN`: ex. `"bartelgames.com.br"` (vazio = sem dominio proprio)
   - `GITHUB_USER`: seu usuario do GitHub
   - `ADSENSE_CLIENT`: `"ca-pub-..."`; `ADSENSE_SLOT_GAME` / `ADSENSE_SLOT_HOME`: IDs dos blocos de anuncio
2. Rode o build (1 comando, na pasta do site):
   ```
   C:\Users\crisb\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\python_embeded\python.exe build.py
   ```
   (`--help` mostra a ajuda). Precisa do Node.js instalado (usa `npx javascript-obfuscator`).

O build ja soma aos hosts permitidos: `DOMAIN`, `www.DOMAIN` e `USUARIO.github.io`.

## Testar no PC
```
C:\Users\crisb\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\python_embeded\python.exe servir.py
```
e abra http://localhost:8000/ . (Abrir o arquivo direto, `file://`, e bloqueado pela trava.)
Use o `servir.py` (HTTP/1.1) e nao o `python -m http.server`: no teste, o http.server cortou a conexao
(ERR_CONNECTION_RESET) em arquivos grandes como o `game.js` no navegador.

## Trava de dominio
O jogo so roda se o endereco da pagina estiver na lista embutida no `game.js` (ofuscada). Fora dela mostra
"This game is not available here" com link para o site oficial. A checagem se repete durante o jogo.
Limite: ofuscacao atrapalha, mas nao impede quem souber depurar JavaScript; tambem nao impede alguem de
colocar o seu site inteiro num `<iframe>` (o host continua sendo o seu).

## Publicar (GitHub Pages)
1. Crie no GitHub um repositorio publico (ex.: `USUARIO.github.io`).
2. Na pasta do site:
   ```
   git add -A
   git commit -m "Atualiza site"
   git remote add origin https://github.com/USUARIO/USUARIO.github.io.git   (so a 1a vez)
   git push -u origin main
   ```
3. No GitHub: Settings > Pages > Source: "Deploy from a branch", branch `main`, pasta `/ (root)`.
4. Dominio proprio: Settings > Pages > Custom domain = o dominio; depois marque "Enforce HTTPS".

## DNS do dominio proprio (no painel do registro.br ou de onde comprou)
Fonte: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site (conferido em 2026-11-14)

| Tipo | Nome | Valor |
|---|---|---|
| A | @ (raiz) | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | USUARIO.github.io |

## Adicionar um jogo novo
Crie a pasta do jogo, copie o cartao em `index.html` e, se o jogo tiver trava, inclua o arquivo dele no `build.py`.
