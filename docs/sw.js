const CDN = "https://cdn.jsdelivr.net/gh/acil40/500lits@ab39ac4";
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/templates/feuille-consommation.xlsx") {
    event.respondWith(fetch(CDN + "/templates/feuille-consommation.xlsx"));
  }
});
