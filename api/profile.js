const axios = require('axios');

/**
 * Instagram Profile API - Serverless Function
 * Endpoint: /api/profile?username=USERNAME
 */

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get username from query
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'Username é obrigatório'
    });
  }
  
  // Clean username
  const cleanUsername = username.replace(/^@+/, '').trim();
  
  try {
    // METHOD 1: Instagram Web Profile API
    const profile = await getInstagramProfile(cleanUsername);
    
    if (profile) {
      return res.status(200).json({
        success: true,
        data: profile
      });
    }
    
    // METHOD 2: Fallback HTML Scraping
    const profileFallback = await getInstagramProfileFallback(cleanUsername);
    
    if (profileFallback) {
      return res.status(200).json({
        success: true,
        data: profileFallback
      });
    }
    
    return res.status(404).json({
      success: false,
      error: 'Perfil não encontrado'
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil'
    });
  }
};

/**
 * METHOD 1: Instagram Web Profile API
 */
async function getInstagramProfile(username) {
  try {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)',
        'X-IG-App-ID': '936619743392459',
        'X-ASBD-ID': '198387',
        'X-IG-WWW-Claim': '0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://www.instagram.com/${encodeURIComponent(username)}/`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      timeout: 15000
    });
    
    if (!response.data || !response.data.data || !response.data.data.user) {
      return null;
    }
    
    const user = response.data.data.user;
    
    return {
      pk: user.id || '',
      username: user.username || username,
      full_name: user.full_name || '',
      biography: user.biography || '',
      profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || '',
      is_private: user.is_private || false,
      is_verified: user.is_verified || false,
      is_business: user.is_business_account || false,
      media_count: user.edge_owner_to_timeline_media?.count || 0,
      follower_count: user.edge_followed_by?.count || 0,
      following_count: user.edge_follow?.count || 0,
      external_url: user.external_url || '',
      category: user.category_name || ''
    };
    
  } catch (error) {
    console.error('Method 1 failed:', error.message);
    return null;
  }
}

/**
 * METHOD 2: Fallback - HTML Scraping
 */
async function getInstagramProfileFallback(username) {
  try {
    const url = `https://www.instagram.com/${encodeURIComponent(username)}/?__a=1&__d=dis`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.instagram.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    const html = response.data;
    
    // Try to extract JSON from HTML
    const jsonMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      
      if (data.mainEntityofPage) {
        const userData = data.mainEntityofPage;
        
        return {
          pk: '',
          username: username,
          full_name: userData.name || '',
          biography: userData.description || '',
          profile_pic_url: userData.image || '',
          is_private: false,
          is_verified: false,
          is_business: false,
          media_count: 0,
          follower_count: 0,
          following_count: 0,
          external_url: '',
          category: ''
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Method 2 failed:', error.message);
    return null;
  }
}
