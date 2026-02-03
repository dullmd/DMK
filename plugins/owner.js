module.exports = {
  commands: [
    {
      name: 'owner',
      description: 'Show owner menu',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo } = context;
        
        try { 
          await socket.sendMessage(sender, { react: { text: "👑", key: msg.key } }); 
        } catch(e){}

        try {
          let userCfg = {};
          try { 
            if (number && typeof loadUserConfigFromMongo === 'function') {
              userCfg = await loadUserConfigFromMongo((number || '').replace(/[^0-9]/g, '')) || {};
            } 
          } catch(e){ 
            userCfg = {};
          }
          
          const title = userCfg.botName || ' © 𝒔𝒊𝒍𝒂 ᴍɪɴɪ';

          const text = `
\`👑 ᴏᴡɴᴇʀ ᴍᴇɴᴜ \`

╭─ 🤖 𝐀𝐈 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒
│ ✦ ${config.PREFIX}developer
│ ✦ ${config.PREFIX}deletemenumber
│ ✦ ${config.PREFIX}bots
╰────────

`.trim();

          const buttons = [
            { buttonId: `${config.PREFIX}developer`, buttonText: { displayText: "📥 ᴄʀᴇᴀᴛᴏʀ" }, type: 1 }
          ];

          await socket.sendMessage(sender, {
            text,
            footer: "👑 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴",
            buttons
          }, { quoted: fakevcard });

        } catch (err) {
          console.error('owner command error:', err);
          try { 
            await socket.sendMessage(sender, { 
              text: '❌ Failed to show owner menu.' 
            }, { quoted: msg }); 
          } catch(e){}
        }
      }
    },
    {
      name: 'developer',
      description: 'Show developer info',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo } = context;
        
        try { 
          await socket.sendMessage(sender, { react: { text: "👑", key: msg.key } }); 
        } catch(e){}

        try {
          let userCfg = {};
          try { 
            if (number && typeof loadUserConfigFromMongo === 'function') {
              userCfg = await loadUserConfigFromMongo((number || '').replace(/[^0-9]/g, '')) || {};
            } 
          } catch(e){ 
            userCfg = {};
          }

          const text = `
\`👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑\`

╭─ 🧑‍💼 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
│
│ ✦ 𝐍𝐚𝐦𝐞 : 𝒔𝒊𝒍𝒂
│ ✦ 𝐀𝐠𝐞  : 17
│ ✦ 𝐍𝐨.  : +255789661031
│
╰────────✧

`.trim();

          const buttons = [
            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "📜 ᴍᴇɴᴜ" }, type: 1 },
          ];

          await socket.sendMessage(sender, {
            text,
            footer: "👑 𝘖𝘸𝘯𝘦𝘳 𝘐𝘯𝘧𝘰𝘳𝘮𝘢𝘵𝘪𝘰𝘯",
            buttons
          }, { quoted: fakevcard });

        } catch (err) {
          console.error('developer command error:', err);
          try { 
            await socket.sendMessage(sender, { 
              text: '❌ Failed to show developer info.' 
            }, { quoted: msg }); 
          } catch(e){}
        }
      }
    }
  ]
};