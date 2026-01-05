const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    const { username, amount = 20 } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username obrigatorio'
      });
    }

    const cleanUsername = username.replace(/^@+/, '').trim();
    const maxAmount = Math.min(parseInt(amount) || 20, 50);

    console.log(`Buscando ${maxAmount} seguidores de:`, cleanUsername);

    // Buscar perfil para pegar ID
    const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    const profileResponse = await axios.get(profileUrl, {
      headers: {
        'User-Agent': 'Instagram 76.0.0.15.395 Android',
        'X-IG-App-ID': '936619743392459',
      },
      timeout: 15000
    });

    if (!profileResponse.data?.data?.user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario nao encontrado'
      });
    }

    const user = profileResponse.data.data.user;

    // Se perfil privado, retornar vazio
    if (user.is_private) {
      return res.status(200).json({
        success: true,
        data: {
          username: cleanUsername,
          is_private: true,
          followers: []
        }
      });
    }

    // Pegar seguidores dos dados do perfil
    const followers = [];
    const edges = user.edge_followed_by?.edges || [];

    for (let i = 0; i < Math.min(edges.length, maxAmount); i++) {
      const node = edges[i].node;
      followers.push({
        username: node.username || '',
        full_name: node.full_name || '',
        profile_pic_url: node.profile_pic_url || '',
        is_verified: node.is_verified || false,
        is_private: node.is_private || false,
        pk: node.id || ''
      });
    }

    console.log('Seguidores encontrados:', followers.length);

    return res.status(200).json({
      success: true,
      data: {
        username: cleanUsername,
        is_private: false,
        total_followers: user.edge_followed_by?.count || 0,
        followers: followers
      }
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar seguidores'
    });
  }
};
