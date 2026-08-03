import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, "../src/assets/portfolio");

const files = fs.readdirSync(dir).filter((f) => /\.png$/i.test(f));

for (const f of files) {
  const src = path.join(dir, f);
  const buf = fs.readFileSync(src);
  const meta = await sharp(buf).metadata();
  const base = f.replace(/\.png$/i, "");

  // Skip tiny screenshots — not usable for portfolio
  if ((meta.width ?? 0) < 500 || (meta.height ?? 0) < 500) {
    console.log("skip tiny", f, `${meta.width}x${meta.height}`);
    continue;
  }

  const out = path.join(dir, `${base}.jpg`);
  await sharp(buf)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(out);

  const st = fs.statSync(out);
  const outMeta = await sharp(out).metadata();
  console.log(
    "wrote",
    path.basename(out),
    `${outMeta.width}x${outMeta.height}`,
    `${Math.round(st.size / 1024)}KB`,
  );
  fs.unlinkSync(src);
}

console.log("done");
