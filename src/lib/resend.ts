import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy123');

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@creativegroup.in';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@creativegroup.in';

// --- Customer confirmation after lead submission ---
export async function sendLeadConfirmationToCustomer(data: {
  customerName: string;
  customerEmail?: string;
  projectName: string;
  contactNo: string;
}) {
  if (!data.customerEmail) return;
  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Thank you for your enquiry — Creative Group`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;">
          <h1 style="color:#f0a500;margin:0;">Creative Group</h1>
          <p style="color:#ccc;margin:8px 0 0;">Gwalior, MP</p>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <h2 style="color:#1a1a2e;">Thank you, ${data.customerName}!</h2>
          <p style="color:#555;">We've received your enquiry for <strong>${data.projectName}</strong>.</p>
          <p style="color:#555;">Our team will reach out to you at <strong>${data.contactNo}</strong> shortly.</p>
          <div style="background:#fff;border-left:4px solid #f0a500;padding:15px;margin:20px 0;">
            <p style="margin:0;color:#333;"><strong>Best & Affordable Prices | Premium Development | First Time in Gwalior</strong></p>
          </div>
          <p style="color:#555;">Regards,<br/><strong>Creative Group Team</strong></p>
        </div>
      </div>
    `,
  });
}

// --- Admin notification on new lead ---
export async function sendNewLeadToAdmin(data: {
  customerName: string;
  contactNo: string;
  residence?: string;
  projectName: string;
  brokerName?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Lead: ${data.customerName} — ${data.projectName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:20px;">
          <h2 style="color:#f0a500;margin:0;">New Lead Received</h2>
        </div>
        <div style="padding:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.customerName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Contact</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.contactNo}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Residence</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.residence || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Project</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.projectName}</td></tr>
            <tr><td style="padding:8px;"><strong>Broker</strong></td><td style="padding:8px;">${data.brokerName || 'Direct (No Broker)'}</td></tr>
          </table>
        </div>
      </div>
    `,
  });
}

// --- Broker notification on lead attribution ---
export async function sendLeadAttributedToBroker(data: {
  brokerEmail: string;
  brokerName: string;
  customerName: string;
  projectName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: data.brokerEmail,
    subject: `New Lead Attributed to You — ${data.projectName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:20px;">
          <h2 style="color:#f0a500;margin:0;">New Lead Attributed</h2>
        </div>
        <div style="padding:20px;">
          <p>Hi <strong>${data.brokerName}</strong>,</p>
          <p>A new lead has been attributed to you via your affiliate link:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Customer Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.customerName}</td></tr>
            <tr><td style="padding:8px;"><strong>Project</strong></td><td style="padding:8px;">${data.projectName}</td></tr>
          </table>
          <p style="color:#888;font-size:12px;">Log in to your broker panel for full details.</p>
        </div>
      </div>
    `,
  });
}

// --- Broker welcome email on signup ---
export async function sendBrokerWelcomeEmail(data: {
  brokerEmail: string;
  brokerName: string;
  affiliateCode: string;
  appUrl: string;
}) {
  const affiliateLink = `${data.appUrl}/?ref=${data.affiliateCode}`;
  await resend.emails.send({
    from: FROM,
    to: data.brokerEmail,
    subject: `Welcome to Creative Group Broker Portal!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center;">
          <h1 style="color:#f0a500;margin:0;">Creative Group</h1>
          <p style="color:#ccc;margin:8px 0 0;">Broker Portal</p>
        </div>
        <div style="padding:30px;background:#f9f9f9;">
          <h2>Welcome, ${data.brokerName || 'Partner'}!</h2>
          <p>Your broker account has been created. Here's your unique affiliate link:</p>
          <div style="background:#1a1a2e;color:#f0a500;padding:15px;border-radius:8px;word-break:break-all;text-align:center;font-weight:bold;">
            ${affiliateLink}
          </div>
          <p style="margin-top:20px;">Share this link with potential buyers. When they enquire through it, you'll automatically earn commission on conversions.</p>
          <a href="${data.appUrl}/broker" style="display:inline-block;background:#f0a500;color:#1a1a2e;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:10px;">Go to Broker Panel</a>
        </div>
      </div>
    `,
  });
}

// --- Broker commission earned notification ---
export async function sendCommissionEarnedToBroker(data: {
  brokerEmail: string;
  brokerName: string;
  projectName: string;
  amount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: data.brokerEmail,
    subject: `Commission Earned: ₹${data.amount.toLocaleString('en-IN')} — Creative Group`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:20px;">
          <h2 style="color:#f0a500;margin:0;">Commission Earned! 🎉</h2>
        </div>
        <div style="padding:20px;">
          <p>Hi <strong>${data.brokerName}</strong>,</p>
          <p>You've earned a commission:</p>
          <div style="background:#f0f9ff;border:1px solid #e0f0ff;padding:20px;border-radius:8px;text-align:center;">
            <div style="font-size:32px;font-weight:bold;color:#1a1a2e;">₹${data.amount.toLocaleString('en-IN')}</div>
            <div style="color:#555;">${data.projectName}</div>
          </div>
          <p style="margin-top:20px;">Visit your broker panel to request a withdrawal.</p>
        </div>
      </div>
    `,
  });
}

// --- Admin notification on withdrawal request ---
export async function sendWithdrawalRequestToAdmin(data: {
  brokerName: string;
  brokerEmail: string;
  amount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Withdrawal Request from ${data.brokerName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:20px;">
          <h2 style="color:#f0a500;margin:0;">New Withdrawal Request</h2>
        </div>
        <div style="padding:20px;">
          <p><strong>${data.brokerName}</strong> (${data.brokerEmail}) has requested a withdrawal of <strong>₹${data.amount.toLocaleString('en-IN')}</strong>.</p>
          <p>Please review in the Admin Panel → Brokers → Withdrawal Requests.</p>
        </div>
      </div>
    `,
  });
}

// --- Broker withdrawal status update ---
export async function sendWithdrawalStatusToBroker(data: {
  brokerEmail: string;
  brokerName: string;
  amount: number;
  status: string;
}) {
  const statusMessages: Record<string, string> = {
    approved: 'Your withdrawal request has been approved. Payment will be processed shortly.',
    paid: 'Your withdrawal has been paid! Please check your bank account / UPI.',
    rejected: 'Unfortunately, your withdrawal request has been rejected. Please contact the admin for details.',
  };

  await resend.emails.send({
    from: FROM,
    to: data.brokerEmail,
    subject: `Withdrawal Request ${data.status.toUpperCase()} — Creative Group`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;padding:20px;">
          <h2 style="color:#f0a500;margin:0;">Withdrawal Status Update</h2>
        </div>
        <div style="padding:20px;">
          <p>Hi <strong>${data.brokerName}</strong>,</p>
          <p>${statusMessages[data.status] || 'Your withdrawal request status has been updated.'}</p>
          <p><strong>Amount:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
      </div>
    `,
  });
}
