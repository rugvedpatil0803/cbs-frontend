# 💻 CBS Frontend

A **Coach Booking System (CBS) Frontend** built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. It communicates with the [CBS Backend](https://github.com/rugvedpatil0803/cbs-backend) REST API via Axios.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| TypeScript | ~5.9.3 | Type-safe JavaScript |
| Vite | 8.0.1 | Build tool & dev server |
| Tailwind CSS | 3.4.14 | Utility-first styling |
| Axios | 1.13.6 | HTTP client for API calls |
| React Router DOM | 7.13.2 | Client-side routing |
| React Icons | 5.6.0 | Icon library |
| SweetAlert2 | 11.26.24 | Alerts & dialogs |
| crypto-js | 4.2.0 | Client-side encryption utilities |

---

## 📁 Project Structure

```
cbs-frontend/
├── public/               # Static assets
├── src/                  # Application source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── services/         # Axios API service calls
│   └── main.tsx          # App entry point
├── index.html            # HTML shell
├── env                   # Environment variable template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

- **Node.js** (LTS recommended) — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

```bash
# Verify installation
node -v
npm -v
```

> Vite is bundled via `package.json` — no global install needed.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rugvedpatil0803/cbs-frontend.git
cd cbs-frontend
```

### 2. Configure Environment Variables

Create a `.env` file in the project root based on the `env` template:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

App will be available at:

```
http://localhost:5173
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🏗️ Build for Production

```bash
npm run build
```

The optimized output will be in the `/dist` folder. You can serve it with:

```bash
npm run preview
```

---

## 🔗 Backend API

This frontend connects to the **CBS Backend** running at `http://localhost:8080`.

Make sure the backend is running before starting the frontend. See the backend repo for setup instructions:

👉 [cbs-backend](https://github.com/rugvedpatil0803/cbs-backend)

---

## 🔐 Authentication Flow

1. User logs in via the login page.
2. The backend returns a **JWT token**.
3. The token is stored client-side and attached to all subsequent API requests via Axios interceptors.
4. Protected routes redirect unauthenticated users to the login page.

---


<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-19-50" src="https://github.com/user-attachments/assets/57f89a5a-092b-4c61-800a-04863cf80147" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-20-01" src="https://github.com/user-attachments/assets/cd634a0e-7692-4c24-b691-72d3b02f430e" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-09-08" src="https://github.com/user-attachments/assets/862a9dba-ff14-4ae0-b928-276554beae4a" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-09-27" src="https://github.com/user-attachments/assets/10a6c831-2cd1-4f89-9584-769f2c4dcfd7" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-08-00" src="https://github.com/user-attachments/assets/8eb4ebe9-2206-44f4-ad93-48ed630fbe27" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-09-44" src="https://github.com/user-attachments/assets/5cd241ef-dc64-4bbc-a9d5-86d695bf238a" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-10-32" src="https://github.com/user-attachments/assets/86895d42-8087-4e58-8396-b632099426f3" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-10-52" src="https://github.com/user-attachments/assets/38a80d72-83a7-4648-90bd-38879ffcd51d" />

<img width="1920" height="970" alt="Screenshot from 2026-03-25 23-11-12" src="https://github.com/user-attachments/assets/31fa4dc8-7ac3-415c-bdb7-3208dbd4a500" />




## 👨‍💻 Author

**Rugved Patil**
- GitHub: [@rugvedpatil0803](https://github.com/rugvedpatil0803)
