module.exports = {
  commands: [
    {
      name: 'tools',
      description: 'Show tools menu',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo } = context;
        
        try { 
          await socket.sendMessage(sender, { react: { text: "🔧", key: msg.key } }); 
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
          
          const title = userCfg.botName || ' © 𝒔𝒊𝒍𝒂 𝒎𝒅 ᴍɪɴɪ';
          
          const text = `
\`🛠️ Tᴏᴏʟs ᴍᴇɴᴜ 🛠️\`

╭─ 📊 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒
│ ✦ ${config.PREFIX}ping
│ ✦ ${config.PREFIX}alive
╰─────

╭─ 🔐 𝐏𝐀𝐈𝐑𝐈𝐍𝐆
│ ✦ ${config.PREFIX}pair [number]
│ ✦ ${config.PREFIX}paircode [number]
╰─────

╭─ 📤 𝐒𝐓𝐀𝐓𝐔𝐒 𝐏𝐎𝐒𝐓𝐈𝐍𝐆
│ ✦ ${config.PREFIX}statuspost [text/media]
│ ✦ ${config.PREFIX}statusimg [image]
│ ✦ ${config.PREFIX}statusvideo [video]
│ ✦ ${config.PREFIX}statusaudio [audio]
╰─────

> More tools coming soon...

`.trim();

          const buttons = [
            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "📜 ᴍᴇɴᴜ" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ sᴇᴛᴛɪɴɢs" }, type: 1 },
            { buttonId: `${config.PREFIX}pair`, buttonText: { displayText: "🔐 ᴘᴀɪʀ" }, type: 1 },
            { buttonId: `${config.PREFIX}statuspost`, buttonText: { displayText: "📤 sᴛᴀᴛᴜs" }, type: 1 }
          ];

          await socket.sendMessage(sender, {
            text,
            footer: "🔧 𝘛𝘰𝘰𝘭𝘴 𝘊𝘰𝘮𝘮𝘢𝘯𝘥𝘴",
            buttons
          }, { quoted: fakevcard });

        } catch (err) {
          console.error('tools command error:', err);
          try { 
            await socket.sendMessage(sender, { 
              text: '❌ Failed to show tools menu.' 
            }, { quoted: msg }); 
          } catch(e){}
        }
      }
    }
  ]
};
