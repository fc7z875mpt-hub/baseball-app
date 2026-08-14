/** Komprese a zmenšení fotky na klientu (max ~180 KB JPEG) */

export async function compressImage(
  file: File,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number; maxBytes?: number } = {}
): Promise<string> {
  const maxWidth = opts.maxWidth ?? 800;
  const maxHeight = opts.maxHeight ?? 800;
  const quality = opts.quality ?? 0.82;
  const maxBytes = opts.maxBytes ?? 180_000;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas není podporován");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let dataUrl = canvas.toDataURL("image/jpeg", q);

  // Snižovat kvalitu, dokud se vejde
  while (dataUrl.length > maxBytes * 1.37 && q > 0.4) {
    q -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", q);
  }

  // Ještě zmenšit rozměry pokud je pořád velké
  if (dataUrl.length > maxBytes * 1.37) {
    const s = 0.7;
    canvas.width = Math.round(width * s);
    canvas.height = Math.round(height * s);
    ctx.drawImage(await createImageBitmap(file), 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", 0.75);
  }

  return dataUrl;
}
