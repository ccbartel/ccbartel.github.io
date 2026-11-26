"""Build do site de jogos (1 comando).

Uso:
  python build.py              le site-config.js e regenera tudo
  python build.py --sem-ofuscar  igual, mas game.js legivel (so para depurar; NAO publique assim)
  python build.py --help       esta ajuda

O que faz:
  1. Le site-config.js (nome, dominio, usuario GitHub, AdSense, hosts).
  2. Para cada jogo da lista GAMES: embute a lista de hosts permitidos e o link oficial em
     src/<jogo>/game.src.js e grava <jogo>/game.js OFUSCADO (javascript-obfuscator via npx; precisa do Node).
     Jogo novo = acrescentar o slug em GAMES (a pagina <jogo>/index.html entra sozinha em HTML_FILES).
  3. Gera CNAME (com o dominio; sem dominio = sem CNAME) e ads.txt (com o pub-ID do AdSense).
  4. Atualiza nas paginas .html o nome do site, o e-mail e o endereco (og:url / og:image).
  5. Confere: game.js sem nenhum host em texto puro e sintaxe valida (node --check).
"""
import hashlib, json, os, re, shutil, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
CONFIG = ROOT / "site-config.js"
GAMES = ["geo-quiz", "candy-line", "burnout-city", "bumpets", "the-last-driver", "crazy-parking", "candy-shot"]  # slug = pasta do jogo; fonte em src/<slug>/game.src.js
# jogo com src/<slug>/prebuild.py: o build roda esse script antes (ex.: Bumpets junta os modulos do cliente e copia os assets)
STATE = ROOT / ".build_state.json"
TMP = ROOT / "_build_tmp"
OBF_VERSION = "javascript-obfuscator@4.1.1"
# paginas que rodam o game.js de OUTRO jogo (mesmo codigo travado num modo; 2026-11-21): pagina -> slug do codigo.
# A pagina carrega ../<slug>/game.js e define o modo antes (ex.: Drift Trail = Burnout City so no Cones, window.BC_GAME).
SHARED_PAGES = {"drift-trail": "burnout-city"}
# paginas GERADAS com <base href="/<slug>/"> (src/bumpets/paginas.py roda no prebuild, ANTES do ?v novo): mesma versao do irmao.
# Sem isso Soccer/Race ficavam com o ?v anterior (game.js velho do cache por ate 10 min) - corrigido 2026-11-21.
BASE_PAGES = {"bumpets-soccer": "bumpets", "bumpets-race": "bumpets", "bumpets-zone": "bumpets", "bumpets-flag": "bumpets", "bumpets-paint": "bumpets", "bumpets-cards": "bumpets", "bumpets-pinball-soccer": "bumpets"}
HTML_FILES = ["index.html", "privacy.html", "contact.html"] + [g + "/index.html" for g in GAMES] + ["bumpets-soccer/index.html", "bumpets-race/index.html", "bumpets-zone/index.html", "bumpets-flag/index.html", "bumpets-paint/index.html", "bumpets-cards/index.html", "bumpets-pinball-soccer/index.html"] + [p + "/index.html" for p in SHARED_PAGES]  # irmaos do Bumpets (src/bumpets/paginas.py) + paginas compartilhadas
DEFAULT_STATE = {"SITE_NAME": "Bartel Games", "CONTACT_EMAIL": "contato@SEU-DOMINIO",
                 "SITE_URL": "https://bartelgames.com.br/"}
OBF_OPTIONS = {
    "compact": True, "target": "browser", "identifierNamesGenerator": "hexadecimal",
    # 2026-11-22 (DESEMPENHO, medido): rc4 + 2 wrappers + splitStrings + transformObjectKeys + numbersToExpressions viravam
    # chamada de funcao/concatenacao em CADA string dos lacos quentes: The Last Driver 31 ms -> 181 ms por quadro (CPU 6x,
    # Galaxy M34 real: 11-14 fps). Agora: array de strings sem codificacao e sem wrappers (acesso direto, o V8 otimiza);
    # nomes continuam trocados. Os hosts da trava saem codificados pelo proprio build (hosts_js/url_js abaixo).
    "stringArray": True, "stringArrayThreshold": 1, "stringArrayEncoding": [],
    "stringArrayRotate": True, "stringArrayShuffle": True, "stringArrayIndexShift": False,
    "stringArrayWrappersCount": 0, "stringArrayWrappersType": "variable",
    "splitStrings": False,
    "transformObjectKeys": False, "renameGlobals": True,  # ok: modulo ES, nada exportado
    "numbersToExpressions": False, "simplify": True,
    "controlFlowFlattening": False, "deadCodeInjection": False,  # desligados: pesam no loop do jogo
    "selfDefending": False, "debugProtection": False, "sourceMap": False,
}


def die(msg):
    print("ERRO: " + msg)
    sys.exit(1)


def read_config():
    txt = CONFIG.read_text(encoding="utf8")
    m = re.search(r"window\.SITE_CONFIG\s*=\s*(\{.*\})\s*;", txt, re.S)
    if not m:
        die("nao achei 'window.SITE_CONFIG = {...};' em site-config.js")
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        die("site-config.js com formato invalido (use aspas duplas, sem virgula sobrando): %s" % e)


def host_list(c):
    hosts = [h.strip().lower() for h in c.get("ALLOWED_HOSTS", []) if h.strip()]
    d = c.get("DOMAIN", "").strip().lower().removeprefix("https://").removeprefix("http://").strip("/")
    u = c.get("GITHUB_USER", "").strip().lower()
    if d:
        hosts += [d] if d.startswith("www.") else [d, "www." + d]
    if u:
        hosts.append(u + ".github.io")
    out = []
    for h in hosts:
        if h not in out:
            out.append(h)
    return out, d, u


def site_url(c, d, u):
    url = c.get("OFFICIAL_URL", "").strip()
    if not url:
        url = ("https://%s/" % d) if d else (("https://%s.github.io/" % u) if u else "")
    if url and not url.endswith("/"):
        url += "/"
    return url


HOST_KEY = 91   # chave do XOR da trava (so para nao deixar o dominio legivel no game.js; quem le o codigo ainda acha)


def _xor_codes(t):
    return [ord(ch) ^ ((HOST_KEY + i * 7) & 255) for i, ch in enumerate(t)]


def hosts_js(hosts):   # expressao JS que devolve a lista de hosts, decodificada uma vez no carregamento
    return "((a,k)=>a.map(w=>w.map((c,i)=>String.fromCharCode(c^((k+i*7)&255))).join('')))(%s,%d)" % (json.dumps([_xor_codes(h) for h in hosts]), HOST_KEY)


def url_js(url):
    return "((w,k)=>w.map((c,i)=>String.fromCharCode(c^((k+i*7)&255))).join(''))(%s,%d)" % (json.dumps(_xor_codes(url)), HOST_KEY)


def npx():
    exe = shutil.which("npx.cmd") or shutil.which("npx")
    if not exe:
        die("Node/npx nao encontrado. Instale o Node.js (nodejs.org) ou rode com --sem-ofuscar so para testar.")
    return exe


def main():
    args = sys.argv[1:]
    if "-h" in args or "--help" in args:
        print(__doc__)
        return
    plain = "--sem-ofuscar" in args
    c = read_config()
    hosts, d, u = host_list(c)
    url = site_url(c, d, u)

    # 1-2. jogos com hosts embutidos (um por um da lista GAMES)
    sizes = []
    for slug in GAMES:
        pre = ROOT / "src" / slug / "prebuild.py"
        if pre.exists():
            rp = subprocess.run([sys.executable, str(pre)], capture_output=True, text=True, encoding="utf8", errors="replace")
            if rp.returncode != 0:
                die(slug + ": prebuild.py falhou:\n" + (rp.stdout + rp.stderr)[-1500:])
            print("    " + slug + " prebuild: " + rp.stdout.strip().replace("\n", " | "))
        SRC = ROOT / "src" / slug / "game.src.js"
        OUT = ROOT / slug / "game.js"
        src = SRC.read_text(encoding="utf8")
        src, n1 = re.subn(r"/\*@@ALLOWED_HOSTS@@\*/\[[^\]]*\]", lambda m: hosts_js(hosts), src)
        src, n2 = re.subn(r'/\*@@OFFICIAL_URL@@\*/"[^"]*"', lambda m: url_js(url), src)
        if n1 != 1 or n2 != 1:
            die("marcadores @@ALLOWED_HOSTS@@/@@OFFICIAL_URL@@ nao encontrados em " + str(SRC))
        # guarda (2026-11-20): com transformObjectKeys o ofuscador tira o objeto de um 'for(...) lista.push({...})' SEM chaves
        # e todos os itens viram o MESMO objeto (provado: cones do modo Cones do Burnout todos no mesmo lugar). Exigir chaves.
        ruim = [str(i + 1) for i, l in enumerate(src.split("\n")) if re.search(r"for\([^)]*\)\s*[A-Za-z_$][\w$.]*\.push\(\{", l)]
        if ruim:
            die(slug + ": 'for(...) x.push({...})' sem chaves nas linhas " + ", ".join(ruim) + " de " + str(SRC) + " (use for(...){ x.push({...}); })")
        if plain:
            OUT.write_text(src, encoding="utf8")
        else:
            TMP.mkdir(exist_ok=True)
            pre, cfg = TMP / "game.pre.js", TMP / "obf.json"
            pre.write_text(src, encoding="utf8")
            cfg.write_text(json.dumps(OBF_OPTIONS), encoding="utf8")
            r = subprocess.run([npx(), "--yes", OBF_VERSION, str(pre), "--output", str(OUT), "--config", str(cfg)],
                               capture_output=True, text=True, encoding="utf8", errors="replace")
            shutil.rmtree(TMP, ignore_errors=True)
            if r.returncode != 0 or not OUT.exists():
                die(slug + ": ofuscador falhou:\n" + (r.stdout + r.stderr)[-1500:])
            out = OUT.read_text(encoding="utf8")
            leaks = [h for h in hosts if h in out and h not in ("localhost", "127.0.0.1", "[::1]")]   # 2026-11-22: sem rc4, os hosts locais aparecem nos testes de modo local do proprio jogo (inofensivo); o dominio do site continua proibido em texto puro
            if leaks:
                die(slug + ": host em texto puro no game.js ofuscado: %s" % leaks)
        chk = subprocess.run(["node", "--check", str(OUT)], capture_output=True, text=True)
        if shutil.which("node") and chk.returncode != 0:
            die(slug + ": game.js com erro de sintaxe:\n" + chk.stderr[-800:])
        sizes.append((slug, OUT.stat().st_size // 1024))
        # versao no <script src="game.js?v=..."> = hash do FONTE: o navegador baixa o jogo novo logo apos publicar
        # (o GitHub Pages guarda game.js por 10 min; sem isso ele ouvia/via a versao velha). Fonte igual = mesmo ?v.
        page = ROOT / slug / "index.html"
        if (ROOT / slug / "play.html").exists():  # jogo dentro de <iframe> (The Last Driver, 2026-11-22): o game.js fica no play.html
            page = ROOT / slug / "play.html"
        ver = hashlib.sha1(SRC.read_bytes()).hexdigest()[:8]
        ht = page.read_text(encoding="utf8")
        ht2, nv = re.subn(r'src="game\.js(\?v=[0-9a-f]+)?"', 'src="game.js?v=%s"' % ver, ht)
        if nv != 1:
            die(slug + ': <script src="game.js"> nao encontrado em ' + str(page))
        if ht2 != ht:
            page.write_text(ht2, encoding="utf8")
        for bp, code in BASE_PAGES.items():
            if code != slug:
                continue
            bpage = ROOT / bp / "index.html"
            bt = bpage.read_text(encoding="utf8")
            bt2, nv = re.subn(r'src="game\.js(\?v=[0-9a-f]+)?"', 'src="game.js?v=%s"' % ver, bt)
            if nv != 1:
                die(bp + ': <script src="game.js"> nao encontrado em ' + str(bpage))
            if bt2 != bt:
                bpage.write_text(bt2, encoding="utf8")
        for sp, code in SHARED_PAGES.items():  # paginas que usam este game.js: mesma versao no ?v
            if code != slug:
                continue
            spage = ROOT / sp / "index.html"
            st = spage.read_text(encoding="utf8")
            st2, nv = re.subn(r'src="\.\./' + re.escape(slug) + r'/game\.js(\?v=[0-9a-f]+)?"', 'src="../%s/game.js?v=%s"' % (slug, ver), st)
            if nv != 1:
                die(sp + ': <script src="../' + slug + '/game.js"> nao encontrado em ' + str(spage))
            if st2 != st:
                spage.write_text(st2, encoding="utf8")

    # 2b. scripts comuns do site com ?v = hash do arquivo (2026-11-21: social.js sem versao ficou 10 min no cache do Pages
    #     e o mural novo chamou a versao velha). Vale para toda pagina em HTML_FILES.
    for common in ("social.js", "community.js", "scorecard.js", "install.js", "achievements.js", "site-i18n.js"):  # site-i18n.js (2026-11-22): card novo mostrava a chave com o arquivo velho no cache
        cver = hashlib.sha1((ROOT / common).read_bytes()).hexdigest()[:8]
        for hf in HTML_FILES:
            hp = ROOT / hf
            if not hp.exists():
                continue
            ht = hp.read_text(encoding="utf8")
            ht2 = re.sub(r'src="((?:\.\./)?)' + re.escape(common) + r'(\?v=[0-9a-z]+)?"', lambda m: 'src="%s%s?v=%s"' % (m.group(1), common, cver), ht)
            if ht2 != ht:
                hp.write_text(ht2, encoding="utf8")
    # 2b2. share.js de cada jogo com ?v = hash (2026-11-21: cartao de pontuacao); pagina com <base href="/x/"> usa o share.js de /x/
    for hf in HTML_FILES:
        hp = ROOT / hf
        if "/" not in hf or not hp.exists():
            continue
        ht = hp.read_text(encoding="utf8")
        mb = re.search(r'<base href="/([a-z0-9-]+)/">', ht)
        sj = ROOT / (mb.group(1) if mb else hf.split("/")[0]) / "share.js"
        if not sj.exists():
            continue
        sv = hashlib.sha1(sj.read_bytes()).hexdigest()[:8]
        ht2 = re.sub(r'src="share\.js(\?v=[0-9a-z]+)?"', 'src="share.js?v=%s"' % sv, ht)
        if ht2 != ht:
            hp.write_text(ht2, encoding="utf8")
    # 2c. SEO (2026-11-21): canonical + JSON-LD, "Como jogar" pre-preenchido em ingles, sitemap.xml e robots.txt (src/seo.py)
    sys.path.insert(0, str(ROOT / "src")); import seo
    print("    seo: %d paginas no sitemap" % seo.run(str(ROOT), HTML_FILES))
    # 3. CNAME e ads.txt
    cname = ROOT / "CNAME"
    if d:
        cname.write_text(d + "\n", encoding="utf8")
    elif cname.exists():
        cname.unlink()  # arquivo gerado por este build; sem dominio = sem CNAME
    client = c.get("ADSENSE_CLIENT", "").strip()
    if client:
        pub = client.removeprefix("ca-")
        ads = "google.com, %s, DIRECT, f08c47fec0942fa0\n" % pub
    else:
        ads = ("# ads.txt - preenchido pelo build.py quando ADSENSE_CLIENT estiver em site-config.js.\n"
               "# Formato (1 linha, troque pelo seu ID de editor do AdSense):\n"
               "# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n")
    (ROOT / "ads.txt").write_text(ads, encoding="utf8")

    # 4. textos fixos nas paginas (troca o valor anterior pelo novo)
    state = dict(DEFAULT_STATE)
    if STATE.exists():
        state.update(json.loads(STATE.read_text(encoding="utf8")))
    new = {"SITE_NAME": c.get("SITE_NAME", "").strip(), "CONTACT_EMAIL": c.get("CONTACT_EMAIL", "").strip(),
           "SITE_URL": url}
    changed = 0
    for f in HTML_FILES:
        p = ROOT / f
        t0 = t = p.read_text(encoding="utf8")
        for k, v in new.items():
            if v and state.get(k) and state[k] != v:
                t = t.replace(state[k], v)
        if t != t0:
            p.write_text(t, encoding="utf8")
            changed += 1
    for k, v in new.items():
        if v:
            state[k] = v
    STATE.write_text(json.dumps(state, indent=1, ensure_ascii=False), encoding="utf8")

    for slug, kb in sizes:
        print("OK  %s/game.js %s (%d KB)" % (slug, "LEGIVEL (nao publicar)" if plain else "ofuscado", kb))
    print("    hosts permitidos: " + ", ".join(hosts))
    print("    link oficial: " + (url or "(vazio)"))
    print("    CNAME: " + (d or "nao gerado (DOMAIN vazio)"))
    print("    ads.txt: " + ("com " + client if client else "placeholder (ADSENSE_CLIENT vazio)"))
    print("    paginas atualizadas: %d" % changed)


def _trava():
    """Um build por vez (licao L-1001, 2026-11-24: 2 agentes rodando build.py juntos quebraram os 2 builds).
    .build.lock com O_EXCL; trava de mais de 15 min e considerada orfa e removida."""
    import time
    lk = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".build.lock")
    if os.path.exists(lk) and time.time() - os.path.getmtime(lk) > 900:
        os.remove(lk)
    try:
        fd = os.open(lk, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        sys.exit("OUTRO build.py esta rodando (%s existe). Espere ele terminar e rode de novo." % lk)
    os.write(fd, str(os.getpid()).encode()); os.close(fd)
    return lk


if __name__ == "__main__":
    _lk = _trava()
    try:
        main()
    finally:
        os.remove(_lk)
