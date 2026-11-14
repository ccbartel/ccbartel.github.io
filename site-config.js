// ===== CONFIGURACAO DO SITE (unico lugar para trocar nome, dominio e AdSense) =====
// Depois de editar: rode  build.py  (veja README.md). Mantenha o formato JSON abaixo:
// aspas duplas, sem comentarios dentro das chaves, sem virgula sobrando.
//  SITE_NAME          nome do portal
//  DOMAIN             dominio proprio sem https (ex.: "bartelgames.com.br"); vazio = sem dominio (gera sem CNAME)
//  GITHUB_USER        seu usuario do GitHub (o site tambem responde em USUARIO.github.io)
//  CONTACT_EMAIL      e-mail mostrado na pagina Contact
//  ALLOWED_HOSTS      hosts EXTRAS onde o jogo pode rodar (o build ja soma DOMAIN, www.DOMAIN e USUARIO.github.io)
//  OFFICIAL_URL       link do aviso quando o jogo roda fora do site; vazio = o build usa https://DOMAIN/
//  ADSENSE_CLIENT     "ca-pub-XXXXXXXXXXXXXXXX" (vazio = nao carrega o Google e mostra "Ad space")
//  ADSENSE_SLOT_GAME  id do bloco de anuncio do banner do jogo
//  ADSENSE_SLOT_HOME  id do bloco de anuncio do banner da vitrine (vazio = sem banner na vitrine)
window.SITE_CONFIG = {
  "SITE_NAME": "Bartel Games",
  "DOMAIN": "bartelgames.com.br",
  "GITHUB_USER": "ccbartel",
  "CONTACT_EMAIL": "contato@SEU-DOMINIO",
  "ALLOWED_HOSTS": ["localhost", "127.0.0.1"],
  "OFFICIAL_URL": "",
  "ADSENSE_CLIENT": "",
  "ADSENSE_SLOT_GAME": "",
  "ADSENSE_SLOT_HOME": ""
};
