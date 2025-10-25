// src/controllers/zohoController.js
import { exchangeAuthCode } from '../services/zohoAuth.js';

export async function oauthCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing "code"');

    const tokens = await exchangeAuthCode(code);

    // На первом обмене Zoho отдаёт refresh_token — его надо сохранить.
    // На данном шаге просто показываем его на экране, чтобы ты скопировал в .env или БД.
    const html = `
      <h3>Zoho OAuth: success</h3>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
      <p><b>Важно:</b> Сохрани <code>refresh_token</code>. 
      Рекомендуется положить его в БД или в .env (e.g. ZOHO_REFRESH_TOKEN=...).</p>`;
    res.status(200).send(html);
  } catch (err) {
    console.error('[Zoho oauthCallback] error:', err);
    res.status(500).send(err.message || 'Zoho OAuth failed');
  }
}
