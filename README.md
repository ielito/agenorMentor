# 🧠 Agenor Mentor — GPT File & Screenshot Analyzer Chrome Extension

This Chrome Extension transforms **screenshots of system flows** and **source code files** into **structured requirement documents** optimized for OutSystems AI Mentor (App Generator).

---

## 🚀 Features

- 📸 Upload **screenshots** (e.g., user flows, wireframes)
- 🧾 Upload **source code files** (.cs, .java, .ts, .json, .xml)
- 🧠 GPT analyzes and generates:
  - App Purpose & Overview
  - Entities and Attributes
  - Roles and Permissions
  - Workflow States
  - Functional Requirements
  - Class responsibilities (when code files are provided)
- 📄 Generates a PDF including:
  - Structured GPT output
  - Uploaded screenshots
- 💡 Follows OutSystems AI Mentor prompt best practices
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

1. Upload one or more files (images and/or source code)
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

### 📎 Supported Upload Formats

- Images: `.png`, `.jpg`, `.jpeg`
- Code: `.cs`, `.java`, `.ts`, `.json`, `.xml`, `.txt`

---

## 🤝 Contributing

Pull requests are welcome 🚀

---

## 📄 License

MIT © Rafael Ielo