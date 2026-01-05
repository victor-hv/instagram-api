const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    const { tipo, username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Username obrigatorio'
      });
    }

    const cleanUsername = username.replace(/^@+/, '').trim();

    // ======================================
    // TIPO 1: PERFIL RÁPIDO (para modal)
    // ======================================
    if (tipo === 'perfil') {
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Instagram 76.0.0.15.395 Android',
          'X-IG-App-ID': '936619743392459',
        },
        timeout: 15000
      });

      if (response.data?.data?.user) {
        const user = response.data.data.user;
        
        return res.status(200).json({
          success: true,
          data: {
            user_id: user.id || user.pk || null,
            username: user.username,
            full_name: user.full_name || '',
            biography: user.biography || '',
            profile_pic_url: user.profile_pic_url || '',
            is_private: user.is_private || false,
            is_verified: user.is_verified || false,
            is_business: user.is_business_account || false,
            media_count: user.edge_owner_to_timeline_media?.count || 0,
            follower_count: user.edge_followed_by?.count || 0,
            following_count: user.edge_follow?.count || 0
          }
        });
      }

      return res.status(404).json({
        error: 'Usuario nao encontrado'
      });
    }

    // ======================================
    // TIPO 2: BUSCA COMPLETA (perfil + amigos + posts)
    // ======================================
    if (tipo === 'busca_completa') {
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Instagram 76.0.0.15.395 Android',
          'X-IG-App-ID': '936619743392459',
        },
        timeout: 15000
      });

      if (!response.data?.data?.user) {
        return res.status(404).json({
          error: 'Usuario nao encontrado'
        });
      }

      const user = response.data.data.user;

      // 1. PERFIL BUSCADO
      const perfil_buscado = {
        username: user.username,
        full_name: user.full_name || '',
        profile_pic_url: user.profile_pic_url || '',
        is_private: user.is_private || false,
        is_verified: user.is_verified || false,
        follower_count: user.edge_followed_by?.count || 0,
        following_count: user.edge_follow?.count || 0,
        media_count: user.edge_owner_to_timeline_media?.count || 0
      };

      // 2. LISTA DE PERFIS PÚBLICOS (amigos/seguidores)
      let lista_perfis_publicos = [];
      
      // Tentar pegar seguidores da timeline
      if (user.edge_followed_by?.edges && user.edge_followed_by.edges.length > 0) {
        lista_perfis_publicos = user.edge_followed_by.edges.slice(0, 20).map(edge => ({
          username: edge.node?.username || '',
          full_name: edge.node?.full_name || '',
          profile_pic_url: edge.node?.profile_pic_url || '',
          is_verified: edge.node?.is_verified || false,
          is_private: edge.node?.is_private || false
        }));
      }

      // 3. POSTS DO FEED
      let posts = [];
      
      if (user.edge_owner_to_timeline_media?.edges && user.edge_owner_to_timeline_media.edges.length > 0) {
        posts = user.edge_owner_to_timeline_media.edges.slice(0, 12).map(edge => {
          const node = edge.node;
          return {
            de_usuario: {
              username: user.username,
              full_name: user.full_name || '',
              profile_pic_url: user.profile_pic_url || ''
            },
            post: {
              id: node.id || '',
              shortcode: node.shortcode || '',
              image_url: node.display_url || node.thumbnail_src || '',
              video_url: node.is_video ? node.video_url : null,
              is_video: node.is_video || false,
              caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
              like_count: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
              comment_count: node.edge_media_to_comment?.count || 0,
              taken_at: node.taken_at_timestamp || 0
            }
          };
        });
      }

      return res.status(200).json({
        success: true,
        perfil_buscado,
        lista_perfis_publicos,
        posts
      });
    }

    // Tipo inválido
    return res.status(400).json({
      error: 'Tipo invalido. Use: perfil ou busca_completa'
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar dados',
      details: error.message
    });
  }
};
