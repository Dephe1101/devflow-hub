# ☁️ DevFlow Hub — Cloud Infrastructure & Environment Guide (Solo Dev Workflow)

Vì bạn làm việc độc lập (solo developer), quy trình tối ưu nhất lúc này là: **Đẩy toàn bộ source code lên GitHub → Kết nối GitHub với Vercel & Railway để tự động Deploy → Cấu hình biến môi trường trên Cloud → Kéo biến môi trường về máy Local để code và test.**

Dưới đây là các bước chi tiết để setup hoàn thiện cơ sở hạ tầng.

---

## 0. Đẩy Code Lên GitHub

Đảm bảo bạn đã commit toàn bộ code ở Phase 0 và đẩy lên một kho lưu trữ (repository) trên GitHub.

```bash
git add .
git commit -m "chore: complete phase 0 setup"
git branch -M main
git remote add origin https://github.com/<username>/devflow-hub.git
git push -u origin main
```

---

## 1. Triển Khai Web App Lên Vercel (Frontend Next.js)

**Bước 1: Import Project vào Vercel**

- Đăng nhập vào [Vercel Dashboard](https://vercel.com/).
- Bấm **Add New...** -> **Project**.
- Chọn Import từ repository `devflow-hub` trên GitHub của bạn.
- Ở mục **Framework Preset**, chọn `Next.js`.
- Ở mục **Root Directory**, bấm Edit và chọn thư mục `apps/web`.

**Bước 2: Cấu Hình Biến Môi Trường (Vercel)**
Trong lúc setup (hoặc sau khi tạo xong vào Settings -> Environment Variables), thêm:

- `NEXT_PUBLIC_API_URL`: (Tạm thời để trống hoặc điền domain railway của API nếu có).
- `NEXT_PUBLIC_WS_URL`: (Tạm thời để trống).
- Bấm **Deploy**.

**Bước 3: Kéo Env Về Local Để Code**
Quay lại Terminal trên máy tính, kéo các biến môi trường này về để dev:

```bash
cd apps/web
vercel login
vercel link # Chọn đúng project vừa tạo trên web
vercel env pull .env.local
```

---

## 2. Triển Khai API Server Lên Railway (Backend & Services)

**Bước 1: Khởi Tạo Các Dịch Vụ Data Layer (Railway)**

- Đăng nhập vào [Railway Dashboard](https://railway.app/).
- Tạo một Project mới (Empty Project).
- Trong Project, nhấn **New** -> **Database** -> **Add PostgreSQL**.
- Tiếp tục nhấn **New** -> **Database** -> **Add Redis**.
- Tiếp tục nhấn **New** -> **Service** -> **Empty Service** (Đổi tên thành `Meilisearch`, Settings -> cấu hình Docker Image là `getmeili/meilisearch:v1.x`).

**Bước 2: Triển Khai NestJS API**

- Nhấn **New** -> **GitHub Repo** -> Chọn repo `devflow-hub` của bạn.
- Trong phần cấu hình của service vừa tạo:
  - **Root Directory**: Nhập `/apps/api`.
  - **Build Command**: Nhập `pnpm run build`.
  - **Start Command**: Nhập `pnpm run start:prod`.

**Bước 3: Cấu Hình Biến Môi Trường (Railway)**
Vào mục **Variables** của service API trên Railway và điền:

| Biến Môi Trường      | Ý nghĩa                      | Giá trị mẫu (Lấy từ các service DB)                                        |
| :------------------- | :--------------------------- | :------------------------------------------------------------------------- |
| `PORT`               | Cổng chạy HTTP Server        | `3000`                                                                     |
| `DATABASE_URL`       | Kết nối PostgreSQL           | Kế thừa từ biến `DATABASE_URL` của service PostgreSQL                      |
| `REDIS_URL`          | Kết nối Redis                | Kế thừa từ biến `REDIS_URL` của service Redis                              |
| `MEILI_HOST`         | Kết nối Meilisearch          | `http://meilisearch.railway.internal:7700`                                 |
| `MEILI_MASTER_KEY`   | Khóa bảo mật Meilisearch     | `your_secure_master_key`                                                   |
| `JWT_SECRET`         | Secret key cho Access Token  | `tao_mot_chuoi_ngau_nhien_dai_o_day`                                       |
| `JWT_REFRESH_SECRET` | Secret key cho Refresh Token | `tao_mot_chuoi_ngau_nhien_khac_o_day`                                      |
| `CORS_ORIGIN`        | Domain được phép gọi API     | URL của Vercel sinh ra ở Bước 1 (vd: `https://devflow-hub-web.vercel.app`) |

**Bước 4: Kéo Env Về Local Để Code**
Đứng tại thư mục `apps/api` trên máy tính:

```bash
cd ../api
railway login
railway link # Chọn project trên Railway
railway variables > .env
```

_(Nếu làm việc local, hãy thay thế các host nội bộ của Railway bằng đường dẫn Public TCP connection nếu bạn muốn connect trực tiếp từ máy local lên DB Cloud)._

---

## 3. Khởi Tạo Cơ Sở Dữ Liệu Lần Đầu (Local → Cloud DB)

Sau khi kéo file `.env` chứa `DATABASE_URL` của Railway về máy tính tại thư mục `apps/api`, hãy chạy lệnh sau để push Schema của Prisma lên database Cloud:

```bash
# Đứng tại thư mục gốc của monorepo
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma db push
```

🎉 _Hoàn thành! Kể từ lúc này, bạn chỉ cần gõ code ở máy local, kiểm tra bằng `pnpm run dev`. Khi mọi thứ đã hoàn hảo, chỉ việc `git push` lên GitHub, Vercel và Railway sẽ tự động lo phần còn lại!_
