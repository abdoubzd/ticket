// Netlify Serverless Function for Discord API
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Helper function to make Discord API requests
async function discordRequest(endpoint, token, options = {}) {
  const url = `${DISCORD_API_BASE}${endpoint}`;
  
  const headers = {
    'Authorization': `Bot ${token}`,
    'Content-Type': 'application/json',
  };

  // Add audit log reason if provided
  if (options.reason) {
    headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle no content response
  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      error: true,
      status: response.status,
      message: data.message || `HTTP Error ${response.status}`,
      code: data.code,
    };
  }

  return data;
}

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, token, guildId, userId, duration, reason } = body;

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: true, message: 'Token is required' }),
      };
    }

    let result;

    switch (action) {
      // Validate bot token
      case 'validate-token': {
        result = await discordRequest('/users/@me', token);
        
        if (result.error) {
          if (result.status === 401) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ 
                error: true, 
                message: 'توكن البوت غير صالح أو منتهي الصلاحية' 
              }),
            };
          }
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        if (!result.bot) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: true, 
              message: 'التوكن المدخل ليس توكن بوت' 
            }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      // Get guild info
      case 'get-guild': {
        if (!guildId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID is required' }),
          };
        }

        result = await discordRequest(`/guilds/${guildId}?with_counts=true`, token);

        if (result.error) {
          if (result.status === 403 || result.code === 50001) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ 
                error: true, 
                message: 'البوت غير موجود في هذا السيرفر' 
              }),
            };
          }
          if (result.status === 404) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ 
                error: true, 
                message: 'السيرفر غير موجود. تأكد من صحة الآيدي' 
              }),
            };
          }
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      // Get guild channels
      case 'get-channels': {
        if (!guildId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID is required' }),
          };
        }

        result = await discordRequest(`/guilds/${guildId}/channels`, token);

        if (result.error) {
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      // Get guild members
      case 'get-members': {
        if (!guildId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID is required' }),
          };
        }

        const limit = body.limit || 100;
        result = await discordRequest(`/guilds/${guildId}/members?limit=${limit}`, token);

        if (result.error) {
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      }

      // Kick member
      case 'kick-member': {
        if (!guildId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID and User ID are required' }),
          };
        }

        result = await discordRequest(
          `/guilds/${guildId}/members/${userId}`,
          token,
          { method: 'DELETE', reason: reason || 'تم الطرد من لوحة التحكم' }
        );

        if (result.error) {
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      // Ban member
      case 'ban-member': {
        if (!guildId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID and User ID are required' }),
          };
        }

        result = await discordRequest(
          `/guilds/${guildId}/bans/${userId}`,
          token,
          { 
            method: 'PUT', 
            body: { delete_message_days: 0 },
            reason: reason || 'تم الحظر من لوحة التحكم'
          }
        );

        if (result.error) {
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      // Timeout member
      case 'timeout-member': {
        if (!guildId || !userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: true, message: 'Guild ID and User ID are required' }),
          };
        }

        const durationMinutes = duration || 60;
        const timeoutUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

        result = await discordRequest(
          `/guilds/${guildId}/members/${userId}`,
          token,
          { 
            method: 'PATCH', 
            body: { communication_disabled_until: timeoutUntil }
          }
        );

        if (result.error) {
          return {
            statusCode: result.status || 500,
            headers,
            body: JSON.stringify({ error: true, message: result.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: true, message: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: true, 
        message: error.message || 'Internal server error' 
      }),
    };
  }
};
