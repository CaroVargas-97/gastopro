export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://gastopro-three.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Falta token de sesión' });

  try {
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY }
    });
    if (!userRes.ok) return res.status(401).json({ error: 'Sesión inválida' });
  } catch (e) {
    return res.status(401).json({ error: 'No se pudo validar la sesión' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    };
    if (req.body && req.body.beta) {
      headers['anthropic-beta'] = req.body.beta;
    }
    const body = { ...req.body };
    delete body.beta;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
