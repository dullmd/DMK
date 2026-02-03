const axios = require('axios');

module.exports = {
  commands: [
    {
      name: 'menu',
      description: 'Show main menu',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo, getZimbabweanTimestamp } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "🎐", key: msg.key } });
        } catch(e){}

        try {
          const startTime = Date.now(); // In real use, get from socketCreationTime
          const uptime = Math.floor((Date.now() - startTime) / 1000);
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);

          let userCfg = {};
          try { 
            if (number && typeof loadUserConfigFromMongo === 'function') {
              userCfg = await loadUserConfigFromMongo((number || '').replace(/[^0-9]/g, '')) || {};
            }
          } catch(e){ 
            console.warn('menu: failed to load config', e); 
            userCfg = {};
          }

          const title = userCfg.botName || '©𝒔𝒊𝒍𝒂 𝒎𝒅. ᴍɪɴɪ ';

          const text = `
╭─「  \`🤖${title}\`  」 ─➤*  
*│
*│*🥷 *Oᴡɴᴇʀ :* ${config.OWNER_NAME || '𝑺𝑰𝑳𝑨'}
*│*✒️ *Pʀᴇғɪx :* ${config.PREFIX}
*│*🧬 *Vᴇʀsɪᴏɴ :*  ${config.BOT_VERSION || 'ʟᴀᴛᴇsᴛ'}
*│*🎈 *Pʟᴀᴛғᴏʀᴍ :* ${process.env.PLATFORM || 'Hᴇʀᴏᴋᴜ'}
*│*⏰ *Uᴘᴛɪᴍᴇ :* ${hours}h ${minutes}m ${seconds}s
*╰──────●●➤*

╭────────￫
│  🔧ғᴇᴀᴛᴜʀᴇs                  
│  [1] 👑 ᴏᴡɴᴇʀ                           
│  [2] 📥 ᴅᴏᴡɴʟᴏᴀᴅ                           
│  [3] 🛠️ ᴛᴏᴏʟs                            
│  [4] ⚙️ sᴇᴛᴛɪɴɢs                       
│  [5] 🎨 ᴄʀᴇᴀᴛɪᴠᴇ                             
╰───────￫

🎯 ᴛᴀᴘ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ!

`.trim();

          const buttons = [
            { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: "👑 ᴏᴡɴᴇʀ" }, type: 1 },
            { buttonId: `${config.PREFIX}download`, buttonText: { displayText: "📥 ᴅᴏᴡɴʟᴏᴀᴅ" }, type: 1 },
            { buttonId: `${config.PREFIX}tools`, buttonText: { displayText: "🛠️ ᴛᴏᴏʟs" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ 𝘚𝘦𝘵𝘵𝘪𝘯𝘨𝘴" }, type: 1 },
            { buttonId: `${config.PREFIX}creative`, buttonText: { displayText: "🎨 ᴄʀᴇᴀᴛɪᴠᴇ" }, type: 1 },
          ];

          const defaultImg = "https://files.catbox.moe/36vahk.png";
          const useLogo = userCfg.logo || defaultImg;

          let imagePayload;
          if (String(useLogo).startsWith('http')) {
            imagePayload = { url: useLogo };
          } else {
            try { 
              const fs = require('fs');
              imagePayload = fs.readFileSync(useLogo); 
            } catch(e){ 
              imagePayload = { url: defaultImg }; 
            }
          }

          await socket.sendMessage(sender, {
            image: imagePayload,
            caption: text,
            footer: "*▶ ● 𝑺𝑰𝑳𝑨.𝑴𝑫 𝐁𝙾𝚃 *",
            buttons,
            headerType: 4
          }, { quoted: fakevcard });

        } catch (err) {
          console.error('menu command error:', err);
          try { 
            await socket.sendMessage(sender, { 
              text: '❌ Failed to show menu.' 
            }, { quoted: msg }); 
          } catch(e){}
        }
      }
    }
  ]
};