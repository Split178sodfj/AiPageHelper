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
      <select id="promptSelect" style="width:100%; padding:10px; margin-bottom:12px; border-radius:8px; border:1px solid #ccc;">
        <option value="summarize">Суммировать текст</option>
        <option value="explain">Объяснить простыми словами</option>
        <option value="rewrite">Переписать красиво</option>
        <option value="tweet">Сделать твит-тред</option>
        <option value="critic">Найти ошибки и улучшить</option>
        <option value="custom">Свой промпт</option>
      </select>
      <textarea id="textArea" style="width:100%; height:110px; padding:12px; border-radius:8px; border:1px solid #ccc; resize:vertical;">${selectedText}</textarea>
      
      <button id="askButton" style="margin-top:12px; width:100%; padding:14px; background:#000; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer;">🚀 Спросить AI</button>
      
      <div id="loading" style="display:none; text-align:center; margin:20px 0; color:#666;">Думаю...</div>
      <div id="result" style="margin-top:16px; padding:14px; background:#f8f9fa; border-radius:8px; white-space:pre-wrap; display:none;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // обработчики
  document.getElementById("closeBtn").onclick = () => panel.remove();

  const askBtn = document.getElementById("askButton");
  askBtn.onclick = async () => {
    const select = document.getElementById("promptSelect");
    const textarea = document.getElementById("textArea");
    let prompt = textarea.value.trim();

    if (!prompt) return alert("Выдели текст или напиши свой запрос");

    if (select.value !== "custom") {
      const prefixes = {
        summarize: "Суммируй максимально коротко и по делу:\n",
        explain: "Объясни это как 12-летнему ребёнку:\n",
        rewrite: "Перепиши красиво, профессионально и увлекательно:\n",
        tweet: "Преврати в твит-тред (нумерованный, до 10 твитов):\n",
        critic: "Найди ошибки, неточности и предложи улучшения:\n"
      };
      prompt = prefixes[select.value] + prompt;
    }

    document.getElementById("loading").style.display = "block";
    askBtn.disabled = true;
    document.getElementById("result").style.display = "none";

    chrome.runtime.sendMessage({ action: "callAI", prompt }, (res) => {
      document.getElementById("loading").style.display = "none";
      askBtn.disabled = false;

      const resultDiv = document.getElementById("result");
      if (res.success) {
        resultDiv.innerHTML = `<strong>Ответ AI:</strong><br><br>${res.answer.replace(/\n/g, '<br>')}`;
        resultDiv.style.display = "block";
      } else {
        resultDiv.innerHTML = `<span style="color:red;">Ошибка: ${res.error}</span>`;
        resultDiv.style.display = "block";
      }
    });
  };
}