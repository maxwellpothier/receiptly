import dotenv from "dotenv";
import twilio from "twilio";
import axios from "axios";
import express from "express";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.use(express.urlencoded({extended: false}));

app.post("/sms", async (req, res) => {
	const numMedia = parseInt(req.body.NumMedia);
	const mediaContentType = req.body.MediaContentType0;
	const mediaUrl = req.body.MediaUrl0;

	if (numMedia > 1) {
		console.log("This app only supports a single media attachment");
		res.writeHead(200, {"Content-Type": "text/xml"});
		res.end(
			"<Response><Message>This app only supports a single media attachment</Message></Response>"
		);
		return;
	}

	if (!mediaContentType.startsWith("image/")) {
		console.log("This app only supports image media attachments");
		res.writeHead(200, {"Content-Type": "text/xml"});
		res.end(
			"<Response><Message>This app only supports image media attachments</Message></Response>"
		);
		return;
	}

	try {
		const response = await axios.request({
			method: "get",
			url: mediaUrl,
			responseType: "arraybuffer",
			auth: {
				username: process.env.TWILIO_ACCOUNT_SID!,
				password: process.env.TWILIO_AUTH_TOKEN!,
			},
		});

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const uploadsDir = path.join(__dirname, "uploads");
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, {recursive: true});
		}

		const fileName = `image_${Date.now()}.jpg`;
		const filePath = path.join(__dirname, "uploads", fileName);
		fs.writeFileSync(filePath, response.data);

		console.log(`Image saved to ${filePath}`);
	} catch (error) {
		console.error(error);
		res.writeHead(500, {"Content-Type": "text/xml"});
		res.end(
			"<Response><Message>An error occurred while processing your message</Message></Response>"
		);
		return;
	}

	// Send a response back to the user
	const twiml = new twilio.twiml.MessagingResponse();
	twiml.message("Thank you for your message!");

	res.writeHead(200, {"Content-Type": "text/xml"});
	res.end(twiml.toString());
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
