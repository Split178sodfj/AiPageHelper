// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aiHelper",
    title: "🤖 Спросить AI Helper",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "aiHelper" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "openAIHelper",
      selectedText: info.selectionText
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callAI") {
    handleAIRequest(request, sendResponse);
    return true; // важно для асинхронного ответа
  }
});

async function handleAIRequest(request, sendResponse) {
  try {
    const { apiKey, baseUrl, model } = await chrome.storage.sync.get(['apiKey', 'baseUrl', 'model']);

    if (!apiKey) {
      sendResponse({ success: false, error: "Сначала введи API-ключ в настройках расширения" });
      return;
    }

    const fullUrl = (baseUrl ? baseUrl : "https://api.groq.com/openai/v1") + "/chat/completions";

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: request.prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Нет ответа от AI";

    sendResponse({ success: true, answer });
  } catch (e) {
    sendResponse({ success: false, error: e.message });
  }
}