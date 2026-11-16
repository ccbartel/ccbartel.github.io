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
GAMES = ["geo-quiz", "candy-line"]  # slug = pasta do jogo; fonte em src/<slug>/game.src.js
STATE = ROOT / ".build_state.json"
TMP = ROOT / "_build_tmp"
OBF_VERSION = "javascript-obfuscator@4.1.1"
HTML_FILES = ["index.html", "privacy.html", "contact.html"] + [g + "/index.html" for g in GAMES]
DEFAULT_STATE = {"SITE_NAME": "Bartel Games", "CONTACT_EMAIL": "contato@SEU-DOMINIO",
                 "SITE_URL": "https://bartelgames.com.br/"}
OBF_OPTIONS = {
    "compact": True, "target": "browser", "identifierNamesGenerator": "hexadecimal",
    "stringArray": True, "stringArrayThreshold": 1, "stringArrayEncoding": ["rc4"],
    "stringArrayRotate": True, "stringArrayShuffle": True, "stringArrayIndexShift": True,
    "stringArrayWrappersCount": 2, "stringArrayWrappersType": "function",
    "splitStrings": True, "splitStringsChunkLength": 4,
    "transformObjectKeys": True, "renameGlobals": True,  # ok: modulo ES, nada exportado
    "numbersToExpressions": True, "simplify": True,
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
        SRC = ROOT / "src" / slug / "game.src.js"
        OUT = ROOT / slug / "game.js"
        src = SRC.read_text(encoding="utf8")
        src, n1 = re.subn(r"/\*@@ALLOWED_HOSTS@@\*/\[[^\]]*\]", lambda m: json.dumps(hosts), src)
        src, n2 = re.subn(r'/\*@@OFFICIAL_URL@@\*/"[^"]*"', lambda m: json.dumps(url), src)
        if n1 != 1 or n2 != 1:
            die("marcadores @@ALLOWED_HOSTS@@/@@OFFICIAL_URL@@ nao encontrados em " + str(SRC))
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
            leaks = [h for h in hosts if h in out]
            if leaks:
                die(slug + ": host em texto puro no game.js ofuscado: %s" % leaks)
        chk = subprocess.run(["node", "--check", str(OUT)], capture_output=True, text=True)
        if shutil.which("node") and chk.returncode != 0:
            die(slug + ": game.js com erro de sintaxe:\n" + chk.stderr[-800:])
        sizes.append((slug, OUT.stat().st_size // 1024))
        # versao no <script src="game.js?v=..."> = hash do FONTE: o navegador baixa o jogo novo logo apos publicar
        # (o GitHub Pages guarda game.js por 10 min; sem isso ele ouvia/via a versao velha). Fonte igual = mesmo ?v.
        page = ROOT / slug / "index.html"
        ver = hashlib.sha1(SRC.read_bytes()).hexdigest()[:8]
        ht = page.read_text(encoding="utf8")
        ht2, nv = re.subn(r'src="game\.js(\?v=[0-9a-f]+)?"', 'src="game.js?v=%s"' % ver, ht)
        if nv != 1:
            die(slug + ': <script src="game.js"> nao encontrado em ' + str(page))
        if ht2 != ht:
            page.write_text(ht2, encoding="utf8")

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


if __name__ == "__main__":
    main()
