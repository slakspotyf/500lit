const parts = [
  "/assets/gz/excel.00.b64",
  "/assets/gz/excel.01.b64",
  "/assets/gz/excel.02.b64",
  "/assets/gz/excel.03.b64",
  "/assets/gz/excel.04.b64",
  "/assets/gz/excel.05.b64",
  "/assets/gz/excel.06.b64",
  "/assets/gz/excel.07.b64",
  "/assets/gz/excel.08.b64",
  "/assets/gz/excel.09.b64"
];
const b64 = (await Promise.all(parts.map(async (u) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(u + " " + r.status);
  return r.text();
}))).join("");
const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const codeRaw = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
const code = codeRaw
  .replaceAll('from"./index-CyhAqaYv.js"', 'from"/assets/index-CyhAqaYv.js"')
  .replaceAll('from"./routes-CwvBpX5n.js"', 'from"/assets/routes-CwvBpX5n.js"')
  .replaceAll('from"./excel-export-CaV6-6gP.js"', 'from"/assets/excel-export-CaV6-6gP.js"')
  .replaceAll("import(`./excel-export-CaV6-6gP.js`)", "import(`/assets/excel-export-CaV6-6gP.js`)")
  .replaceAll("import(`./routes-CwvBpX5n.js`)", "import(`/assets/routes-CwvBpX5n.js`)")
  .replaceAll("import(`./index-CyhAqaYv.js`)", "import(`/assets/index-CyhAqaYv.js`)");
const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
const m = await import(url);
export const { exportSheetsToExcel } = m;
