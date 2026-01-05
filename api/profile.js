const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username obrigatorio'
      });
    }

    const cleanUsername = username.replace(/^@+/, '').trim();
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Instagram 76.0.0.15.395 Android',
        'X-IG-App-ID': '936619743392459',
      },
      timeout: 10000
    });

    if (response.data && response.data.data && response.data.data.user) {
      const user = response.data.data.user;
      
      return res.status(200).json({
        success: true,
        data: {
          username: user.username,
          full_name: user.full_name || '',
          biography: user.biography || '',
          profile_pic_url: user.profile_pic_url || '',
          is_private: user.is_private || false,
          is_verified: user.is_verified || false,
          follower_count: user.edge_followed_by?.count || 0,
          following_count: user.edge_follow?.count || 0,
          media_count: user.edge_owner_to_timeline_media?.count || 0,
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Usuario nao encontrado'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar perfil'
    });
  }
};
