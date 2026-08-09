import { readFileSync } from "node:fs";

const src = readFileSync("src/ForgeWeb.jsx", "utf8");
const count = (name) => (src.match(new RegExp(`\\b${name}\\b`, "g")) || []).length;

const icons = src
  .match(/import \{([\s\S]*?)\} from "lucide-react"/)[1]
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const consts = [...src.matchAll(/^const ([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)].map((m) => m[1]);
const fns = [...src.matchAll(/^function ([A-Za-z_][A-Za-z0-9_]*)/gm)].map((m) => m[1]);
const cFields = [
  ...src.match(/^const C = \{([\s\S]*?)^\};/m)[1].matchAll(/^\s*([a-zA-Z]+):/gm),
].map((m) => m[1]);

const report = (label, names, min = 2) => {
  const unused = names.filter((n) => count(n) < min);
  console.log(`${label.padEnd(22)}: ${unused.length ? unused.join(", ") : "none"}`);
};

report("unused icons", icons);
report("unused top-level consts", consts);
report("unused functions", fns);
console.log(
  `unused C.* fields     : ${
    cFields.filter((f) => !new RegExp(`C\\.${f}\\b`).test(src)).join(", ") || "none"
  }`
);

// Tailwind classes referencing colours outside the declared palette.
const palette = ["0B0E14","0E121B","121620","232A3A","39445C","F1EFE6","8791A6","7A85A0","5D6579","E8A63E","3FDDB0","5CE8C1","FF9B8A","FF5F57","FEBC2E","28C840"];
const hexes = [...new Set([...src.matchAll(/#([0-9A-Fa-f]{6})/g)].map((m) => m[1].toUpperCase()))];
console.log(`off-palette hexes     : ${hexes.filter((h) => !palette.includes(h)).join(", ") || "none"}`);
console.log(`lines                 : ${src.split("\n").length}`);
