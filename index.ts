import dotenv from "dotenv";
import twilio from "twilio";
import express from "express";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.use(express.urlencoded({extended: false}));

app.post("/sms", (req, res) => {
	const incomingMessage = req.body.Body;
	const fromNumber = req.body.From;

	console.log(`Received message: "${incomingMessage}" from ${fromNumber}`);

	// Send a response back to the user
	const twiml = new twilio.twiml.MessagingResponse();
	twiml.message("Thank you for your message!");

	res.writeHead(200, {"Content-Type": "text/xml"});
	res.end(twiml.toString());
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
