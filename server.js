const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());



const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: 'smtp@medishure.com',
        pass: 'dpqwrssjxlpgxyph',
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('SMTP is working:', success);
    }
});


// Email endpoint
app.post("/send-email", async (req, res) => {
    const { contactInfo, plans, totalPremium } = req.body;
  
    try {
        const emailContent = `
          <h1>Contact Information</h1>
          <p><strong>Full Name:</strong> ${contactInfo.fullName}</p>
          <p><strong>Contact Number:</strong> ${contactInfo.contactNumber}</p>
          <p><strong>Email Address:</strong> ${contactInfo.emailAddress}</p>
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
                    <td>
                      <strong>Plan:</strong> ${plan.hospitalSurgery.plan || "N/A"}<br>
                      <strong>Deductible:</strong> ${plan.hospitalSurgery.deductible || "N/A"}<br>
                      <strong>Premium:</strong> ${plan.hospitalSurgery.premium || "N/A"}
                    </td>
                    <td>
                      <strong>Plan:</strong> ${plan.outpatient.plan || "N/A"}<br>
                      <strong>Co-insurance:</strong> ${plan.outpatient.co_ins || "N/A"}<br>
                      <strong>Premium:</strong> ${plan.outpatient.premium || "N/A"}
                    </td>
                    <td>
                      <strong>Plan:</strong> ${plan.maternity.plan || "N/A"}<br>
                      <strong>Premium:</strong> ${plan.maternity.premium || "N/A"}
                    </td>
                    <td>
                      <strong>Plan:</strong> ${plan.dental.plan || "N/A"}<br>
                      <strong>Premium:</strong> ${plan.dental.premium || "N/A"}
                    </td>
                    <td><strong>${plan.subtotal}</strong></td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
          <h2>Total Premium: USD ${totalPremium}</h2>
        `;

    await transporter.sendMail({
        from: '"Datalokey" <smtp@medishure.com>', // Ensure this matches the SMTP user
        to: 'calvin@medishure.com',              // Receiver's email
        subject: 'Insurance Plans and Premiums', // Email subject
        html: emailContent,                      // Dynamic email content
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
