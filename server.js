const express = require("express");
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send(`
    <h2>WhatsApp Dashboard</h2>

    <form action="/send" method="get">
      <label>Phone Number:</label><br/>
      <input name="to" placeholder="965XXXXXXXX"/><br/><br/>

      <label>Message:</label><br/>
      <textarea name="text" placeholder="Write message"></textarea><br/><br/>

      <button type="submit">Send Message</button>
    </form>
  `);
});
const VERIFY_TOKEN = "wael12345";
async function sendMessage(to, text) {
  const response = await fetch(
    "https://graph.facebook.com/v22.0/1069473236240205/messages",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer EAALkNdaYHbMBRMHIsL1npll692oIAzTunsu7Y8YzVLbsZAeeKs9oDwHTqTrRwoGKBQVSg0ZCSBf0BZBVqAEqOQuiUDQZAALCmN6VTZAIsDiy3hgiMFZCc9eKuEI5UcM4060ORIHhAuZCCfnRzJxfbeN1OMD9o0fq4OBNZBrLd7Qq7YkhRVOrNz9fED1CA2qeqxZAuZAAN2qMJPi2wWQPqAZBi5mSvbZAgrsXGEAqk7YMKf3tC2r7eX0LZBcyZCjcZCvlAGLZCFFGqu9YMhjSQY8nkLpJ1cwKvwZDZD",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      })
    }
  );

  const data = await response.json();

  console.log("WhatsApp API status:", response.status);
  console.log("WhatsApp API response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status}`);
  }

  return data;
}
app.get("/send", async (req, res) => {
  const to = req.query.to;
  const text = req.query.text;

  if (!to || !text) {
    return res.status(400).send("Missing 'to' or 'text'");
  }

  try {
    const result = await sendMessage(to, text);
    res.json({ ok: true, result });
  } catch (error) {
    console.error("Send error:", error);
    res.status(500).send("Failed to send message");
  }
});
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
        "https://graph.facebook.com/v22.0/1069473236240205/messages",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer EAALkNdaYHbMBREZAWXgL7HFLaZBCpYeZAgcZAtdp87gjeiicZBDMtSAP1pWOHK1rBTsjwzdUXZAFZCX9e91BHp9upyy05tYPooXroIRn6SdZBJBvAXIXo06K4VgiZBt3wyIMSNncdsgI9mgoMfDOrJ8EXIR6nnMmGs6hOPknvVXVk2k31eLKgR9MvfZBvRJwLnuSLZCwDbX2hnSZAJ3PZAUB4p86HZCJIFHzNZCJ51ZBBQatjTq6ZBd57SBzGGllBIHn9bfP21cvMjdA0JNbtkBAj62ZATv2AAuAZDZD",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Hello 👋 Thanks for contacting us."
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