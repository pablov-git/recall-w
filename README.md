# 🧠 Recard

A flashcard study app built with **React, TypeScript, Tailwind CSS, and Vite**.

This project lets users load custom flashcard lists, review cards in normal mode, and optionally enable spaced repetition using the **FSRS algorithm**.

The app works without a backend. Lists, progress, and spaced repetition data are stored locally in the browser with **IndexedDB**. Users can also export their data to a JSON file and import it again later.

---

## 🧰 Technologies Used

* React
* TypeScript
* Vite
* Tailwind CSS
* Dexie
* IndexedDB
* ts-fsrs
* pnpm

---

## ✨ Features

* Flashcard study interface
* File import for `.csv`, `.txt`, and `.tsv` lists
* Support for multiple separators: `;`, `=`, tab, comma, and `|`
* Custom column names from the first line of the file
* Multiple saved lists
* Switch between both card sides
* Normal review mode with known / unknown answers
* Failed card review
* Optional spaced repetition mode
* FSRS-based scheduling with four ratings: Otra vez, Difícil, Bien, Fácil
* Local data persistence using IndexedDB
* Data export to JSON
* Data import from JSON with replacement warning
* Default German vocabulary list included for demo purposes
* Responsive interface built with Tailwind CSS

---

## 📂 Project Structure

| File / Folder               | Description                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `index.html`                | Main HTML entry point and page metadata                                                               |
| `src/main.tsx`              | React application entry point                                                                         |
| `src/App.tsx`               | Main app layout and component composition                                                             |
| `src/index.css`             | Tailwind imports, theme tokens, global styles, and flashcard animations                               |
| `src/components/`           | Reusable UI components such as header, upload panel, flashcard, controls, and answer buttons          |
| `src/hooks/useRecall.ts`    | Main application logic, review flow, list handling, FSRS actions, import/export, and state management |
| `src/utils/flashcards.ts`   | Flashcard parsing, list normalization, ID creation, and initial state helpers                         |
| `src/utils/srs.ts`          | FSRS scheduling helpers using `ts-fsrs`                                                               |
| `src/utils/importExport.ts` | JSON export and import logic                                                                          |
| `src/storage/db.ts`         | IndexedDB setup and persistence logic using Dexie                                                     |
| `src/data/defaultLists.ts`  | Default German vocabulary list loaded on first use                                                    |
| `src/types.ts`              | Shared TypeScript types used across the app                                                           |

---

## ⚙️ How to Run Locally

1. Clone this repository:

   ```bash
   git clone link
   ```

2. Navigate into the project directory:

   ```bash
   cd recard
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open the local URL shown in the terminal, usually:

   ```bash
   http://localhost:5173
   ```

---

## 📄 Flashcard File Format

The first line is used as the column names.

Recommended format:

```txt
es;de
casa;Haus
perro;Hund
gato;Katze
buenos días;Guten Morgen
```

Other valid separators are also supported:

```txt
pregunta=respuesta
casa=Haus
perro=Hund
gato=Katze
```

---

## 💾 Data Storage

The app stores data locally in the browser using **IndexedDB**.

This includes:

* Uploaded lists
* Current selected list
* Card progress
* Normal review status
* FSRS spaced repetition scheduling data
* User settings

No backend or user account is required.

Users can export all their data to a JSON file and import it again later. Importing data replaces the current local data after a confirmation warning.

---

## 🚀 Deployment

The project is live at:
👉 https://recard.vercel.app/

---

## ✒️ Created by
Pablo Vacas Macarro
