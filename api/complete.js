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
    console.log('Buscando dados completos para:', cleanUsername);

    // 1. BUSCAR PERFIL PRINCIPAL
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
    
    const profile = {
      username: user.username,
      full_name: user.full_name || '',
      biography: user.biography || '',
      profile_pic_url: user.profile_pic_url || '',
      is_private: user.is_private || false,
      is_verified: user.is_verified || false,
      follower_count: user.edge_followed_by?.count || 0,
      following_count: user.edge_follow?.count || 0,
      media_count: user.edge_owner_to_timeline_media?.count || 0,
      pk: user.id || ''
    };

    // 2. BUSCAR AMIGOS (se perfil publico)
    let amigos = [];
    
    if (!user.is_private && user.edge_followed_by?.count > 0) {
      try {
        // Pegar alguns seguidores
        const edges = user.edge_followed_by?.edges || [];
        
        amigos = edges.slice(0, 15).map(edge => ({
          username: edge.node?.username || '',
          full_name: edge.node?.full_name || '',
          profile_pic_url: edge.node?.profile_pic_url || '',
          is_verified: edge.node?.is_verified || false,
          is_private: edge.node?.is_private || false,
        })).filter(a => a.username);

        console.log('Amigos encontrados:', amigos.length);
      } catch (err) {
        console.warn('Erro ao buscar amigos:', err.message);
      }
    }

    // 3. BUSCAR POSTS (se perfil publico)
    let posts = [];
    
    if (!user.is_private && user.edge_owner_to_timeline_media?.edges) {
      try {
        const postEdges = user.edge_owner_to_timeline_media.edges.slice(0, 12);
        
        posts = postEdges.map(edge => {
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
              like_count: node.edge_liked_by?.count || 0,
              comment_count: node.edge_media_to_comment?.count || 0,
              taken_at: node.taken_at_timestamp || 0
            }
          };
        });

        console.log('Posts encontrados:', posts.length);
      } catch (err) {
        console.warn('Erro ao buscar posts:', err.message);
      }
    }

    // 4. RETORNAR TUDO
    return res.status(200).json({
      success: true,
      data: {
        perfil_buscado: profile,
        lista_perfis_publicos: amigos,
        posts: posts
      }
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar dados'
    });
  }
};
