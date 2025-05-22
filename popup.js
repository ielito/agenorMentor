import { generatePDF } from './pdfGenerator.js';

document.getElementById('sendToGPT').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const downloadLink = document.getElementById('downloadLink');
  const input = document.getElementById('imageInput');
  const file = input.files[0];
  const button = document.getElementById('sendToGPT');
  button.disabled = true;

  if (!file) {
    status.textContent = 'Por favor, selecione uma imagem.';
    button.disabled = false;
    return;
  }

  status.textContent = 'Processando imagem...';

  try {
    const base64 = await toBase64(file);
    const description = await sendToGPT(base64);

    if (!description) {
      status.textContent = 'Erro ao gerar descrição (resposta vazia).';
      button.disabled = false;
      return;
    }

    status.textContent = 'Descrição gerada! Gerando arquivo...';

    const blob = await generatePDF(description);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'descricao.pdf';
    downloadLink.textContent = 'Clique aqui para baixar';
    downloadLink.style.display = 'block';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'uploadFile',
        file: {
          content: description,
          name: 'descricao.pdf',
          type: 'application/pdf'
        }
      });
    });

    status.textContent = 'Pronto!';
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
    console.error(err);
  } finally {
    button.disabled = false;
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function sendToGPT(base64Image) {
const apiKey = localStorage.getItem('openai_api_key');
if (!apiKey) {
  throw new Error("API key não encontrada. Por favor, defina em localStorage como 'openai_api_key'.");
}  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que descreve imagens técnicas de interfaces e sugere funcionalidades.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the interface shown in the image as a business analyst would.

Your task is to produce detailed and structured documentation, based solely on visual cues.

Return a specification in **two main sections**:

1. **Functional Requirements**
   - Identify all fields, inputs, buttons, and data groups.
   - Infer any data models or database tables that are implied (e.g. Customer, Credit, Transaction Categories).
   - Mention any interaction between components (e.g. lookup fields, dynamic values).
   - If an embedded table or Excel snippet is visible, describe its relevance to the screen.

2. **Non-Functional Requirements**
   - Note any visual constraints (layout, fixed columns, scrollable tables).
   - Performance expectations if you infer calculations or aggregations.
   - Possible validations or formatting standards (e.g. numeric fields, required names).

**Important:** Be assertive and granular. Imagine you are describing this for someone who needs to recreate the same form in a modern web system.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}