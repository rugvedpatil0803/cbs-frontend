# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


# 📦 CBS Frontend (React + Vite)

This project is built using **React + TypeScript + Vite**.

---

## 🚀 Prerequisites

Make sure the following are installed on your Linux machine:

### 1. Install Node.js (LTS)

```bash
sudo apt update
sudo apt install nodejs npm -y
```

### 2. Verify installation

```bash
node -v
npm -v
```

---

## ⚡ About Vite

* Vite is used as the **build tool and development server**
* It is installed automatically via `package.json`
* No separate installation required ❌

---

## 📥 Clone the Repository

```bash
git clone <your-repo-url>
cd cbs-frontend
```

---

## 📦 Install Dependencies (includes Vite)

```bash
npm install
```

👉 This installs:

* React
* Vite
* All required dependencies

---

## ▶️ Run Development Server (Vite)

```bash
npm run dev
```

App will run on:

```text
http://localhost:5173
```

(or `3000` if configured)

---

## ⚙️ Build for Production

```bash
npm run build
```

👉 Vite bundles the app into `/dist`

---

## 🔍 Preview Production Build

```bash
npm run preview
```

---

## 🛠️ Tech Stack

* React
* TypeScript
* Vite

---

## ⚠️ Notes

* Vite runs the dev server (not React directly)
* No global Vite install needed
* If port is busy, Vite auto-switches

---

## 💡 Useful Commands

```bash
npm install        # install dependencies (including Vite)
npm run dev        # start Vite dev server
npm run build      # build project using Vite
npm run preview    # preview production build
```

---

## 👨‍💻 Author

Rugved Patil
