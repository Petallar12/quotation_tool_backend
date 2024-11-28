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
  const { contactInfo, plans, totalPremium , familyDiscount } = req.body;

  try {
    const emailContent = `
      <h1>Contact Information</h1>
      <p><strong>Full Name:</strong> ${contactInfo.fullName}  <strong>Contact Number:</strong> ${contactInfo.contactNumber}</p>
      <p><strong>Email Address:</strong> ${contactInfo.emailAddress}     <strong>Country of Residence:</strong> ${contactInfo.country_residence}</p>
      <p><strong>Nationality:</strong> ${contactInfo.nationality}  <strong>Family Discount:</strong> ${contactInfo.length}</p>
      <p><strong>Area of Coverage:</strong> ${contactInfo.area_of_coverage}</p>

      <hr>
      <h1>Plans and Premiums</h1>
      <table border="1" cellpadding="10">
        <thead>
          <tr>
            <th>Client</th>
            <th>Hospital & Surgery</th>
            <th>Outpatient</th>
            <th>Maternity</th>
            <th>Dental</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${plans
            .map(
              (plan) => `
              <tr>
                <td>${plan.client}</td>
                <td>${plan.hospitalSurgery}</td>
                <td>${plan.outpatient}</td>
                <td>${plan.maternity}</td>
                <td>${plan.dental}</td>
                <td>${plan.subtotal}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
      <h2>Family Discount: ${familyDiscount}%</h2>
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
