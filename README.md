# 🧠 Agenor Mentor — GPT Image Describer Chrome Extension

This Chrome Extension transforms **screenshots of legacy systems** (e.g. Oracle Forms, SAP, internal tools) into **structured technical documentation** using OpenAI GPT-4o.

---

## 🚀 Features

- 📸 Upload **one or more screenshots** of system interfaces
- 🧠 GPT analyzes:
  - Navigation flow between screens
  - Functional Requirements
  - Non-Functional Requirements
- 🧾 Generates a downloadable PDF document with:
  - GPT’s structured response
  - The original images included
- 🔐 API Key securely stored via `chrome.storage`
- 🧩 Fully client-side, no backend required

---

## 🛠️ How to Use

### 1. Load the extension locally

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **“Load unpacked”**
4. Select the extension folder (`aiplugin`)

---

### 2. Configure your OpenAI API Key

1. Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Create a new key (must support `gpt-4o`)
3. Open the extension in Chrome
4. Paste the key in the `API Key` field and click **Save Key** (if UI available)  
   Or use DevTools console:

```js
localStorage.setItem('openai_api_key', 'sk-...');
```

---

### 3. Generate your documentation

1. Select **one or more screenshots**
2. Click **Generate Description**
3. GPT analyzes the image(s) and generates:
   - Textual description with flow and requirements
   - PDF containing both text and screenshots
4. Click **Download File**

---

## 🔐 Security

- The OpenAI key is **not hardcoded**
- It is securely stored via `chrome.storage.local`

---

## 📂 Project Structure

```
aiplugin/
├── popup.html              # User interface with style and animation
├── popup.js                # Handles multiple image input, GPT calls, and PDF generation
├── pdfGenerator.js         # Creates multipage PDF (text + screenshots)
├── libs/
│   └── jspdf.umd.min.js    # PDF library
├── manifest.json           # Chrome extension config
└── icon.png                # Extension icon
```

---

## 📦 Roadmap

- [ ] Export `.txt` option
- [ ] Response history
- [ ] Autofill descriptions into page fields
- [ ] Auto-upload to target platform
- [ ] Prompt selector and model configuration

---

## 🤝 Contributing

Pull requests are welcome!  
Got ideas? Open an issue or ping me over coffee ☕.

---

## 📄 License

MIT © Rafael Ielo