# 🧠 Agenor Mentor — GPT Image Describer Chrome Extension

This Chrome Extension transforms **screenshots of system flows** into **structured requirement documents** optimized for OutSystems AI Mentor (App Generator).

---

## 🚀 Features

- 📸 Upload **one or more screenshots** (e.g., user flows, wireframes)
- 🧠 GPT analyzes and generates:
  - App Purpose & Overview
  - Entities and Attributes
  - Roles and Permissions
  - Workflow States
  - Functional Requirements
- 🧾 Downloadable PDF includes both:
  - Structured GPT output
  - The original screenshots (each on a separate page)
- 💡 Follows the best practices for prompt-based generation via Mentor
- 🔐 API Key stored securely via `localStorage`
- 🧩 Fully client-side — no backend or server required

---

## 🛠️ How to Use

### 1. Load the extension locally

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **“Load unpacked”**
4. Select the folder where this project lives

---

### 2. Set your OpenAI API Key

1. Get your key from [OpenAI platform](https://platform.openai.com/account/api-keys)
2. Open DevTools Console inside the popup
3. Set your key:

```js
localStorage.setItem('openai_api_key', 'sk-...');
```

---

### 3. Generate your document

1. Upload one or more screenshots
2. Click **Analyze Screens**
3. Wait for the GPT-powered response
4. Download the PDF file

---

## 📂 Project Structure

```
aiplugin/
├── popup.html              # UI layout and styles
├── popup.js                # Logic for GPT flow + PDF generation
├── pdfGenerator.js         # Builds PDF with description + images
├── libs/
│   └── jspdf.umd.min.js    # PDF library
├── manifest.json           # Chrome extension config
└── icon.png                # Extension icon
```

---

## 🤝 Contributing

Pull requests are welcome — especially if you're into prompt engineering, UI/UX or AI integrations. Let’s improve Mentor-powered dev together 🚀

---

## 📄 License

MIT © Rafael Ielo