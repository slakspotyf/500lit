const USER = "hassad";
const PASS = "5420";
const STORAGE = "feuille-consommation-v2";
const SESSION = "feuille-consommation-session-v1";
const LOCALE_KEY = "feuille-consommation-locale";

const T = {
  fr: {
    tag: "ONOU · Restauration",
    title: "Consommation journalière",
    lockTitle: "Accès administrateur",
    lockLead: "Feuille de consommation — saisie réservée au responsable.",
    user: "Identifiant",
    pass: "Mot de passe",
    remember: "Rester connecté sur cet appareil",
    signIn: "Entrer",
    bad: "Identifiant ou mot de passe incorrect.",
    today: "Aujourd'hui",
    sheets: "Feuilles",
    products: "Produits",
    recap: "Bilan du mois",
    recapLead: "Chaque produit : totaux d'entrées et de sorties du mois.",
    recapOpen: "Ouvrir le bilan",
    recapCardLead: "Entrées et sorties de chaque produit, mois par mois.",
    recapDays: "Jours saisis",
    recapMoved: "Produits concernés",
    recapWithMovement: "Avec mouvement",
    recapAll: "Tous",
    recapEmpty: "Aucun produit pour ce filtre.",
    days: "Journées",
    newSheet: "Nouvelle feuille",
    lock: "Verrouiller",
    open: "Ouvrir",
    del: "Supprimer",
    back: "Retour",
    save: "Enregistré",
    entries: "Entrées",
    sorties: "Sorties",
    valeur: "Valeur",
    restes: "Restes",
    stock: "Stock veille",
    pu: "P.U.",
    pret: "Prêt",
    total: "Total",
    attendance: "Effectif",
    menu: "Menu",
    print: "Imprimer A3",
    jsonOut: "Sauvegarde JSON",
    jsonIn: "Importer JSON",
    search: "Rechercher…",
    breakfast: "Petit déj.",
    lunch: "Déjeuner",
    dinner: "Dîner",
    moyenne: "Moyenne (déj. + dîner) / 2",
    depense: "Dépense / personne",
    unlockStock: "Déverrouiller Stock veille / Restes",
    noDays: "Aucune journée. Créez la feuille du jour.",
    pensionnaires: "Pensionnaires",
    agents: "Agents",
    invites: "Invités",
  },
  ar: {
    tag: "الديوان الوطني للخدمات الجامعية",
    title: "ورقة الاستهلاك اليومي",
    lockTitle: "دخول المسؤول",
    lockLead: "إدخال ورقة الاستهلاك مخصص للمسؤول.",
    user: "اسم المستخدم",
    pass: "كلمة السر",
    remember: "البقاء متصلاً على هذا الجهاز",
    signIn: "دخول",
    bad: "اسم المستخدم أو كلمة السر غير صحيحة.",
    today: "اليوم",
    sheets: "الأوراق",
    products: "المنتجات",
    recap: "حصيلة الشهر",
    recapLead: "كل منتج على حدة: مجموع المداخل ومجموع الاستهلاك لهذا الشهر.",
    recapOpen: "فتح الحصيلة",
    recapCardLead: "مداخل واستهلاك كل منتج، شهراً بشهر.",
    recapDays: "أيام مسجّلة",
    recapMoved: "منتجات معنية",
    recapWithMovement: "فيها حركة",
    recapAll: "الكل",
    recapEmpty: "لا يوجد منتج بهذا التصفية.",
    days: "الأيام",
    newSheet: "ورقة جديدة",
    lock: "قفل",
    open: "فتح",
    del: "حذف",
    back: "رجوع",
    save: "تم الحفظ",
    entries: "المداخل",
    sorties: "الاستهلاك",
    valeur: "القيمة",
    restes: "البواقي",
    stock: "مخزون الأمس",
    pu: "س.و",
    pret: "سلفة",
    total: "المجموع",
    attendance: "العدد",
    menu: "القائمة",
    print: "طباعة A3",
    jsonOut: "نسخة JSON",
    jsonIn: "استيراد JSON",
    search: "بحث…",
    breakfast: "فطور",
    lunch: "غداء",
    dinner: "عشاء",
    moyenne: "المتوسط (غداء + عشاء) / 2",
    depense: "النفقة / شخص",
    unlockStock: "فتح مخزون الأمس / البواقي",
    noDays: "لا توجد أيام. أنشئ ورقة اليوم.",
    pensionnaires: "المقيمون",
    agents: "العمال",
    invites: "الضيوف",
  },
};

const SETTINGS = {
  organization: "Office National des Oeuvres Universitaires",
  direction: "Direction des Oeuvres Universitaires",
  residence: "Résidence Universitaire : 500 Lits",
  restaurant: "brarhi abdelhak restau central",
};

let products = [];
let sheets = {};
let settings = { ...SETTINGS };
let locale = localStorage.getItem(LOCALE_KEY) === "ar" ? "ar" : "fr";
let view = "home";
let currentDate = todayISO();
let recapMonth = "";
let recapQuery = "";
let recapFilter = "movement";
let query = "";
let stockUnlocked = false;

const $ = (id) => document.getElementById(id);
const t = () => T[locale];
const qty = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x) || Math.abs(x) < 1e-12) return "0";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(Math.round(x * 10000) / 10000);
};
const money = (n) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function meals() { return { breakfast: 0, lunch: 0, dinner: 0 }; }
function emptyAtt() { return { pensionnaires: meals(), agents: meals(), invites: meals() }; }
function emptyLine(pu) { return { stockPrev: 0, entries: 0, unitPrice: pu || 0, sorties: 0, pret: 0 }; }
function compute(p, e = {}) {
  const stockPrev = +e.stockPrev || 0;
  const entries = +e.entries || 0;
  const unitPrice = +e.unitPrice || +p.unitPrice || 0;
  const sorties = +e.sorties || 0;
  const pret = +e.pret || 0;
  const total = stockPrev + entries;
  const restes = total - sorties;
  const valeur = Math.max(0, sorties - pret) * unitPrice;
  return { ...p, stockPrev, entries, unitPrice, sorties, pret, total, restes, valeur };
}
function attTotals(a) {
  const add = (k) => (+a.pensionnaires[k] || 0) + (+a.agents[k] || 0) + (+a.invites[k] || 0);
  const lunch = add("lunch"), dinner = add("dinner");
  const n = (lunch > 0) + (dinner > 0);
  const moyenne = n === 0 ? 0 : n === 2 ? (lunch + dinner) / 2 : lunch + dinner;
  return { breakfast: add("breakfast"), lunch, dinner, moyenne };
}
function monthKey(date) { return date.slice(0, 7); }
function monthTitle(m) {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString(locale === "ar" ? "ar" : "fr-FR", { month: "long", year: "numeric" });
}
function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || "null");
    const s = raw?.state || raw;
    if (s?.products?.length) products = s.products;
    if (s?.sheets) sheets = s.sheets;
    if (s?.settings) settings = { ...SETTINGS, ...s.settings };
  } catch { /* empty */ }
}
function saveState() {
  localStorage.setItem(STORAGE, JSON.stringify({ state: { products, sheets, settings, currentDate }, version: 1 }));
}
function previousSheet(date) {
  const keys = Object.keys(sheets).filter((d) => d < date).sort();
  return keys.length ? sheets[keys[keys.length - 1]] : null;
}
function ensureSheet(date) {
  if (sheets[date]) return sheets[date];
  const prev = previousSheet(date);
  const lines = {};
  for (const p of products) {
    const pl = prev?.lines?.[p.id];
    const restes = pl ? Math.max(0, (+pl.stockPrev || 0) + (+pl.entries || 0) - (+pl.sorties || 0)) : 0;
    lines[p.id] = { stockPrev: restes, entries: 0, unitPrice: pl?.unitPrice ?? p.unitPrice, sorties: 0, pret: 0 };
  }
  sheets[date] = {
    date,
    restaurant: settings.restaurant,
    residence: settings.residence,
    lines,
    attendance: emptyAtt(),
    menu: { breakfast: "", lunch: "", dinner: "", observations: "" },
    updatedAt: new Date().toISOString(),
  };
  saveState();
  return sheets[date];
}
function hasSession() {
  return sessionStorage.getItem(SESSION) === "1" || localStorage.getItem(SESSION) === "1";
}
function setLocale(next) {
  locale = next;
  localStorage.setItem(LOCALE_KEY, next);
  document.documentElement.lang = next === "ar" ? "ar" : "fr";
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  render();
}
function langSwitch() {
  return `<div class="lang no-print">
    <button class="${locale === "fr" ? "on" : ""}" data-act="lang-fr">FR</button>
    <button class="${locale === "ar" ? "on" : ""}" data-act="lang-ar">ع</button>
  </div>`;
}

function renderLock() {
  const x = t();
  $("app").innerHTML = `<div class="lock">
    <form id="login">
      <div style="display:flex;justify-content:flex-end">${langSwitch()}</div>
      <div class="icon">🔒</div>
      <p class="tag" style="text-align:center">${x.tag}</p>
      <h1>${x.lockTitle}</h1>
      <p class="muted" style="text-align:center">${x.lockLead}</p>
      <label>${x.user}<input id="u" value="${USER}" autocomplete="username"></label>
      <label>${x.pass}<input id="p" type="password" autocomplete="current-password" autofocus></label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="r" checked> ${x.remember}</label>
      <p class="err hidden" id="err">${x.bad}</p>
      <button class="btn primary" style="width:100%;margin-top:8px" type="submit">${x.signIn}</button>
    </form>
  </div>`;
}

function renderHome() {
  const x = t();
  const dates = Object.keys(sheets).sort();
  $("app").innerHTML = `<div class="wrap">
    <header class="top no-print">
      <div>
        <p class="tag">${x.tag}</p>
        <h1>${x.title}</h1>
        <p class="muted">${settings.residence} — ${settings.restaurant}</p>
      </div>
      <div class="row">
        ${langSwitch()}
        <button class="btn" data-act="lock">${x.lock}</button>
        <button class="btn primary" data-act="open-today">${x.newSheet}</button>
      </div>
    </header>
    <section class="cards no-print">
      <article class="card"><span class="muted">${x.today}</span><b>${todayISO()}</b></article>
      <article class="card"><span class="muted">${x.sheets}</span><b>${dates.length}</b></article>
      <article class="card"><span class="muted">${x.products}</span><b>${products.length}</b></article>
    </section>
    <button class="product-card recap-entry no-print" data-act="open-recap" type="button" style="width:100%;text-align:inherit;cursor:pointer">
      <div>
        <p class="n">${x.recap}</p>
        <h3>${x.recapOpen}</h3>
        <p class="muted">${x.recapCardLead}</p>
      </div>
    </button>
    <section class="card">
      <h2>${x.days}</h2>
      <div class="row" style="margin:12px 0">
        <button class="btn" data-act="json-out">${x.jsonOut}</button>
        <label class="btn" style="display:grid;place-items:center">${x.jsonIn}<input type="file" accept="application/json" id="jsonin" class="hidden"></label>
      </div>
      ${dates.length === 0 ? `<p class="muted">${x.noDays}</p>` : `<ul class="list">${[...dates].reverse().map((d) => {
        const sh = sheets[d];
        const lines = products.map((p) => compute(p, sh.lines[p.id]));
        const val = lines.reduce((s, l) => s + l.valeur, 0);
        return `<li><div><b>${d}</b><div class="muted">${money(val)} DA · ${sh.restaurant || ""}</div></div>
          <div class="row"><button class="btn primary" data-act="open" data-d="${d}">${x.open}</button>
          <button class="btn danger" data-act="del" data-d="${d}">${x.del}</button></div></li>`;
      }).join("")}</ul>`}
    </section>
  </div>`;
}

function renderRecap() {
  const x = t();
  const dates = Object.keys(sheets).sort();
  const months = {};
  for (const d of dates) (months[monthKey(d)] ||= []).push(sheets[d]);
  const monthList = Object.keys(months).sort().reverse();
  if (!recapMonth || !months[recapMonth]) recapMonth = monthList[0] || todayISO().slice(0, 7);
  const recapDays = months[recapMonth] || [];
  const recapRows = products.map((p) => {
    let entries = 0, sorties = 0, valeur = 0, restes = 0;
    recapDays.forEach((day) => {
      const line = compute(p, day.lines[p.id]);
      entries += line.entries; sorties += line.sorties; valeur += line.valeur; restes = line.restes;
    });
    return { p, entries, sorties, valeur, restes };
  });
  const qRecap = recapQuery.trim();
  const visibleRecap = recapRows.filter((r) => {
    if (r.p.placeholder && !r.entries && !r.sorties) return false;
    if (recapFilter === "movement" && !r.entries && !r.sorties) return false;
    if (qRecap && !r.p.name.includes(qRecap) && !String(r.p.number).includes(qRecap)) return false;
    return true;
  });
  const totV = visibleRecap.reduce((a, r) => a + r.valeur, 0);
  $("app").innerHTML = `<div class="wrap">
    <header class="top no-print">
      <div class="row">
        <button class="btn" data-act="home">${x.back}</button>
        <div>
          <p class="tag">${x.tag}</p>
          <h1>${x.recap}</h1>
          <p class="muted">${x.recapLead}</p>
        </div>
      </div>
      ${langSwitch()}
    </header>
    <section class="card">
      <div class="month-btns">${monthList.map((m) => `<button class="btn ${m === recapMonth ? "primary" : ""}" data-act="month" data-m="${m}">${monthTitle(m)} · ${months[m].length} j</button>`).join("") || ""}</div>
      <div class="cards">
        <article class="card"><span class="muted">${x.recapDays}</span><b>${recapDays.length}</b></article>
        <article class="card"><span class="muted">${x.recapMoved}</span><b>${visibleRecap.length}</b></article>
        <article class="card"><span class="muted">${x.valeur}</span><b>${money(totV)} DA</b></article>
      </div>
      <div class="row" style="margin:8px 0 12px">
        <input class="search" id="recap-q" placeholder="${x.search}">
        <button class="btn ${recapFilter === "movement" ? "primary" : ""}" data-act="recap-move">${x.recapWithMovement}</button>
        <button class="btn ${recapFilter === "all" ? "primary" : ""}" data-act="recap-all">${x.recapAll}</button>
      </div>
      ${visibleRecap.length === 0 ? `<p class="muted" style="padding:24px;text-align:center">${x.recapEmpty}</p>` : `
      <div class="product-grid">
        ${visibleRecap.map((r) => `<article class="product-card">
          <div>
            <p class="n">N° ${r.p.number}</p>
            <h3>${r.p.name}</h3>
          </div>
          <div class="split">
            <div class="stat in"><span>${x.entries}</span><strong>${qty(r.entries)}</strong></div>
            <div class="stat out"><span>${x.sorties}</span><strong>${qty(r.sorties)}</strong></div>
          </div>
          <div class="product-foot">
            <div><small>${x.valeur}</small><b>${money(r.valeur)} DA</b></div>
            <div style="text-align:end"><small>${x.restes}</small><b>${qty(r.restes)}</b></div>
          </div>
        </article>`).join("")}
      </div>
      <div class="table-wrap" style="margin-top:16px"><table>
        <thead><tr><th>N°</th><th>${x.products}</th><th class="num">${x.entries}</th><th class="num">${x.sorties}</th><th class="num">${x.valeur}</th><th class="num">${x.restes}</th></tr></thead>
        <tbody>${visibleRecap.map((r) => `<tr><td>${r.p.number}</td><td class="name">${r.p.name}</td><td class="num num-in">${qty(r.entries)}</td><td class="num num-out">${qty(r.sorties)}</td><td class="num">${money(r.valeur)}</td><td class="num">${qty(r.restes)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><th colspan="4">${x.total} — ${x.valeur}</th><th class="num">${money(totV)}</th><th></th></tr></tfoot>
      </table></div>`}
    </section>
  </div>`;
  const rq = $("recap-q");
  if (rq) rq.value = recapQuery;
}

function renderEditor() {
  const x = t();
  const sh = ensureSheet(currentDate);
  const lines = products.map((p) => compute(p, sh.lines[p.id]));
  const tot = lines.reduce((a, l) => ({ valeur: a.valeur + l.valeur, sorties: a.sorties + l.sorties }), { valeur: 0, sorties: 0 });
  const att = attTotals(sh.attendance);
  const q = query.trim();
  const vis = lines.filter((l) => !q || l.name.includes(q) || String(l.number).includes(q));
  const dep = att.moyenne ? tot.valeur / att.moyenne : 0;
  $("app").innerHTML = `<div class="wrap">
    <header class="top no-print">
      <div class="row">
        <button class="btn" data-act="home">${x.back}</button>
        <div><p class="muted">${x.title}</p><h1>${currentDate}</h1></div>
      </div>
      <div class="row">
        ${langSwitch()}
        <input type="date" id="date" value="${currentDate}">
        <button class="btn" data-act="open-recap">${x.recap}</button>
        <button class="btn" data-act="print">${x.print}</button>
        <button class="btn" data-act="lock">${x.lock}</button>
      </div>
    </header>
    <section class="cards no-print">
      <article class="card"><span class="muted">${x.valeur}</span><b>${money(tot.valeur)} DA</b></article>
      <article class="card"><span class="muted">${x.moyenne}</span><b>${qty(att.moyenne)}</b></article>
      <article class="card"><span class="muted">${x.depense}</span><b>${money(dep)} DA</b></article>
    </section>
    <div class="card no-print" style="margin-bottom:16px">
      <h2>${x.attendance}</h2>
      <div class="table-wrap" style="border:0"><table>
        <thead><tr><th></th><th>${x.breakfast}</th><th>${x.lunch}</th><th>${x.dinner}</th></tr></thead>
        <tbody>${["pensionnaires","agents","invites"].map((g) => `<tr>
          <td>${x[g]}</td>
          ${["breakfast","lunch","dinner"].map((m) => `<td><input class="qty att" data-g="${g}" data-m="${m}" value="${sh.attendance[g][m] || ""}"></td>`).join("")}
        </tr>`).join("")}</tbody>
      </table></div>
    </div>
    <div class="card no-print" style="margin-bottom:16px">
      <h2>${x.menu}</h2>
      ${["breakfast","lunch","dinner"].map((m) => `<label>${x[m]}<textarea data-menu="${m}">${sh.menu[m] || ""}</textarea></label>`).join("")}
      <label>Observations<textarea data-menu="observations">${sh.menu.observations || ""}</textarea></label>
    </div>
    <div class="row no-print" style="margin-bottom:10px">
      <input class="search" id="q" placeholder="${x.search}" value="${query}">
      <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="unlock" ${stockUnlocked ? "checked" : ""}> ${x.unlockStock}</label>
    </div>
    <div class="table-wrap no-print"><table>
      <thead><tr><th>N°</th><th>${x.products}</th><th class="num">${x.stock}</th><th class="num">${x.entries}</th><th class="num">${x.pu}</th><th class="num">${x.total}</th><th class="num">${x.sorties}</th><th class="num">${x.pret}</th><th class="num">${x.valeur}</th><th class="num">${x.restes}</th></tr></thead>
      <tbody>${vis.map((l) => `<tr>
        <td>${l.number}</td><td class="name">${l.name}</td>
        <td><input class="qty line" data-id="${l.id}" data-f="stockPrev" value="${l.stockPrev || ""}" ${stockUnlocked ? "" : "disabled"}></td>
        <td><input class="qty line" data-id="${l.id}" data-f="entries" value="${l.entries || ""}"></td>
        <td class="num">${qty(l.unitPrice)}</td>
        <td class="num">${qty(l.total)}</td>
        <td><input class="qty line" data-id="${l.id}" data-f="sorties" value="${l.sorties || ""}"></td>
        <td><input class="qty line" data-id="${l.id}" data-f="pret" value="${l.pret || ""}"></td>
        <td class="num">${money(l.valeur)}</td>
        <td><input class="qty line" data-id="${l.id}" data-f="restes" value="${l.restes || ""}" ${stockUnlocked ? "" : "disabled"}></td>
      </tr>`).join("")}</tbody>
    </table></div>
    <div class="print-only">
      <h1>Feuille de consommation journalière</h1>
      <p>${settings.organization} — ${sh.residence || settings.residence}</p>
      <p>${currentDate} — ${sh.restaurant || settings.restaurant}</p>
      <table><thead><tr><th>N°</th><th>Produit</th><th>Stock</th><th>Entrées</th><th>P.U.</th><th>Total</th><th>Sorties</th><th>Valeur</th><th>Restes</th></tr></thead>
      <tbody>${lines.filter((l) => l.entries || l.sorties || l.stockPrev).map((l) => `<tr><td>${l.number}</td><td class="name">${l.name}</td><td>${qty(l.stockPrev)}</td><td>${qty(l.entries)}</td><td>${qty(l.unitPrice)}</td><td>${qty(l.total)}</td><td>${qty(l.sorties)}</td><td>${money(l.valeur)}</td><td>${qty(l.restes)}</td></tr>`).join("")}</tbody></table>
      <p>${x.moyenne}: ${qty(att.moyenne)} — ${x.valeur}: ${money(tot.valeur)} DA</p>
    </div>
  </div>`;
}

function render() {
  if (!hasSession()) return renderLock();
  if (view === "editor") return renderEditor();
  if (view === "recap") return renderRecap();
  renderHome();
}

function onClick(e) {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act;
  if (act === "lang-fr") setLocale("fr");
  if (act === "lang-ar") setLocale("ar");
  if (act === "lock") { sessionStorage.removeItem(SESSION); localStorage.removeItem(SESSION); view = "home"; render(); }
  if (act === "open-recap") { view = "recap"; render(); }
  if (act === "month") { recapMonth = b.dataset.m; render(); }
  if (act === "recap-move") { recapFilter = "movement"; render(); }
  if (act === "recap-all") { recapFilter = "all"; render(); }
  if (act === "open-today") { currentDate = todayISO(); ensureSheet(currentDate); view = "editor"; render(); }
  if (act === "open") { currentDate = b.dataset.d; view = "editor"; render(); }
  if (act === "home") { view = "home"; render(); }
  if (act === "print") window.print();
  if (act === "del") { if (confirm(t().del + " " + b.dataset.d + " ?")) { delete sheets[b.dataset.d]; saveState(); render(); } }
  if (act === "json-out") {
    const blob = new Blob([JSON.stringify({ products, sheets, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "feuille-consommation.json"; a.click();
  }
}

function bind() {
  document.addEventListener("click", onClick);
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "login") return;
    e.preventDefault();
    const u = $("u").value.trim().toLowerCase();
    const p = $("p").value;
    if (u !== USER || p !== PASS) { $("err").classList.remove("hidden"); $("p").value = ""; return; }
    sessionStorage.setItem(SESSION, "1");
    if ($("r").checked) localStorage.setItem(SESSION, "1");
    render();
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "jsonin" && e.target.files[0]) {
      e.target.files[0].text().then((txt) => {
        const data = JSON.parse(txt);
        const s = data.state || data;
        if (s.products) products = s.products;
        if (s.sheets) sheets = { ...sheets, ...s.sheets };
        if (s.settings) settings = { ...settings, ...s.settings };
        saveState(); render();
      });
    }
    if (e.target.id === "date") { currentDate = e.target.value; ensureSheet(currentDate); render(); }
    if (e.target.id === "unlock") { stockUnlocked = e.target.checked; render(); }
    const line = e.target.closest(".line");
    if (line) {
      const sh = sheets[currentDate];
      const id = line.dataset.id, f = line.dataset.f;
      sh.lines[id] ||= emptyLine(products.find((p) => p.id === id)?.unitPrice);
      if (f === "restes") {
        const c = compute(products.find((p) => p.id === id), sh.lines[id]);
        sh.lines[id].sorties = c.total - (+line.value || 0);
      } else {
        sh.lines[id][f] = +line.value || 0;
      }
      sh.updatedAt = new Date().toISOString();
      saveState(); renderEditor();
      const el = document.querySelector(`.line[data-id="${id}"][data-f="${f}"]`);
      if (el) el.focus();
    }
    const att = e.target.closest(".att");
    if (att) {
      sheets[currentDate].attendance[att.dataset.g][att.dataset.m] = +att.value || 0;
      saveState(); renderEditor();
    }
    if (e.target.dataset.menu) {
      sheets[currentDate].menu[e.target.dataset.menu] = e.target.value;
      saveState();
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "q") query = e.target.value;
    if (e.target.id === "recap-q") recapQuery = e.target.value;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "q") { e.preventDefault(); renderEditor(); }
    if (e.key === "Enter" && e.target.id === "recap-q") { e.preventDefault(); renderRecap(); }
  });
}

const DEFAULT_PRODUCTS = [];

async function boot() {
  document.documentElement.lang = locale === "ar" ? "ar" : "fr";
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  try {
    const res = await fetch("./catalog.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) products = data;
    }
  } catch (e) { /* catalog.json required */ }
  if (!products.length) {
    document.getElementById("app").textContent = "Catalogue introuvable (catalog.json).";
    return;
  }
  loadState();
  bind();
  render();
}
boot().catch((e) => {
  document.getElementById("app").textContent = "Erreur: " + e.message;
});
