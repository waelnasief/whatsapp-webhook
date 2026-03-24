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
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from;
      const messageText = message.text?.body;

      console.log("Customer number:", from);
      console.log("Customer message:", messageText);

      const response = await fetch(
        "https://graph.facebook.com/v22.0/1069337116257766/messages",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer EAALkNdaYHbMBROWN9BuY8rQXnSzHCbGZCN5KSxj8H35KffGKkRb5H5UcZAZCqX1JhUZBUZA4TQFP6sP4f5zbZAUg6LbLz1cuRIH4ZCqFSnvZCAsZB4aI3TQxZADjbZCfmS181Ofn2OfLSlHQdama1YZBtoWsK8FPw3RwzdTxt9q1GA7XovwpXjAQfUvrraDyh0VDxu0IMazkPkoha6hwQS3CwY384U2S5Rv3OV4N1im2iZAmVfe3TtjjJ02d4ix1Ep1gJlvZCzcHeoxZCNGGpNXHGkGpsT7ttN76wZDZD",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Hello 👋 Thanks for contacting us. We received your message and will reply shortly."
            }
          })
        }
      );

      const data = await response.json();
      console.log("Reply sent:", data);
    }
  } catch (err) {
    console.error("Auto-reply error:", err);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});