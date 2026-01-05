const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    const { campo, username, amount = 20 } = req.query;

    if (!username) {
      return res.status(400).json({
        error: 'Username obrigatorio'
      });
    }

    if (!campo) {
      return res.status(400).json({
        error: 'Campo obrigatorio (perfis_sugeridos, lista_seguidores, etc)'
      });
    }

    const cleanUsername = username.replace(/^@+/, '').trim();
    const maxAmount = parseInt(amount) || 20;

    // Buscar perfil básico primeiro
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

    // ======================================
    // CAMPO 1: PERFIS SUGERIDOS
    // ======================================
    if (campo === 'perfis_sugeridos') {
      // Para perfis privados ou quando não há seguidores
      // Retorna perfis relacionados/sugeridos
      
      const sugeridos = [];

      // Tentar pegar do edge_related_profiles (se disponível)
      if (user.edge_related_profiles?.edges) {
        user.edge_related_profiles.edges.forEach(edge => {
          if (edge.node && sugeridos.length < maxAmount) {
            sugeridos.push({
              username: edge.node.username || '',
              full_name: edge.node.full_name || '',
              profile_pic_url: edge.node.profile_pic_url || '',
              is_verified: edge.node.is_verified || false,
              is_private: edge.node.is_private || false,
              user_id: edge.node.id || edge.node.pk || ''
            });
          }
        });
      }

      // Se ainda não tem suficientes, pegar do edge_mutual_followed_by
      if (sugeridos.length < maxAmount && user.edge_mutual_followed_by?.edges) {
        user.edge_mutual_followed_by.edges.forEach(edge => {
          if (edge.node && sugeridos.length < maxAmount) {
            sugeridos.push({
              username: edge.node.username || '',
              full_name: edge.node.full_name || '',
              profile_pic_url: edge.node.profile_pic_url || '',
              is_verified: edge.node.is_verified || false,
              is_private: edge.node.is_private || false,
              user_id: edge.node.id || edge.node.pk || ''
            });
          }
        });
      }

      return res.status(200).json({
        success: true,
        results: [{
          success: true,
          data: sugeridos.slice(0, maxAmount)
        }]
      });
    }

    // ======================================
    // CAMPO 2: LISTA DE SEGUIDORES
    // ======================================
    if (campo === 'lista_seguidores') {
      const seguidores = [];

      if (user.edge_followed_by?.edges) {
        user.edge_followed_by.edges.forEach(edge => {
          if (edge.node && seguidores.length < maxAmount) {
            seguidores.push({
              username: edge.node.username || '',
              full_name: edge.node.full_name || '',
              profile_pic_url: edge.node.profile_pic_url || '',
              is_verified: edge.node.is_verified || false,
              is_private: edge.node.is_private || false,
              user_id: edge.node.id || edge.node.pk || ''
            });
          }
        });
      }

      return res.status(200).json({
        success: true,
        results: [{
          success: true,
          data: seguidores.slice(0, maxAmount)
        }]
      });
    }

    // ======================================
    // CAMPO 3: LISTA DE POSTS
    // ======================================
    if (campo === 'lista_posts') {
      const posts = [];

      if (user.edge_owner_to_timeline_media?.edges) {
        user.edge_owner_to_timeline_media.edges.forEach(edge => {
          if (edge.node && posts.length < maxAmount) {
            const node = edge.node;
            posts.push({
              id: node.id || '',
              shortcode: node.shortcode || '',
              image_url: node.display_url || node.thumbnail_src || '',
              video_url: node.is_video ? node.video_url : null,
              is_video: node.is_video || false,
              caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
              like_count: node.edge_liked_by?.count || 0,
              comment_count: node.edge_media_to_comment?.count || 0,
              taken_at: node.taken_at_timestamp || 0
            });
          }
        });
      }

      return res.status(200).json({
        success: true,
        results: [{
          success: true,
          data: posts.slice(0, maxAmount)
        }]
      });
    }

    // Campo inválido
    return res.status(400).json({
      error: 'Campo invalido',
      campos_disponiveis: [
        'perfis_sugeridos',
        'lista_seguidores',
        'lista_posts'
      ]
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar dados',
      details: error.message
    });
  }
};
