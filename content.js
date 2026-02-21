// content.js
let panel = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "openAIHelper") {
    showHelperPanel(msg.selectedText);
  }
});

function showHelperPanel(selectedText = "") {
  if (panel) panel.remove();

  panel = document.createElement("div");
  panel.id = "ai-helper-panel";
  panel.style.cssText = `
    position: fixed; top: 80px; right: 20px; width: 420px; max-height: 85vh;
    background: #ffffff; border: 1px solid #ddd; border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25); z-index: 2147483647;
    font-family: system-ui, sans-serif; overflow: hidden; display: flex; flex-direction: column;
  `;

  panel.innerHTML = `
    <div style="padding: 16px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin:0; font-size:18px;">🤖 AI Page Helper</h3>
      <button id="closeBtn" style="font-size:22px; background:none; border:none; cursor:pointer; color:#666;">✕</button>
    </div>
    <div style="padding:20px; flex:1; overflow:auto;">
      <select id="promptSelect" style="width:100%; padding:10px; margin-bottom:12px; border-radius:8px; border:1px solid #ccc; font-size:16px;">
        <option value="summarize">Суммировать максимально коротко</option>
        <option value="explain">Объяснить как 12-летнему</option>
        <option value="rewrite">Переписать красиво и профессионально</option>
        <option value="tweet">Сделать твит-тред (нумерованный, до 10 твитов)</option>
        <option value="critic">Найти ошибки, неточности и предложи улучшения</option>
        <option value="translate_en">Перевести на английский</option>
        <option value="translate_ru">Перевести на русский</option>
        <option value="seo_title">Сгенерировать SEO-заголовок + описание</option>
        <option value="ideas">Сгенерировать 5–7 идей для поста/статьи</option>
        <option value="linkedin">Сделать пост для LinkedIn</option>
        <option value="tg_vk">Сделать пост для Telegram / VK</option>
        <option value="notes">Сделать краткий конспект</option>
        <option value="facts">Выделить ключевые факты и цитаты</option>
        <option value="list_table">Преобразовать в список или таблицу</option>
        <option value="custom">Свой промпт ↓</option>
      </select>

      <textarea id="textArea" style="width:100%; height:120px; padding:12px; border-radius:8px; border:1px solid #ccc; resize:vertical; font-size:16px;">${selectedText}</textarea>

      <!-- Две кнопки в ряд под textarea -->
      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <button id="clearBtn" style="flex: 1; padding:14px; background:#6c757d; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:16px;">
          🗑 Очистить / Новый
        </button>
        <button id="askButton" style="flex: 1; padding:14px; background:#000; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:16px;">
          🚀 Спросить AI
        </button>
      </div>

      <div id="loading" style="display:none; text-align:center; margin:20px 0; color:#666; font-size:16px;">Думаю...</div>
      <div id="result" style="margin-top:16px; padding:14px; background:#f8f9fa; border-radius:8px; white-space:pre-wrap; display:none; font-size:15px; line-height:1.5;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // ─── Обработчики ───
  document.getElementById("closeBtn").onclick = () => panel.remove();

  const select = document.getElementById("promptSelect");
  const textarea = document.getElementById("textArea");
  const askBtn = document.getElementById("askButton");
  const clearBtn = document.getElementById("clearBtn");

  // Смена промпта
  select.onchange = () => {
    if (select.value === "custom") {
      textarea.placeholder = "Введи ЛЮБОЙ свой запрос к AI (без шаблонов)...";
      textarea.focus();
      textarea.select();
    } else {
      textarea.placeholder = "Выделенный текст (можно редактировать)";
    }
  };
  select.onchange();

  // Очистка поля и результата
  clearBtn.onclick = () => {
    textarea.value = "";
    document.getElementById("result").style.display = "none";
    textarea.focus();
  };

  // Запрос к AI
  askBtn.onclick = async () => {
    const userText = textarea.value.trim();

    if (!userText) {
      alert("Напиши хоть что-то в поле или выдели текст на странице");
      return;
    }

    let finalPrompt = userText;

    if (select.value !== "custom") {
      const prefixes = { /* ... все твои префиксы остаются без изменений ... */ };
      finalPrompt = (prefixes[select.value] || "") + userText;
    }

    document.getElementById("loading").style.display = "block";
    askBtn.disabled = true;
    clearBtn.disabled = true;
    document.getElementById("result").style.display = "none";

    chrome.runtime.sendMessage({ action: "callAI", prompt: finalPrompt }, (res) => {
      document.getElementById("loading").style.display = "none";
      askBtn.disabled = false;
      clearBtn.disabled = false;

      const resultDiv = document.getElementById("result");


      if (res.success) {
        const formattedAnswer = res.answer.replace(/\n/g, '<br>');

        resultDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <strong style="font-size: 17px;">Ответ AI:</strong>
        <button id="copyBtn" title="Скопировать весь ответ" style="
        padding: 6px 10px;
        background: #f1f3f5;
        color: #495057;
        border: 1px solid #ced4da;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        ">
        <span style="font-size: 15px;">📋</span>
        Копировать ответ
        </button>
        </div>
        <div id="answerText" style="line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
        ${formattedAnswer}
        </div>
        `;
        resultDiv.style.display = "block";

        // Обработчик копирования
  
        const copyBtn = document.getElementById("copyBtn");
        if (copyBtn) {
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(res.answer).then(() => {
              const originalText = copyBtn.innerHTML;
              copyBtn.innerHTML = `<span style="font-size: 15px;">✅</span> Скопировано!`;
              copyBtn.style.background = "#d4edda";
              copyBtn.style.borderColor = "#c3e6cb";    
              copyBtn.style.color = "#155724";

              setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = "#f1f3f5";
                copyBtn.style.borderColor = "#ced4da";
                copyBtn.style.color = "#495057";
              }, 2000);
            }).catch(err => {
              console.error('Clipboard error:', err);
              alert("Не удалось скопировать");
            });    
          };

          // Hover-эффект (опционально, но красиво)
          copyBtn.onmouseover = () => {
            copyBtn.style.background = "#e9ecef";
            copyBtn.style.borderColor = "#adb5bd";
          };
          copyBtn.onmouseout = () => {
            copyBtn.style.background = "#f1f3f5";
            copyBtn.style.borderColor = "#ced4da";
          };
        }
      } else {
        resultDiv.innerHTML = `<span style="color:red;">Ошибка: ${res.error || "Неизвестная ошибка"}</span>`;
        resultDiv.style.display = "block";
      }
    });
  };
}