import User from '../models/User.js';

export async function googleAuth(req, res) {

  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'accessToken required' });

  try {
    const googleRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google token' });
    const { id: googleId, name, email, picture: avatar } = await googleRes.json();
    const [user] = await User.findOrCreate({
      where: { googleId },
      defaults: { name, email, avatar },
    });

    if (user.name !== name || user.avatar !== avatar) await user.update({ name, avatar });
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  }
  catch (err) {
    console.error('[Auth] Google auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
