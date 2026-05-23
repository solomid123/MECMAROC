export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nom, e-mail et message sont requis.' });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_crcqcZca_84mn9e8Fy9bFteFcnujRkZrr',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MecMaroc Contact <info@mecmaroc.com>',
        to: 'info@mecmaroc.com',
        subject: `Contact MecMaroc - ${subject || 'Nouveau Message'}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Société :</strong> ${company || 'Non renseigné'}</p>
          <p><strong>E-mail :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
          <p><strong>Sujet :</strong> ${subject || 'Non renseigné'}</p>
          <p><strong>Message :</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
        `
      })
    });

    const payload = await resendRes.json().catch(() => ({}));

    return res.status(resendRes.status).json(payload);
  } catch (err) {
    console.error('[send-contact] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
