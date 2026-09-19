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
    days: "Journées",
    newSheet: "Nouvelle feuille",
    lock: "Verrouiller",
    open: "Ouvrir",
    del: "Supprimer",
    back: "Retour",
    save: "Enregistré",
    entries: "Entrées",
    sorties: "Consommation",
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
let tab = "recap";
let recapMonth = "";
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
  const payload = { state: { products, sheets, settings, currentDate }, version: 1 };
  localStorage.setItem(STORAGE, JSON.stringify(payload));
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
  const months = {};
  for (const d of dates) (months[monthKey(d)] ||= []).push(sheets[d]);
  const monthList = Object.keys(months).sort().reverse();
  if (!recapMonth || !months[recapMonth]) recapMonth = monthList[0] || todayISO().slice(0, 7);
  const recapDays = months[recapMonth] || [];
  const recapRows = products.map((p) => {
    let entries = 0, sorties = 0, valeur = 0, restes = 0;
    recapDays.forEach((day, i) => {
      const line = compute(p, day.lines[p.id]);
      entries += line.entries; sorties += line.sorties; valeur += line.valeur; restes = line.restes;
    });
    return { p, entries, sorties, valeur, restes };
  }).filter((r) => r.entries || r.sorties);
  const tot = recapRows.reduce((a, r) => ({ entries: a.entries + r.entries, sorties: a.sorties + r.sorties, valeur: a.valeur + r.valeur }), { entries: 0, sorties: 0, valeur: 0 });

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
    <div class="tabs no-print">
      <button class="${tab === "recap" ? "on" : ""}" data-act="tab-recap">${x.recap}</button>
      <button class="${tab === "days" ? "on" : ""}" data-act="tab-days">${x.days}</button>
    </div>
    ${tab === "recap" ? `
      <section class="card">
        <h2>${x.recap}</h2>
        <div class="month-btns">${monthList.map((m) => `<button class="btn ${m === recapMonth ? "primary" : ""}" data-act="month" data-m="${m}">${monthTitle(m)}</button>`).join("") || ""}</div>
        <div class="cards">
          <article class="card"><span class="muted">${x.entries}</span><b>${qty(tot.entries)}</b></article>
          <article class="card"><span class="muted">${x.sorties}</span><b>${qty(tot.sorties)}</b></article>
          <article class="card"><span class="muted">${x.valeur}</span><b>${money(tot.valeur)} DA</b></article>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>N°</th><th>${x.products}</th><th class="num">${x.entries}</th><th class="num">${x.sorties}</th><th class="num">${x.valeur}</th><th class="num">${x.restes}</th></tr></thead>
          <tbody>${recapRows.map((r) => `<tr><td>${r.p.number}</td><td class="name">${r.p.name}</td><td class="num">${qty(r.entries)}</td><td class="num">${qty(r.sorties)}</td><td class="num">${money(r.valeur)}</td><td class="num">${qty(r.restes)}</td></tr>`).join("") || `<tr><td colspan="6">${x.noDays}</td></tr>`}</tbody>
        </table></div>
      </section>` : `
      <section class="card">
        <div class="row" style="margin-bottom:12px">
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
      </section>`}
  </div>`;
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
  renderHome();
}

function onClick(e) {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act;
  if (act === "lang-fr") setLocale("fr");
  if (act === "lang-ar") setLocale("ar");
  if (act === "lock") { sessionStorage.removeItem(SESSION); localStorage.removeItem(SESSION); view = "home"; render(); }
  if (act === "tab-recap") { tab = "recap"; render(); }
  if (act === "tab-days") { tab = "days"; render(); }
  if (act === "month") { recapMonth = b.dataset.m; render(); }
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
      const f = e.target.files[0];
      f.text().then((txt) => {
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
    if (e.target.id === "q") { query = e.target.value; }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "q") { e.preventDefault(); renderEditor(); }
  });
}

const DEFAULT_PRODUCTS = [{"id":"p01","number":1,"name":"خبز محسن 250 غ","unitPrice":8,"placeholder":false},{"id":"p02","number":2,"name":"هلالـــيات","unitPrice":30,"placeholder":false},{"id":"p03","number":3,"name":"حليب بودرة جاف","unitPrice":1100,"placeholder":false},{"id":"p04","number":4,"name":"ســـــــكــر","unitPrice":90,"placeholder":false},{"id":"p05","number":5,"name":"قهـــــــــوة","unitPrice":1000,"placeholder":false},{"id":"p06","number":6,"name":"مربى","unitPrice":273.7,"placeholder":false},{"id":"p07","number":7,"name":"ميلفاي","unitPrice":40,"placeholder":false},{"id":"p08","number":8,"name":"كروكـــــــــــــي","unitPrice":30,"placeholder":false},{"id":"p09","number":9,"name":"خبز بالشكولاطة","unitPrice":30,"placeholder":false},{"id":"p10","number":10,"name":"مــــــادلان","unitPrice":60,"placeholder":false},{"id":"p11","number":11,"name":"لحـــم العـــــجل","unitPrice":1559,"placeholder":false},{"id":"p12","number":12,"name":"لحم الخروف","unitPrice":2295,"placeholder":false},{"id":"p13","number":14,"name":"دجــــــاج طازج","unitPrice":450,"placeholder":false},{"id":"p14","number":13,"name":"Lait en boit 1 L","unitPrice":120,"placeholder":false},{"id":"p15","number":14,"name":"fromage ميزان","unitPrice":571.2,"placeholder":false},{"id":"p16","number":15,"name":"سمك سردين","unitPrice":1356.6,"placeholder":false},{"id":"p17","number":16,"name":"زلابية","unitPrice":430,"placeholder":false},{"id":"p18","number":17,"name":"قلب اللوز","unitPrice":45,"placeholder":false},{"id":"p19","number":18,"name":"بطاطا مسحوقة","unitPrice":1142.4,"placeholder":false},{"id":"p20","number":19,"name":"فطر معلب","unitPrice":1142.4,"placeholder":false},{"id":"p21","number":20,"name":"بيـــــــــض","unitPrice":16,"placeholder":false},{"id":"p22","number":21,"name":"جبـــــــــن 1/16","unitPrice":218.96,"placeholder":false},{"id":"p23","number":22,"name":"ورق المنيوم","unitPrice":2975,"placeholder":false},{"id":"p24","number":23,"name":"لبن 1 ليتر","unitPrice":74.38,"placeholder":false},{"id":"p25","number":24,"name":"جبن صلب لتبشير","unitPrice":1190,"placeholder":false},{"id":"p26","number":25,"name":"زيــــــــــــــــت","unitPrice":600,"placeholder":false},{"id":"p27","number":26,"name":"خـــــــــــــــل","unitPrice":119,"placeholder":false},{"id":"p28","number":27,"name":"ملح المائدة","unitPrice":47.6,"placeholder":false},{"id":"p29","number":28,"name":"طماطم 4/4","unitPrice":357,"placeholder":false},{"id":"p30","number":29,"name":"عين بقرة","unitPrice":1904,"placeholder":false},{"id":"p31","number":30,"name":"زبيب جاف","unitPrice":1190,"placeholder":false},{"id":"p32","number":31,"name":"توابل","unitPrice":1428,"placeholder":false},{"id":"p33","number":32,"name":"مارغــــــرين","unitPrice":238,"placeholder":false},{"id":"p34","number":33,"name":"رايب","unitPrice":74.38,"placeholder":false},{"id":"p35","number":34,"name":"جلبانة مجمدة","unitPrice":714,"placeholder":false},{"id":"p36","number":35,"name":"أرز","unitPrice":152.6,"placeholder":false},{"id":"p37","number":36,"name":"عدس","unitPrice":272.5,"placeholder":false},{"id":"p38","number":37,"name":"فاصـــــ,لياء","unitPrice":348.8,"placeholder":false},{"id":"p39","number":38,"name":"حمــــــص","unitPrice":403.3,"placeholder":false},{"id":"p40","number":39,"name":"عجائن غذائية","unitPrice":130.8,"placeholder":false},{"id":"p41","number":40,"name":"ماء","unitPrice":17.85,"placeholder":false},{"id":"p42","number":41,"name":"تشيشة فريك","unitPrice":392.4,"placeholder":false},{"id":"p43","number":42,"name":"كــــسكــــس","unitPrice":130.8,"placeholder":false},{"id":"p44","number":43,"name":"شخشوخة","unitPrice":207.1,"placeholder":false},{"id":"p45","number":44,"name":"مشمش جاف","unitPrice":1737.4,"placeholder":false},{"id":"p46","number":45,"name":"ماييس علبة 1 كلغ","unitPrice":618.8,"placeholder":false},{"id":"p47","number":46,"name":"سردين علبة 120 غ","unitPrice":190.4,"placeholder":false},{"id":"p48","number":47,"name":"بودرة الشوكولاطة","unitPrice":654.5,"placeholder":false},{"id":"p49","number":48,"name":"مكعب المرق","unitPrice":17.85,"placeholder":false},{"id":"p50","number":49,"name":"تـــــــــــــــــــــونة","unitPrice":119,"placeholder":false},{"id":"p51","number":50,"name":"بصـــــل","unitPrice":65,"placeholder":false},{"id":"p52","number":51,"name":"لفت منزوع الاوراق","unitPrice":95,"placeholder":false},{"id":"p53","number":52,"name":"ثـــــوم","unitPrice":450,"placeholder":false},{"id":"p54","number":53,"name":"بطــــاطــــــــا","unitPrice":75,"placeholder":false},{"id":"p55","number":54,"name":"سلاطــــــــــة","unitPrice":125,"placeholder":false},{"id":"p56","number":55,"name":"خيـــــــار","unitPrice":120,"placeholder":false},{"id":"p57","number":56,"name":"شمندر منزوع الاوراق","unitPrice":95,"placeholder":false},{"id":"p58","number":57,"name":"بســـــباس","unitPrice":90,"placeholder":false},{"id":"p59","number":58,"name":"قرنبيط","unitPrice":110,"placeholder":false},{"id":"p60","number":59,"name":"طمـــــــــــــاطم حب","unitPrice":110,"placeholder":false},{"id":"p61","number":60,"name":"فلفل  حلو و حار","unitPrice":125,"placeholder":false},{"id":"p62","number":61,"name":"زيتون المائدة","unitPrice":487.9,"placeholder":false},{"id":"p63","number":62,"name":"زيتون  بدون نــــوى","unitPrice":559.3,"placeholder":false},{"id":"p64","number":63,"name":"اعشاب عطرية","unitPrice":400,"placeholder":false},{"id":"p65","number":64,"name":"جــــــــــزر","unitPrice":93,"placeholder":false},{"id":"p66","number":65,"name":"كرم","unitPrice":100,"placeholder":false},{"id":"p67","number":66,"name":"فاصولياء خضراء","unitPrice":240,"placeholder":false},{"id":"p68","number":67,"name":"بيذنجان","unitPrice":100,"placeholder":false},{"id":"p69","number":68,"name":"خرشف","unitPrice":120,"placeholder":false},{"id":"p70","number":69,"name":"جريوات","unitPrice":130,"placeholder":false},{"id":"p71","number":70,"name":"ليمون","unitPrice":150,"placeholder":false},{"id":"p72","number":71,"name":"برتقـــــــــــال","unitPrice":230,"placeholder":false},{"id":"p73","number":72,"name":"مندريــــــن","unitPrice":230,"placeholder":false},{"id":"p74","number":73,"name":"مشمش","unitPrice":260,"placeholder":false},{"id":"p75","number":74,"name":"تفــــــــــــــاح","unitPrice":430,"placeholder":false},{"id":"p76","number":75,"name":"موز","unitPrice":476,"placeholder":false},{"id":"p77","number":76,"name":"تمـــــــر","unitPrice":450,"placeholder":false},{"id":"p78","number":77,"name":"/","unitPrice":0,"placeholder":true},{"id":"p79","number":78,"name":"خوخ","unitPrice":250,"placeholder":false},{"id":"p80","number":79,"name":"ياؤورت معطر","unitPrice":23.8,"placeholder":false},{"id":"p81","number":80,"name":"كرام ديسار","unitPrice":22.43,"placeholder":false},{"id":"p82","number":81,"name":"/","unitPrice":0,"placeholder":true},{"id":"p83","number":82,"name":"عصيـــــــــر","unitPrice":26.18,"placeholder":false},{"id":"p84","number":83,"name":"ياؤورت فرويتي","unitPrice":29.75,"placeholder":false},{"id":"p85","number":84,"name":"زعرور","unitPrice":280,"placeholder":false},{"id":"p86","number":85,"name":"اجاص","unitPrice":450,"placeholder":false},{"id":"p87","number":86,"name":"ورق ديول","unitPrice":130.9,"placeholder":false},{"id":"p88","number":87,"name":"عنب","unitPrice":200,"placeholder":false},{"id":"p89","number":88,"name":"برقوق","unitPrice":300,"placeholder":false},{"id":"p90","number":89,"name":"فرولة","unitPrice":300,"placeholder":false}];
async function boot() {
  document.documentElement.lang = locale === "ar" ? "ar" : "fr";
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  products = DEFAULT_PRODUCTS.slice();
  try {
    const res = await fetch("./catalog.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) products = data;
    }
  } catch (e) { /* bundled catalog */ }
  loadState();
  bind();
  render();
}
boot().catch((e) => {
  document.getElementById("app").textContent = "Erreur: " + e.message;
});
