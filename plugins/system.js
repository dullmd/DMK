const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
  commands: [
    {
      name: 'deleteme',
      description: 'Delete current session',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo, loadAdminsFromMongo } = context;
        
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const nowsender = msg.key.fromMe ? (socket.user.id.split(':')[0] + '@s.whatsapp.net' || socket.user.id) : (msg.key.participant || msg.key.remoteJid);
        const senderNum = (nowsender || '').split('@')[0];
        const ownerNum = config.OWNER_NUMBER.replace(/[^0-9]/g, '');

        if (senderNum !== sanitized && senderNum !== ownerNum) {
          await socket.sendMessage(sender, { 
            text: '❌ Permission denied. Only the session owner or the bot owner can delete this session.' 
          }, { quoted: msg });
          return;
        }

        try {
          // Remove from MongoDB
          const sessionsCol = require('../pair.js').sessionsCol;
          const numbersCol = require('../pair.js').numbersCol;
          
          if (sessionsCol) {
            await sessionsCol.deleteOne({ number: sanitized });
          }
          if (numbersCol) {
            await numbersCol.deleteOne({ number: sanitized });
          }

          // Remove session folder
          const sessionPath = path.join(os.tmpdir(), `session_${sanitized}`);
          try {
            if (fs.existsSync(sessionPath)) {
              fs.removeSync(sessionPath);
              console.log(`Removed session folder: ${sessionPath}`);
            }
          } catch (e) {
            console.warn('Failed removing session folder', e);
          }

          // Close socket
          try {
            if (typeof socket.logout === 'function') {
              await socket.logout().catch(err => console.warn('logout error (ignored):', err?.message || err));
            }
          } catch (e) { 
            console.warn('socket.logout failed:', e?.message || e); 
          }
          
          try { 
            socket.ws?.close(); 
          } catch (e) { 
            console.warn('ws close failed:', e?.message || e); 
          }

          // Remove from active sockets
          const activeSockets = require('../pair.js').activeSockets;
          const socketCreationTime = require('../pair.js').socketCreationTime;
          
          activeSockets.delete(sanitized);
          socketCreationTime.delete(sanitized);

          await socket.sendMessage(sender, {
            image: { url: config.IMAGE_PATH },
            caption: `*🗑️ SESSION DELETED*\n\n*✅ Your session has been successfully deleted from MongoDB and local storage.*\n\n> *${config.BOT_FOOTER}*`
          }, { quoted: fakevcard });

          console.log(`Session ${sanitized} deleted by ${senderNum}`);
        } catch (err) {
          console.error('deleteme command error:', err);
          await socket.sendMessage(sender, { 
            text: `❌ Failed to delete session: ${err.message || err}` 
          }, { quoted: msg });
        }
      }
    },
    {
      name: 'ping',
      description: 'Check bot latency',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo } = context;
        
        try {
          const sanitized = (number || '').replace(/[^0-9]/g, '');
          const cfg = await loadUserConfigFromMongo(sanitized) || {};
          const botName = cfg.botName || config.BOT_NAME_FREE;
          const logo = cfg.logo || config.IMAGE_PATH;

          const latency = Date.now() - (msg.messageTimestamp * 1000 || Date.now());

          const text = `
*📡 ${botName} ᴘɪɴɢ ɴᴏᴡ*

*◈ 🛠️ 𝐋atency :*  ${latency}ms
*◈ 🕢 𝐒erver 𝐓ime :* ${new Date().toLocaleString()}
`;

          let imagePayload = String(logo).startsWith('http') ? { url: logo } : fs.readFileSync(logo);

          await socket.sendMessage(sender, {
            image: imagePayload,
            caption: text,
            footer: `*${botName} ᴘɪɴɢ*`,
            buttons: [{ buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "📜ᴍᴇɴᴜ" }, type: 1 }],
            headerType: 4
          }, { quoted: fakevcard });

        } catch(e) {
          console.error('ping error', e);
          await socket.sendMessage(sender, { text: '❌ Failed to get ping.' }, { quoted: msg });
        }
      }
    }
  ]
};