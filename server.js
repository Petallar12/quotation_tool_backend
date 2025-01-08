const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: '*' 
}));
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
    // Prepare the email content for the admin (your email)
    const emailContentForAdmin = `
      <h1>Contact Information</h1>
      <p><strong>Full Name:</strong> ${contactInfo.fullName}</p>
      <p><strong>Contact Number:</strong> ${contactInfo.contactNumber}</p>
      <p><strong>Email Address:</strong> ${contactInfo.emailAddress}</p>
      <p><strong>Country of Residence:</strong> ${contactInfo.country_residence}</p>
      <p><strong>Nationality:</strong> ${contactInfo.nationality}</p>
      <p><strong>Area of Coverage:</strong> ${contactInfo.area_of_coverage}</p>

      <hr>
      <h1>Plans and Premiums</h1>
      <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
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
                <td>
                  Plan: ${plan.hospitalSurgeryPlan}
                  Deductible: ${plan.hospitalSurgeryDeductible}<br>
                  ${plan.hospitalSurgery}
                </td>
                <td>
                  Plan: ${plan.outpatientPlan}
                  Deductible: ${plan.outpatientDeductible}<br>
                  ${plan.outpatient}
                </td>
                <td>
                  Plan: ${plan.maternityPlan}<br>
                  ${plan.maternity}
                </td>
                <td>
                  Plan: ${plan.dentalPlan}<br>
                  ${plan.dental}
                </td>
                <td>${plan.subtotal}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
      <h2>Total Premium: USD ${totalPremium}</h2>
    `;

    // Send the email to the admin
    await transporter.sendMail({
      from: '"Quotation Tool" <no-reply@lukemedikal.co.id>', // Sender email
      to: 'webleads_test@medishure.com', // Your email
      subject: 'Luke Medikal Web Lead (April Indonesia)', // Email subject
      html: emailContentForAdmin, // Email content in HTML
    });

    // Prepare the thank-you email content for the user
   const emailContentForUser = `
  <h1>Thank you for your application!</h1>
  <p>Dear ${contactInfo.fullName},</p>
  <p>Thank you for submitting your application! We've received your details and will get back to you shortly.</p>
  
  <hr>
  <h1>Your Plans and Premiums</h1>
  <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
    <thead>
      <tr style="background-color: #f2f2f2;">
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
            <td>
              Plan: ${plan.hospitalSurgeryPlan}
              Deductible: ${plan.hospitalSurgeryDeductible}<br>
              ${plan.hospitalSurgery}
            </td>
            <td>
              Plan: ${plan.outpatientPlan}
              Deductible: ${plan.outpatientDeductible}<br>
              ${plan.outpatient}
            </td>
            <td>
              Plan: ${plan.maternityPlan}<br>
              ${plan.maternity}
            </td>
            <td>
              Plan: ${plan.dentalPlan}<br>
              ${plan.dental}
            </td>
            <td>${plan.subtotal}</td>
          </tr>
        `
        )
        .join('')}
    </tbody>
  </table>
  <h2>Total Premium: USD ${totalPremium}</h2>
`;

    // Send the thank-you email to the user
    await transporter.sendMail({
      from: '"Quotation Tool" <no-reply@lukemedikal.co.id>', // Sender email
      to: contactInfo.emailAddress, // User's email
      subject: 'Thank you for your application', // Email subject
      html: emailContentForUser, // Email content in HTML
    });

    // Send a success response
    res.status(200).send({ message: 'Emails sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Error sending email', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
