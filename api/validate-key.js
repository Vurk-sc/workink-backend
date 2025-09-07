export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  // Basic validation
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      valid: false, 
      error: 'Invalid token format' 
    });
  }

  const cleanToken = token.trim();

  try {
    // Call work.ink API to validate token
    const response = await fetch(`https://work.ink/_api/v2/token/isValid/${encodeURIComponent(cleanToken)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'KeyValidationService/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(500).json({
        valid: false,
        error: 'Unable to validate token at this time'
      });
    }

    const result = await response.json();

    return res.status(200).json({
      valid: result.valid || false,
      message: result.valid ? 'Key is valid' : 'Key is invalid or expired'
    });

  } catch (error) {
    console.error('Error validating key:', error);
    
    return res.status(500).json({
      valid: false,
      error: 'Validation service temporarily unavailable'
    });
  }
}
