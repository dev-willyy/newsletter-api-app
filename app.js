const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const apiKey = require("./apiKey.json").key;
const client = require("@mailchimp/mailchimp_marketing");

const app = express();
const herokuPort = process.env.PORT || 3006;

client.setConfig({
    apiKey: apiKey,
    server: "us8",
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
    const userFirstName = req.body.firstName;
    const userLastName = req.body.secondName;
    const userEmail = req.body.email;

    const data = {
        members: [
            {
                email_address: userEmail,
                status: "subscribed",
                email_type: "text",
                merge_fields: {
                    FNAME: userFirstName,
                    LNAME: userLastName,
                },
            },
        ],
    };

    const jsonData = JSON.stringify(data);
    const baseURL = "https://us8.api.mailchimp.com/3.0/lists/323fd26647";
    const options = {
        method: "POST",
        auth: `prodigy97:${apiKey}`,
    };

    const mailchimpRequest = https.request(baseURL, options, (resp) => {
        resp.setEncoding("utf-8");
        resp.on("data", (data) => {
            console.log(JSON.parse(data));
        });

        const respStatusCode = resp.statusCode;

        respStatusCode === 200 ? res.sendFile(__dirname + "/success.html") : res.sendFile(__dirname + "/failure.html");
    });

    mailchimpRequest.write(jsonData);
    mailchimpRequest.end();

    console.log(`New member is: ${userFirstName} ${userLastName}, with email address: ${userEmail}`);
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.use(express.static("./public"));
app.use(express.static("./public/assets"));

app.listen(herokuPort, () => {
    console.table(`Express server for Newsletter App is running on port: ${herokuPort}`);
});
