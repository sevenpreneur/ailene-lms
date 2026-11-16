const MAX_EDGE = 1920;
const QUALITY = 0.8;

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

// Downscales a photo to at most 1920px and re-encodes it as WebP (JPEG where WebP is unsupported); keeps the original if that is smaller.
export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await encode(canvas, "image/webp");
  if (blob?.type !== "image/webp") blob = await encode(canvas, "image/jpeg");
  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "gambar";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}
