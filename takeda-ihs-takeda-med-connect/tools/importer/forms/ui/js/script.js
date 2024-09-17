/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-undef */

const FORM_IMPORTER = 'https://g7ory75qdb.execute-api.ap-south-1.amazonaws.com/vega-services/importer';

const scanFormEl = document.querySelector('form');
const domainEl = document.querySelector('#domainURL');
const includePlainText = document.querySelector('#includePlainText');
const startBtn = document.querySelector('#startBtn');
const copyAction = document.querySelector('#copyAction');
const msgEl = document.querySelector('#msg');
const switchView = document.querySelector('#switchView');
const cardsContainer = document.getElementById('cards-container');
const formPreview = document.querySelector('.form-preview');
const jsonPreview = document.querySelector('.json-preview');
let forms = [];
let editor;
let article;
let selectedForm;

function convertToCSV(fields, divider = '\t') {
  if (fields && fields.length > 0) {
    const keys = Object.keys(fields?.[0]);
    const th = keys.join(divider);
    const rows = fields
      .map((field) => Object.values(field).join(divider))
      .join('\n');
    return `${th}\n${rows}`;
  }
  return 'table is empty';
}

function updateStatus(msg, completed = false, error = false) {
  startBtn.disabled = !completed;
  msgEl.textContent = msg;
  if (error) {
    msgEl.classList.add('error');
  } else {
    msgEl.classList.remove('error');
  }
}

function cleanUp() {
  cardsContainer.innerHTML = '';
}

function cardTemplate(form, index) {
  return `<article class="card" data-name="${form.name}" data-index="${index}">
                <div class="card-header">
                    <h5 class="card-header-title">${form.name}</h5>
                    <div class="features">
                        ${form?.stats?.attachmentsUsed ? '<span title="Attachments found in form." class="icon attachment-icon"></span>' : ''}
                        ${form?.stats?.recaptchaUsed ? '<span title="Google reCaptcha found in form." class="icon recaptcha-icon"></span>' : ''}
                        ${form?.stats?.isMarketToForm ? '<span title="Its a Marketo Form" class="icon marketo-icon"></span>' : ''}
                    </div>
                </div>
                <div class="card-content">
                    <div class="follow-info">
                        <h2><div><span> ${form?.stats?.fields || 0}</span><small>Fields</small></div></h2>
                        <h2><div><span>${form?.stats?.hiddenFields || 0}</span><small>Hidden Fields</small></div></h2>
                    </div>
                </div>
                <footer class="card-footer">
                </footer>
            </article>`;
}

function renderCards() {
  cleanUp();
  const formCards = forms.map(cardTemplate).join('');
  cardsContainer.innerHTML += formCards;
}

function loadForm(index) {
  const formEl = document.createElement('form');
  selectedForm = forms[index];
  generateFormRendition(selectedForm?.data, formEl);
  formPreview.replaceChildren(formEl);
  // Set JSON data to the editor
  editor.session.setValue(JSON.stringify(selectedForm, null, 2));
  copyAction.disabled = false;
}
async function previewForm(event) {
  if (article) {
    article.classList.toggle('selected');
  }
  article = event?.target?.closest('article');
  if (article) {
    article.classList.toggle('selected');
    const { index } = article.dataset;
    loadForm(index);
  }
}

function setupJSONView() {
  editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/json');
}

async function scanNow() {
  const valid = scanFormEl.checkValidity();
  if (valid) {
    cleanUp();
    updateStatus('Scan Initiated...');
    const domain = domainEl.value;
    const payload = { url: domain, options: { includePlainText: includePlainText.checked } };
    try {
      const response = await fetch(FORM_IMPORTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        forms = await response.json();
        renderCards(forms);
        updateStatus('Scanning Completed', true, false);
      } else {
        const msg = await response.text();
        updateStatus(`Failed to scan ${msg}`, true, true);
      }
    } catch (e) {
      updateStatus(e.message, true, true);
    }
    startBtn.disabled = false;
  }
}

function copyToClipboard() {
  if (selectedForm) {
    const data = convertToCSV(selectedForm.data);
    navigator.clipboard.writeText(data).then(() => {
      // eslint-disable-next-line no-alert
      alert('Copied to clipboard');
    })
      .catch(() => {
      // eslint-disable-next-line no-alert
        alert('Issue in copying to clipboard use json view');
      });
  }
}

copyAction.addEventListener('click', copyToClipboard);
startBtn.addEventListener('click', scanNow);
cardsContainer.addEventListener('click', previewForm);
switchView.addEventListener('click', () => {
  formPreview.classList.toggle('hide');
  jsonPreview.classList.toggle('hide');
});
setupJSONView();
