import { adminFetch } from "../adminApi"
import { downscaleImageFileIfNeeded } from "../../utils/downscaleImageFile"

/** Uploads an image to `POST /api/admin/cms-media` and returns the public URL string. */
export async function uploadCmsImage(file: File): Promise<string> {
  const prepared = await downscaleImageFileIfNeeded(file)
  const fd = new FormData()
  fd.append("file", prepared)
  const res = await adminFetch("/api/admin/cms-media", {
    method: "POST",
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: string }).message) : "Upload failed"
    throw new Error(msg)
  }
  const data = (await res.json()) as { url: string }
  return data.url
}
