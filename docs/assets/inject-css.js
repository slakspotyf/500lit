const parts = ["/assets/gz/css.00.b64"];
const b64 = (await Promise.all(parts.map(async (u) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(u + " " + r.status);
  return r.text();
}))).join("");
const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const css = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
