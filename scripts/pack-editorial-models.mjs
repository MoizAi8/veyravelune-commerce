import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Pass the directory containing the three original Poly Haven glTF sets.");
const output = "public/models";
await mkdir(output, { recursive: true });

function upholstered(u, v) {
  const backWidth = v < 0.53 ? 0.355 - (0.53 - v) * 0.30 : 0.347;
  return (Math.abs(u - 0.36) < backWidth && v > 0.395 && v < 0.635)
    || (u > 0.015 && u < 0.81 && v > 0.818 && v < 0.987)
    || (u > 0.79 && v > 0.035 && v < 0.433);
}

async function texture(input, uri, key) {
  let pixels = sharp(input).resize({ width: 1024, withoutEnlargement: true });
  if (uri.includes("_diff_") && key !== "chandelier") {
    const { data, info } = await pixels.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        if (key === "sofa" && !upholstered(x / info.width, y / info.height)) continue;
        const offset = (y * info.width + x) * 3;
        const luminance = (data[offset] * 0.3 + data[offset + 1] * 0.6 + data[offset + 2] * 0.1) / 255;
        const fiber = Math.sin(x * 2.39 + Math.sin(y * 1.63)) * 2.5;
        const rgb = key === "sofa" ? [14 + luminance * 38, 35 + luminance * 125, 27 + luminance * 91]
          : [13 + luminance * 22, 18 + luminance * 26, 22 + luminance * 31];
        rgb.forEach((channel, index) => { data[offset + index] = Math.round(channel + fiber); });
      }
    }
    pixels = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
  }
  return pixels.jpeg({ quality: uri.includes("_nor_") ? 84 : 85, chromaSubsampling: "4:4:4", mozjpeg: true }).toBuffer();
}

const pad = (length) => (length + 3) & ~3;
function writeChunkHeader(size, type) {
  const chunk = Buffer.alloc(8);
  chunk.writeUInt32LE(size, 0);
  chunk.writeUInt32LE(type, 4);
  return chunk;
}

for (const [key, asset] of Object.entries({ sofa: "sofa_03", vessel: "ceramic_vase_01", chandelier: "Chandelier_02" })) {
  const directory = join(source, asset);
  const model = JSON.parse(await readFile(join(directory, "original.gltf"), "utf8"));
  const original = await readFile(join(directory, model.buffers[0].uri));
  const segments = [original];
  let length = original.length;
  const embedded = new Map();
  for (const image of model.images) {
    if (!embedded.has(image.uri)) {
      const body = await texture(await readFile(join(directory, image.uri)), image.uri, key);
      const offset = pad(length);
      segments.push(Buffer.alloc(offset - length), body);
      embedded.set(image.uri, model.bufferViews.length);
      model.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: body.length });
      length = offset + body.length;
    }
    image.bufferView = embedded.get(image.uri);
    image.mimeType = "image/jpeg";
    delete image.uri;
  }

  if (key === "sofa") {
    model.extensionsUsed = [...(model.extensionsUsed ?? []), "KHR_materials_sheen"];
    model.materials[0].extensions = {
      KHR_materials_sheen: { sheenColorFactor: [0.10, 0.22, 0.15], sheenRoughnessFactor: 0.7 },
    };
    model.materials[0].normalTexture.scale = 0.42;
  }
  if (key === "vessel") {
    model.extensionsUsed = [...(model.extensionsUsed ?? []), "KHR_materials_clearcoat"];
    model.materials[0].extensions = {
      KHR_materials_clearcoat: { clearcoatFactor: 0.9, clearcoatRoughnessFactor: 0.24 },
    };
  }
  if (key === "chandelier") {
    model.materials[1].emissiveFactor = [1, 0.61, 0.29];
  }

  model.buffers = [{ byteLength: pad(length) }];
  model.asset.generator = "VEYRAVELUNE editorial packer / Poly Haven";
  const binary = Buffer.concat([...segments, Buffer.alloc(pad(length) - length)]);
  const json = Buffer.from(JSON.stringify(model));
  const paddedJson = Buffer.concat([json, Buffer.alloc(pad(json.length) - json.length, 32)]);
  const header = Buffer.alloc(12);
  header.write("glTF");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + paddedJson.length + binary.length, 8);
  const file = Buffer.concat([
    header, writeChunkHeader(paddedJson.length, 0x4e4f534a), paddedJson,
    writeChunkHeader(binary.length, 0x004e4942), binary,
  ]);
  await writeFile(join(output, key + ".glb"), file);
}
await copyFile(join(source, "studio_small_09", "studio.hdr"), join(output, "studio.hdr"));
