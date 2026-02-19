// popup.js
const saveBtn = document.getElementById("saveBtn");
const testBtn = document.getElementById("testBtn");
const status = document.getElementById("status");

chrome.storage.sync.get(['baseUrl', 'apiKey', 'model'], (data) => {
  document.getElementById("baseUrl").value = data.baseUrl || "";
  document.getElementById("apiKey").value = data.apiKey || "";
  document.getElementById("model").value = data.model || "llama-3.3-70b-versatile";
});

saveBtn.onclick = () => {
  const baseUrl = document.getElementById("baseUrl").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();
  const model = document.getElementById("model").value.trim();

  chrome.storage.sync.set({ baseUrl, apiKey, model }, () => {
    status.innerHTML = `<span style="color:green;">✅ Настройки сохранены!</span>`;
    setTimeout(() => status.textContent = "", 2500);
  });
};

testBtn.onclick = async () => {
  const baseUrl = document.getElementById("baseUrl").value.trim() || "https://api.openai.com/v1/chat/completions";
  const apiKey = document.getElementById("apiKey").value.trim();
  const model = document.getElementById("model").value.trim();

  if (!apiKey) return alert("Сначала введи API-ключ");

  status.innerHTML = "Тестируем...";
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: "Привет, ответь одним словом: тест" }]
      })
    });
    const data = await res.json();
    if (data.choices) status.innerHTML = `<span style="color:green;">✅ Работает! Ответ: ${data.choices[0].message.content}</span>`;
    else throw new Error();
  } catch (e) {
    status.innerHTML = `<span style="color:red;">❌ Ошибка: ${e.message || "проверь ключ и URL"}</span>`;
  }
};