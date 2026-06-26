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

document.addEventListener("DOMContentLoaded", initHomePageEffects);

function initHomePageEffects() {
  if (!document.body.classList.contains("home-page")) {
    return;
  }

  initHomeCanvas();
  initHomeButtonParallax();
  initThinkingStatus();
}

function initHomeCanvas() {
  const canvas = document.getElementById("spaceCanvas");

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    return;
  }

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let streams = [];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const colors = ["40, 242, 255", "50, 119, 255", "157, 77, 255", "255, 63, 210"];

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createField();
  }

  function createField() {
    const particleCount = width < 720 ? 70 : 120;
    const streamCount = width < 720 ? 9 : 16;

    particles = Array.from({ length: particleCount }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;

      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: 0.7 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.00018 + Math.random() * 0.00034,
        drift: 7 + Math.random() * 18
      };
    });

    streams = Array.from({ length: streamCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 34 + Math.random() * 74,
      speed: 0.16 + Math.random() * 0.32,
      alpha: 0.04 + Math.random() * 0.08,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function centerFade(x, y) {
    const dx = (x / width - 0.5) / 0.24;
    const dy = (y / height - 0.46) / 0.36;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 1 ? 0.28 + distance * 0.34 : 0.72;
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, width, height);
    mouse.x += (mouse.tx - mouse.x) * 0.035;
    mouse.y += (mouse.ty - mouse.y) * 0.035;

    const nebula = ctx.createRadialGradient(width * 0.5, height * 0.46, 20, width * 0.5, height * 0.46, width * 0.52);
    nebula.addColorStop(0, "rgba(40, 242, 255, 0.025)");
    nebula.addColorStop(0.45, "rgba(157, 77, 255, 0.018)");
    nebula.addColorStop(1, "rgba(255, 63, 210, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      const t = timestamp * particle.speed + particle.phase;
      const x = particle.baseX + Math.cos(t) * particle.drift + mouse.x * 5;
      const y = particle.baseY + Math.sin(t * 0.8) * particle.drift + mouse.y * 4;
      const alpha = 0.1 * centerFade(x, y);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
      ctx.shadowColor = `rgba(${particle.color}, ${alpha * 1.6})`;
      ctx.shadowBlur = 8;
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;

    streams.forEach((stream) => {
      stream.y += stream.speed;

      if (stream.y - stream.length > height) {
        stream.y = -stream.length;
        stream.x = Math.random() * width;
      }

      const fade = centerFade(stream.x, stream.y);
      const gradient = ctx.createLinearGradient(stream.x, stream.y - stream.length, stream.x + 18, stream.y);
      gradient.addColorStop(0, `rgba(${stream.color}, 0)`);
      gradient.addColorStop(0.45, `rgba(${stream.color}, ${stream.alpha * fade})`);
      gradient.addColorStop(1, `rgba(${stream.color}, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(stream.x, stream.y - stream.length);
      ctx.lineTo(stream.x + 18, stream.y);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (event) => {
    mouse.tx = (event.clientX / width - 0.5) || 0;
    mouse.ty = (event.clientY / height - 0.5) || 0;
  }, { passive: true });

  resizeCanvas();
  requestAnimationFrame(draw);
}

function initHomeButtonParallax() {
  const buttons = document.querySelectorAll(".home-button");

  if (!buttons.length) {
    return;
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function updateButtons() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    buttons.forEach((button, index) => {
      const direction = index === 0 ? -1 : 1;
      button.style.setProperty("--parallax-x", `${(currentX * direction).toFixed(2)}px`);
      button.style.setProperty("--parallax-y", `${currentY.toFixed(2)}px`);
    });

    requestAnimationFrame(updateButtons);
  }

  window.addEventListener("mousemove", (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 6;
    targetY = (event.clientY / window.innerHeight - 0.5) * 6;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  requestAnimationFrame(updateButtons);
}

function initThinkingStatus() {
  const statusEl = document.querySelector(".thinking-status");

  if (!statusEl) {
    return;
  }

  const messages = [
    "Analyzing narrative patterns...",
    "Simulating future possibilities...",
    "Searching memory archives...",
    "Calibrating language engine...",
    "System ready."
  ];
  let index = 0;

  setInterval(() => {
    statusEl.classList.add("is-changing");

    window.setTimeout(() => {
      index = (index + 1) % messages.length;
      statusEl.textContent = messages[index];
      statusEl.classList.remove("is-changing");
    }, 420);
  }, 3000);
}
