---
paths:
  - "lib/files/**"
  - "server_actions/**"
  - "app/api/**"
---

# File Uploads

- `lib/files/upload.ts` handles S3-compatible uploads to Supabase storage. All upload and delete paths go through it, never the S3 client directly from a route or action.
- `uploadFile(buffer, fileName)` compresses the image and converts it to WebP via `sharp`, then returns the public URL (extension changed to `.webp`).
- `deleteFile(fileUrl)` removes a file by its public URL.
- Uploads happen server-side only (route handler or server action). Never expose storage credentials to the client.
