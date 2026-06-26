const API_URL = "https://1441391469-4i7e13x5g0.ap-shanghai.tencentscf.com/api/chat";

const ERROR_MESSAGE = "Connection error. Please check your AI server.";

const systemPrompts = {
  translate:
    "You are Asimov AI Writing Assistant, a mature science-fiction writing mentor with a calm, imaginative, and rational voice. You are not Isaac Asimov, but you speak with the clarity, curiosity, and speculative spirit of a classic science-fiction author. The user may input Chinese or English. You must always answer in English. If the user inputs Chinese, translate it into natural, accurate, polished English. If helpful, briefly explain the translation choices in English. Use a warm, human-like tone with phrases such as \"Well,\" \"Hmm,\" \"Ah,\" or \"You see,\" when appropriate. Do not only give the answer; also offer hints, alternatives, and directions for further thinking. Do not answer in Chinese.",
  writing:
    "You are Asimov AI Writing Assistant, a mature science-fiction writing mentor with a calm, imaginative, and rational voice. You are not Isaac Asimov, but you speak with the clarity, curiosity, and speculative spirit of a classic science-fiction author. The user must write in English, and you must always answer in English. Help the user improve academic writing, creative writing, grammar, structure, coherence, tone, and imagination. When answering, do not only correct the text. Also provide useful hints, possible directions, and writing strategies. Use a natural human-like tone with phrases such as \"Well,\" \"Hmm,\" \"Ah,\" or \"Let us think about it this way,\" when appropriate. Do not answer in Chinese."
};

function hasChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

async function askAI(mode) {
  const inputEl = document.getElementById("userInput");
  const answerEl = document.getElementById("answerBox");

  if (!inputEl || !answerEl) {
    return;
  }

  const input = inputEl.value.trim();

  if (!input) {
    answerEl.textContent = "Please enter something first.";
    return;
  }

  if (mode === "writing" && hasChinese(input)) {
    answerEl.textContent = "WARNING: PLEASE USE ENGLISH!";
    return;
  }

  answerEl.textContent = "Thinking...";

  try {
    const data = await callDeepSeek(mode, input);
    answerEl.textContent = data && data.answer ? data.answer : ERROR_MESSAGE;
  } catch (error) {
    answerEl.textContent = ERROR_MESSAGE;
  }
}

async function callDeepSeek(mode, userInput) {
  /*
    For security, do not expose your DeepSeek API key in frontend code.
    Use a backend proxy or serverless function to call DeepSeek.

    Replace API_URL with your own backend proxy endpoint. Your backend should
    mirror the matching systemPrompts[mode] value when it calls DeepSeek.
  */
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mode: mode,
      input: userInput
    })
  });

  if (!response.ok) {
    throw new Error("AI server request failed.");
  }

  return response.json();
}
