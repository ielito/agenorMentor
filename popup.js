import { generatePDF } from './pdfGenerator.js';

function toBase64All(files) {
  const promises = Array.from(files).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }));
  return Promise.all(promises);
}

document.getElementById('sendToGPT').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const downloadLink = document.getElementById('downloadLink');
  const input = document.getElementById('imageInput');
  const files = input.files;
  const button = document.getElementById('sendToGPT');
  button.disabled = true;
  button.classList.add('loading');

  if (!files.length) {
    status.textContent = 'Por favor, selecione ao menos uma imagem.';
    button.disabled = false;
    button.classList.remove('loading');
    return;
  }

  status.textContent = 'Processando imagens...';

  try {
    let base64Images = [];
    try {
      base64Images = await toBase64All(files);
    } catch (err) {
      status.textContent = 'Erro ao converter imagens para base64.';
      console.error('Erro na conversão de base64:', err);
      return;
    }

    if (!base64Images.length) {
      status.textContent = 'Nenhuma imagem foi processada.';
      return;
    }

    console.log('Base64 convertido:', base64Images);
    const description = await sendToGPT(base64Images);

    if (!description) {
      status.textContent = 'Erro ao gerar descrição (resposta vazia).';
      return;
    }

    status.textContent = 'Descrição gerada! Gerando PDF...';

    //const blob = await generatePDF(description);
    const blob = await generatePDF(description, base64Images);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'descricao.pdf';
    downloadLink.textContent = 'Clique aqui para baixar';
    downloadLink.style.display = 'block';

    status.textContent = 'Pronto!';
  } catch (err) {
    status.textContent = `Erro: ${err.message}`;
    console.error(err);
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
});

async function sendToGPT(base64Images) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error("API key não encontrada. Por favor, defina em localStorage como 'openai_api_key'.");
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a UX and logic analyst for enterprise apps built with OutSystems. Your task is to analyze a series of screens and describe their navigation flow.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `These screenshots represent different steps in a user flow.

Please:
- Identify which screen navigates to which (Screen A → Screen B)
- Detect if parameters are passed (e.g., CustomerId, OrderId)
- Suggest the type of transition (modal, full screen, master-detail)
- Highlight any inconsistencies or redundancies

Structure your answer as:

## Navigation Flow
- Screen A → Screen B (via 'Edit' button)
- Screen B → Screen C (via 'Save', passes CustomerId)

## Observations
- Suggest modal for screen C to avoid full reload
- Data seems reused between A and B

If the screenshots show no clear link, say so.`
        },
        ...base64Images.map(img => ({
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${img}` }
        }))
      ]
    }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}