const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // SMTP server
  port: 587, // Port for STARTTLS
  secure: false, // Use false for STARTTLS
  auth: {
    user: process.env.SMTP_USER, // SMTP user (from environment variable)
    pass: process.env.SMTP_PASS, // SMTP password (from environment variable)
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Verification Error:', error);
  } else {
    console.log('SMTP is working:', success);
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Quotation Tool Backend is running!');
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  const { contactInfo, plans, totalPremium } = req.body;

  try {
    // Email Content Construction
    const emailContent = `
      <h1>Contact Information</h1>
      <p><strong>Full Name:</strong> ${contactInfo.fullName}</p>
      <p><strong>Contact Number:</strong> ${contactInfo.contactNumber}</p>
      <p><strong>Email Address:</strong> ${contactInfo.emailAddress}</p>
      <p><strong>Country of Residence:</strong> ${contactInfo.country_residence}</p>
      <p><strong>Nationality:</strong> ${contactInfo.nationality}</p>
      <p><strong>Area of Coverage:</strong> ${contactInfo.area_of_coverage}</p>

      <hr>
      <h1>Plans and Premiums</h1>
      <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Client</th>
            <th>Hospital & Surgery Plan & Room</th>
            <th>Hospital & Surgery Deductible</th>
            <th>Hospital & Surgery Premium</th>
            <th>Outpatient Plan & Room</th>
            <th>Outpatient Deductible</th>
            <th>Outpatient Premium</th>
            <th>Maternity Plan & Room</th>
            <th>Maternity Deductible</th>
            <th>Maternity Premium</th>
            <th>Dental Plan & Room</th>
            <th>Dental Deductible</th>
            <th>Dental Premium</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${plans
            .map(
              (plan) => `
              <tr>
                <td>${plan.client}</td>
                <td>${plan.hospitalSurgery.plan}</td>
                <td>${plan.hospitalSurgery.deductible}</td>
                <td>${plan.hospitalSurgery.premium}</td>
                <td>${plan.outpatient.plan}</td>
                <td>${plan.outpatient.deductible}</td>
                <td>${plan.outpatient.premium}</td>
                <td>${plan.maternity.plan}</td>
                <td>${plan.maternity.deductible}</td>
                <td>${plan.maternity.premium}</td>
                <td>${plan.dental.plan}</td>
                <td>${plan.dental.deductible}</td>
                <td>${plan.dental.premium}</td>
                <td>${plan.subtotal}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
      
      <h2>Total Premium: USD ${totalPremium}</h2>
    `;

    // Send the email
    await transporter.sendMail({
      from: '"Datalokey" <smtp@medishure.com>', // Sender email
      to: 'calvin@medishure.com', // Receiver email
      subject: 'Insurance Plans and Premiums', // Email subject
      html: emailContent, // Email content in HTML
    });

    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Error sending email', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
