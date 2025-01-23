const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendStockRequestEmail = async (staffName, newRequests, pendingRequests) => {
  console.log(staffName, "name", newRequests, "pending" , pendingRequests ,"allpending");
  
  const formatRequests = (requests) => {
    return requests.map((req, index) => `
*Request #${index + 1}*
• Category: ${req.category}
• Description: ${req.description}
• Quantity: ${req.quantity} kg
${req.submittedAt ? `• Submitted on: ${new Date(req.submittedAt).toLocaleString()}` : ''}
    `).join('\n\n');
  };

  const emailContent = `
Dear Admin,

Stock Request Summary from ${staffName}

📦 *New Stock Requests* 📦
${newRequests.length > 0 ? formatRequests(newRequests) : 'No new requests'}

⏳ *Pending Stock Requests* ⏳
${pendingRequests.length > 0 ? formatRequests(pendingRequests) : 'No pending requests'}

Best regards,
Stock Management System
  `;

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.SENDER_EMAIL,
    subject: `Stock Request Summary from ${staffName}`,
    text: emailContent,
    html: `<pre style="font-family: Arial, sans-serif; line-height: 1.6;">${emailContent.replace(/\n/g, '<br>')}</pre>`
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendStockRequestEmail };

