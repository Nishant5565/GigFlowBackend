const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    const mailOptions = {
      from: "GigFlow <brandureonline@gmail.com>",
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, "../templates", templateName);
  let template = fs.readFileSync(templatePath, "utf8");

  for (const key in replacements) {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, replacements[key]);
  }
  return template;
};

const sendWelcomeEmail = async (email, name) => {
  const html = loadTemplate("welcome.html", {
    name,
    dashboardUrl: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/dashboard`,
  });
  await sendEmail(email, "Welcome to GigFlow!", html);
};

const sendNewBidEmail = async (
  email,
  ownerName,
  freelancerName,
  bidAmount,
  bidMessage,
  gigTitle,
  gigId
) => {
  const html = loadTemplate("new_bid.html", {
    ownerName,
    freelancerName,
    bidAmount,
    bidMessage,
    gigTitle,
    gigUrl: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/dashboard/gigs/${gigId}/bids`,
  });
  await sendEmail(email, `New Bid on: ${gigTitle}`, html);
};

const sendBidAcceptedEmail = async (
  email,
  freelancerName,
  clientName,
  gigTitle,
  gigId
) => {
  const html = loadTemplate("bid_accepted.html", {
    freelancerName,
    clientName,
    gigTitle,
    gigUrl: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/gigs/${gigId}`,
  });
  await sendEmail(email, "Congratulations! Your Bid Was Accepted", html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendNewBidEmail,
  sendBidAcceptedEmail,
};
