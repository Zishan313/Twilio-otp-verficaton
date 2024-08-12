require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");


const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Twilio Auth Token
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // Verify Service SID

const client = twilio(accountSid, authToken);

const app = express();
app.use(bodyParser.json());

// Send OTP
app.post("/send-otp", (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  client.verify
    .services(verifyServiceSid)
    .verifications.create({ to: phoneNumber, channel: "sms" })
    .then((verification) => {
      res
        .status(200)
        .json({ message: "OTP sent successfully", sid: verification.sid });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP code are required" });
  }

  client.verify
    .services(verifyServiceSid)
    .verificationChecks.create({ to: phoneNumber, code: code })
    .then((verification_check) => {
      if (verification_check.status === "approved") {
        res.status(200).json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "OTP verification failed" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
