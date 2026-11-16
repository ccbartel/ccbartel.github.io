# Padrão dos jogos do Bartel Games (bartelgames.com.br)

Guia para qualquer conversa/agente que for criar ou mudar um jogo deste site. Referência pronta: `geo-quiz/`.

## Regras do dono (Cristiano)
- Pode implementar, testar e publicar (commit + push) sem pedir licença; só parar para o que só ele resolve (contas, senhas, pagamentos, dados pessoais, decisões de rumo).
- Antes de mostrar/publicar algo visual: avaliador independente (subagente) + capturas.
- Na vitrine, os jogos vêm PRIMEIRO; promoção (Kaze, TikTok, YouTube) fica depois, compacta.
- Texto grande estilizado: degradê dourado SEM chegar ao branco + contorno escuro (branco com borda branca fica ilegível).
- Desafio do dia = MISSÃO do dia (objetivo claro, igual para todos pela data, ex. "acerte 3 bandeiras sem errar", "encha 5 saquinhos"); tentativas ilimitadas, ✅ ao cumprir, compartilhar "✅ em N tentativas"; ranking só no modo infinito/pontuação.
- Mudou uma regra do jogo? Revisar junto tudo o que a mostra: capa, ícone, demonstração do menu e o "Como jogar" nos 6 idiomas. Ele notou a capa ainda em diagonal depois que as diagonais saíram do Candy Line. Isso inclui a imagem do link compartilhado (`og:image`, ex. `assets/og.jpg`): ao trocar, subir `?v=N` no endereço para os apps não usarem a antiga em cache.
- Quiz: sem timer; opções erradas ficam mais difíceis com o tempo (vizinhos, bandeiras parecidas).
- Som: efeitos curtos sintetizados (WebAudio, sem arquivos), LIGADOS por padrão, com botão de alto-falante na barra do topo para desligar (a escolha fica salva). Pedido dele em 2026-11-16.

## Checklist de um jogo novo
1. **Pasta** `<slug>/` com `index.html` (tela cheia, palco 9:16 720x1280 escalado), barra do topo: `← Mais jogos` (grande, com seta SVG), ⓘ Como jogar (`<dialog>` com texto próprio — conta para Google/AdSense), ♥ like, Compartilhar; faixa de anúncio embaixo (`#adbar`, `data-ad-slot-key`).
2. **Código-fonte** em `src/<slug>/game.src.js` (fora do git); adicionar o slug na lista `GAMES` do `build.py`; `python build.py` ofusca para `<slug>/game.js` com trava de domínio (hosts em `site-config.js`). O build APAGA `_build_tmp/` — não guarde nada lá.
3. **Idioma automático**: `i18n.js` (en, pt, es, fr, de, it; `?lang=xx` para testar), `<html lang>` definido cedo para o Chrome não oferecer tradução; nomes de países por `Intl.DisplayNames`.
4. **Fluxo**: menu antes de jogar (título + modos), nunca abre jogando; resultado com "Jogar de novo" (volta ao menu) e Compartilhar com texto do modo/pontuação (`share.js`: `navigator.share` no celular, copiar link no PC).
5. **Social (Supabase, projeto `bartelgames`)**: inserir a linha do jogo em `game_stats` (`insert into game_stats(game) values('<slug>')`); incluir `../social.js` (window.BG_SOCIAL: play, like, stats, submit, top) e uma UI como `geo-quiz/social-ui.js`. Em localhost o social não grava nada (testes não sujam o banco).
6. **Vitrine** (`index.html` da raiz): textos do portal traduzidos por `site-i18n.js` (`data-i18n`, `data-i18n-html`, `data-i18n-alt`, `data-i18n-label`). Texto novo no portal = chave nos 6 idiomas. Card estilo YouTube Playables — capa 3:4 com o nome do jogo na arte, título + categoria embaixo, `data-game="<slug>"` e `<p class="meta">` (Played N times · ♥ N). Ícone/capa sem elementos 2D chapados destoando de arte 3D.
7. **PWA**: páginas com `<link rel="manifest" href="/manifest.webmanifest">`; `sw.js` é rede-primeiro.
8. **Testar**: as janelas de navegador do Cristiano costumam estar ocultas (animação parada) — usar Chrome headless com puppeteer-core (script `shot.mjs` no scratchpad da sessão; refazer se sumir): servidor local `python -m http.server <porta> --bind 127.0.0.1` e abrir por `http://127.0.0.1:<porta>/`, não `localhost`: com `localhost` o Chrome tenta IPv6 primeiro e o jogo trava no carregamento. Testar menu, partida, resultado, 375/414/1280 px, pt e en, sem rolagem horizontal.
9. **Privacidade**: se coletar algo novo, atualizar `privacy.html`.
10. **Publicar**: `python build.py`, `git add -A`, commit com a linha `Co-Authored-By`, `git push origin main`; GitHub Pages leva 1-2 min.
