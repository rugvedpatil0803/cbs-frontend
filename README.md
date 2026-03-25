# 📦 CBS Frontend

A modern web application frontend built with **React 19 + TypeScript + Vite**, featuring routing, HTTP communication, UI feedback, and Tailwind CSS styling.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.4 | UI library |
| TypeScript | ~5.9.3 | Type-safe JavaScript |
| Vite | ^8.0.1 | Build tool & dev server |
| Tailwind CSS | ^3.4.14 | Utility-first styling |
| React Router DOM | ^7.13.2 | Client-side routing |
| Axios | ^1.13.6 | HTTP requests |
| React Icons | ^5.6.0 | Icon library |
| SweetAlert2 | ^11.26.24 | Popup/alert dialogs |
| CryptoJS | ^4.2.0 | Encryption utilities |

---

## 🚀 Getting Started

### Prerequisites

Make sure **Node.js (LTS)** and **npm** are installed:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm -y

# Verify
node -v
npm -v
```

### Installation

```bash
# Clone the repo
git clone https://github.com/rugvedpatil0803/cbs-frontend.git
cd cbs-frontend

# Install dependencies
npm install
```

### Running the App

```bash
npm run dev
```

App runs at: **http://localhost:3000**

---

## 💡 Available Scripts

```bash
npm run dev        # Start Vite development server
npm run build      # Type-check + production build → /dist
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## 📁 Project Structure

```
cbs-frontend/
├── public/              # Static assets
├── src/                 # Application source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level pages
│   └── ...
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.app.json    # App TypeScript config
└── package.json         # Dependencies & scripts
```

---

## ⚙️ Environment Variables

The project uses an `env` file for configuration. Copy and update it before running:

```bash
cp env .env
# Edit .env with your values
```

---

## 🔧 Configuration Notes

- **React Compiler** is enabled via `babel-plugin-react-compiler` — may affect dev/build performance
- **Tailwind CSS** is configured with PostCSS via `postcss.config.js`
- **ESLint** is set up with React Hooks and React Refresh plugins

---

## 📦 Build for Production

```bash
npm run build
```

Output is in the `/dist` folder. Preview it with:

```bash
npm run preview
```

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
[github.com/rugvedpatil0803](https://github.com/rugvedpatil0803)
