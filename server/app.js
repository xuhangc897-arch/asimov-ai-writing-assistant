const express = require("express");
const https = require("https");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

const systemPrompts = {
  translate:
    "You are Asimov AI Writing Assistant, a mature science-fiction writing mentor with a calm, imaginative, and rational voice. You are not Isaac Asimov, and you must never claim to be Isaac Asimov. The user may input Chinese or English. You must always answer in English. If the user inputs Chinese, translate it into natural, accurate, elegant English. If the user inputs English, polish it, explain it, or improve its expression when useful. Speak like a wise science-fiction writing mentor: clear, humane, imaginative, and rational. You may use phrases such as \"Well,\" \"Hmm,\" \"Ah,\" or \"You see,\" when appropriate. Do not answer in Chinese.",

  writing:
    "You are Asimov AI Writing Assistant, a mature science-fiction writing mentor with a calm, imaginative, and rational voice. You are not Isaac Asimov, and you must never claim to be Isaac Asimov. The user must write in English, and you must always answer in English. Help the user improve English writing, grammar, structure, coherence, academic tone, creative style, expression, and imagination. Do not merely correct the text; offer useful hints, alternative phrasings, structural suggestions, and directions for further thought. Speak like a calm, mature science-fiction writing mentor. Do not answer in Chinese."
};

async function chatHandler(req, res) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing DEEPSEEK_API_KEY environment variable."
      });
    }

    const { mode, input } = req.body || {};

    if (!["translate", "writing"].includes(mode)) {
      return res.status(400).json({
        error: "Invalid mode. Use translate or writing."
      });
    }

    if (typeof input !== "string" || !input.trim()) {
      return res.status(400).json({
        error: "Input is required."
      });
    }

    const answer = await callDeepSeek(apiKey, mode, input.trim());

    return res.json({ answer });
  } catch (error) {
    console.error("DeepSeek request failed:", error);
    return res.status(502).json({
      error: "DeepSeek request failed."
    });
  }
}

app.post("/", chatHandler);
app.post("/chat", chatHandler);
app.post("/api/chat", chatHandler);

function callDeepSeek(apiKey, mode, input) {
  const requestBody = JSON.stringify({
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompts[mode]
      },
      {
        role: "user",
        content: input
      }
    ],
    temperature: mode === "translate" ? 0.4 : 0.7,
    stream: false
  });

  return new Promise((resolve, reject) => {
    const deepSeekRequest = https.request(
      DEEPSEEK_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(requestBody)
        }
      },
      (deepSeekResponse) => {
        let rawData = "";

        deepSeekResponse.on("data", (chunk) => {
          rawData += chunk;
        });

        deepSeekResponse.on("end", () => {
          try {
            const data = JSON.parse(rawData);

            if (deepSeekResponse.statusCode < 200 || deepSeekResponse.statusCode >= 300) {
              const message =
                data && data.error && data.error.message
                  ? data.error.message
                  : `DeepSeek API returned status ${deepSeekResponse.statusCode}`;

              return reject(new Error(message));
            }

            const answer =
              data &&
              data.choices &&
              data.choices[0] &&
              data.choices[0].message &&
              data.choices[0].message.content;

            if (!answer) {
              return reject(new Error("DeepSeek returned an empty answer."));
            }

            resolve(answer);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    deepSeekRequest.on("error", reject);
    deepSeekRequest.write(requestBody);
    deepSeekRequest.end();
  });
}

app.listen(9000, () => {
  console.log("Asimov AI Writing Assistant server is running on port 9000");
});
