# ◈ RN Management Tool

> **Iqbal · Mac 2026 · v2.0**  
> A lightweight, single-file web tool for managing and comparing RN (Reference Number) data across multiple sources.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-7c3aed?style=flat-square)](https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/)

---

## 🚀 Live Demo

Deploy this tool instantly via **GitHub Pages** — no server required.

---

## ✨ Features

| Tab | Feature |
|-----|---------|
| **Dashboard** | Real-time coverage stats, progress bar, per-source breakdown |
| **SQL Helper** | Add/remove SQL quotes — smart duplicate detection (Mac 2026 fix) |
| **RN Compare** | Compare RNs across Master List, PD101, PD301, and JSON Mapping |

### RN Compare Details
- ✅ **Lengkap** — RN present in all 3 sources
- ⚠️ **Separa** — RN present in 1–2 sources only  
- ❌ **Tiada** — RN not found in any source
- 🔴 **Sensitif** — RN contains special characters `_ ( ) . ,`
- Export to **CSV** and **PDF Report**

### SQL Helper (Mac 2026 Update)
- **Add SQL Quotes** — checks for existing quotes before adding (no double-quoting)
- **Remove Formatting** — removes `'` and `"` only; preserves `_ ( ) . ,`

---

## 📁 File Structure

```
your-repo/
└── index.html      ← Single self-contained file (HTML + CSS + JS)
└── README.md
```

> Everything is in **one file** — no build tools, no npm, no config needed.

---

## 🌐 Deploy to GitHub Pages

1. **Fork or create** a new GitHub repository
2. **Upload** `index.html` to the root of the repo
3. Go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch`
5. Choose `main` branch → `/ (root)` → **Save**
6. Your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```

---

## 🛠 Dependencies (CDN — no install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | PDF export |
| [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | 3.5.25 | Table rendering in PDF |
| [Inter](https://fonts.google.com/specimen/Inter) | — | UI font (Google Fonts) |

All loaded via CDN — works offline if cached.

---

## 📋 Usage Guide

### SQL Helper
```
Input:   RN001
         RN002
         'RN003'        ← already quoted, will be kept as-is

Output:  'RN001',
         'RN002',
         'RN003'        ← no double quotes
```

### RN Compare — JSON Mapping Format
```
RN001 | nilai1
RN002 | nilai2
```
Use `|` or `Tab` as separator.

### Master List
- If left empty, the tool will **auto-generate** a master list from all three sources combined.

---

## 👤 Author

**Iqbal** — Internal RN Management Tool  
Last updated: **Mac 2026**

---

*Built with plain HTML, CSS, and JavaScript. No frameworks. No build steps. Just upload and use.*
