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
    console.log('Buscando perfis sugeridos para:', cleanUsername);

    // Buscar perfil para confirmar que existe
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
    const userId = user.id;

    // Buscar perfis sugeridos baseados no usuario
    const suggestedUrl = `https://www.instagram.com/api/v1/friendships/${userId}/suggested/`;
    
    let suggested = [];

    try {
      const suggestedResponse = await axios.get(suggestedUrl, {
        headers: {
          'User-Agent': 'Instagram 76.0.0.15.395 Android',
          'X-IG-App-ID': '936619743392459',
        },
        timeout: 15000
      });

      if (suggestedResponse.data?.users) {
        suggested = suggestedResponse.data.users.slice(0, 15).map(u => ({
          username: u.username || '',
          full_name: u.full_name || '',
          profile_pic_url: u.profile_pic_url || '',
          is_verified: u.is_verified || false,
          is_private: u.is_private || false,
          pk: u.pk || u.id || ''
        }));
      }
    } catch (err) {
      console.warn('Erro ao buscar sugeridos via API:', err.message);
      
      // Fallback: usar edge_chaining do perfil
      const chaining = user.edge_chaining?.edges || [];
      suggested = chaining.slice(0, 15).map(edge => ({
        username: edge.node?.username || '',
        full_name: edge.node?.full_name || '',
        profile_pic_url: edge.node?.profile_pic_url || '',
        is_verified: edge.node?.is_verified || false,
        is_private: edge.node?.is_private || false,
        pk: edge.node?.id || ''
      })).filter(s => s.username);
    }

    console.log('Perfis sugeridos encontrados:', suggested.length);

    return res.status(200).json({
      success: true,
      data: {
        username: cleanUsername,
        is_private: user.is_private || false,
        suggested: suggested
      }
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar perfis sugeridos'
    });
  }
};
