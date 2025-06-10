import { generatePDF } from './pdfGenerator.js';

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, content: reader.result });
    reader.onerror = reject;
    reader.readAsText(file);
  });
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
    status.textContent = 'Please select at least one file.';
    button.disabled = false;
    button.classList.remove('loading');
    return;
  }

  status.textContent = 'Processing files...';

  try {
    const imageFiles = [];
    const codeFiles = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) imageFiles.push(file);
      else codeFiles.push(file);
    });

    const base64Images = await Promise.all(imageFiles.map(toBase64));
    const codeContents = await Promise.all(codeFiles.map(readTextFile));

    const description = await sendToGPT(base64Images, codeContents);

    if (!description) {
      status.textContent = 'Error generating description (empty response).';
      return;
    }

    status.textContent = 'Description generated! Creating PDF...';

    const blob = await generatePDF(description, base64Images);
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'output.pdf';
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

async function sendToGPT(base64Images = [], codeContents = []) {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error("API key not found. Please set it in localStorage as 'openai_api_key'.");
  }

  const inputs = [];

  if (codeContents.length > 0) {
    inputs.push({
      type: 'text',
      text: `The following files are source code snippets (Java, C#, etc). Analyze each one and provide a summary with:
- Purpose of the class
- Main methods and data structures
- Suggested mapping to OutSystems entities or logic
- Potential roles or permissions related to the class`
    });

    codeContents.forEach(file => {
      inputs.push({
        type: 'text',
        text: `### File: ${file.name}\n\n${file.content}`
      });
    });
  }

  if (base64Images.length > 0) {
    inputs.push({
      type: 'text',
      text: `The following images represent the business flow of an application.

Please analyze them and respond using the following structure:

## App Purpose and Overview
(Summarize what the app is for)

## Entities and Attributes
(List entities with attributes like: EntityName: Attribute1, Attribute2, ...)

## Roles and Permissions
(Define roles and their access to data/screens)

## Workflow States
(Identify any process steps or statuses involved)
- Suggested mapping to OutSystems entities or logic

## Functional Requirements
(Summarize key features and behaviors, especially those related to UI, integrations, and automation)

If some information is not clear from the image, try to infer based on typical enterprise app logic. Be concise and avoid code or UI design suggestions.`
    });

    inputs.push(...base64Images.map(img => ({
      type: 'image_url',
      image_url: { url: `data:image/png;base64,${img}` }
    })));
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a system analyst helping generate documentation and technical mappings based on user inputs (images or source code).'
    },
    {
      role: 'user',
      content: inputs
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