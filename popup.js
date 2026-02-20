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
  const baseUrlInput = document.getElementById("baseUrl").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();
  const model = document.getElementById("model").value.trim();

  if (!apiKey) {
    status.innerHTML = `<span style="color:red;">❌ Введи API-ключ</span>`;
    return;
  }

  const base = baseUrlInput || "https://api.groq.com/openai/v1";
  const url = base + "/chat/completions";

  status.innerHTML = "Тестируем...";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Ответь одним словом: тест" }],
        max_tokens: 5,
        temperature: 0.1
      })
    });

    const data = await res.json();

    if (res.ok && data.choices && data.choices[0]?.message?.content) {
      const answer = data.choices[0].message.content.trim();
      status.innerHTML = `<span style="color:green;">✅ Работает! Ответ: ${answer}</span>`;
    } else if (res.ok) {
      // 200, но структура не та (Groq иногда возвращает чуть иначе)
      status.innerHTML = `<span style="color:orange;">⚠️ Запрос прошёл (200 OK), но ответ странный: ${JSON.stringify(data)}</span>`;
    } else {
      status.innerHTML = `<span style="color:red;">❌ Ошибка ${res.status}: ${data.error?.message || res.statusText}</span>`;
    }
  } catch (e) {
    status.innerHTML = `<span style="color:red;">❌ Сетевая ошибка: ${e.message}</span>`;
  }
};