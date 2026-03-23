const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "wael12345";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("MODE:", mode);
  console.log("TOKEN FROM META:", token);
  console.log("VERIFY_TOKEN IN APP:", VERIFY_TOKEN);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
});

app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;

      console.log("Message from:", from);

      // 👇 reply
      const response = await fetch(
         `https://graph.facebook.com/v18.0/1069337116257766/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer EAALkNdaYHbMBRJVdU4y3o8KQR6EfuZC1wBCHlvFZAiyme4PP3wZA7b0m7VR7y1W0ipiULfn0BEr8f9YSbscvcsG4Y7eeI3LKefM0iuALoi7VE8VFMtv8dyMZBlhroyutAXsqlO3Ob69Yy7TIGuACB1AyaXDBEAjMyHowN2JExEZANl6irJ1EWkOgCx244QL6qhQ3x2IW8ZAOzBDMStfapOOsuraKE7LRZCbzZA1s3A5PtAG0oHkePCNgwcBeVr30AmpVPaAGNMZBt5x681oSnztp2CyHh`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: "Hello 👋 Thanks for contacting us!" },
          }),
        }
      );

      const data = await response.json();
      console.log("Reply sent:", data);
    }
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});