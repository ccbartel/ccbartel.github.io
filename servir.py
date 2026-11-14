"""Servidor local para testar o site (HTTP/1.1, evita o reset de conexao do http.server no Windows).

Uso:  python servir.py [porta] [ip]     (padrao: 8000 127.0.0.1)  ->  abra http://localhost:8000/
      python servir.py --help
"""
import sys, os, http.server, functools

if "-h" in sys.argv or "--help" in sys.argv:
    print(__doc__); sys.exit(0)
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ip = sys.argv[2] if len(sys.argv) > 2 else "127.0.0.1"


class H(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


root = os.path.dirname(os.path.abspath(__file__))
srv = http.server.ThreadingHTTPServer((ip, port), functools.partial(H, directory=root))
print("Servindo %s em http://%s:%d/  (Ctrl+C para parar)" % (root, ip, port), flush=True)
srv.serve_forever()
