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
    status.textContent = 'Please select at least one image.';
    button.disabled = false;
    button.classList.remove('loading');
    return;
  }

  status.textContent = 'Processing images...';

  try {
    let base64Images = [];
    try {
      base64Images = await toBase64All(files);
    } catch (err) {
      status.textContent = 'Failed to convert images to base64.';
      console.error('Erro na conversão de base64:', err);
      return;
    }

    if (!base64Images.length) {
      status.textContent = 'No images were processed.';
      return;
    }

    console.log('Base64 convertido:', base64Images);
    const description = await sendToGPT(base64Images);

    if (!description) {
      status.textContent = 'Error generating description (empty response).';
      return;
    }

    status.textContent = 'Description generated! Creating PDF...';

    //const blob = await generatePDF(description);
    const blob = await generatePDF(description, base64Images);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'descricao.pdf';
    downloadLink.textContent = 'Click here to download';
    downloadLink.style.display = 'block';

    status.textContent = 'Done!';
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    console.error(err);
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
});

async function sendToGPT(base64Images) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error("API key not found. Please set it in localStorage as 'openai_api_key'.");
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
          text: `The following image represents the business flow of an application.

Please analyze it and respond using the following structure:

## App Purpose and Overview
(Summarize what the app is for)

## Entities and Attributes
(List entities with attributes like: EntityName: Attribute1, Attribute2, ...)

## Roles and Permissions
(Define roles and their access to data/screens)

## Workflow States
(Identify any process steps or statuses involved)

## Functional Requirements
(Summarize key features and behaviors, especially those related to UI, integrations, and automation)

If some information is not clear from the image, try to infer based on typical enterprise app logic. Be concise and avoid code or UI design suggestions.`
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
    throw new Error(`Error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}