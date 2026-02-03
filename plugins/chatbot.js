module.exports = {
  commands: [
    {
      name: 'chatbot',
      description: 'Toggle chatbot feature',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.chatbot || 'off';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.chatbot = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}chatbot`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}chatbotmode`, buttonText: { displayText: "⚙️ Set Mode" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*🤖 CHATBOT ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nChatbot is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will automatically respond to messages without prefix.' : 'Bot will only respond to commands with prefix.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Chatbot toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle chatbot*'
          }, { quoted: msg });
        }
      }
    },
    {
      name: 'chatbotmode',
      description: 'Set chatbot mode',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          const mode = args[0]?.toLowerCase();
          const validModes = ['all', 'inbox', 'group', 'off'];
          
          if (!mode || !validModes.includes(mode)) {
            const buttons = [
              { buttonId: `${config.PREFIX}chatbotmode all`, buttonText: { displayText: "🌍 All Chats" }, type: 1 },
              { buttonId: `${config.PREFIX}chatbotmode inbox`, buttonText: { displayText: "📱 Inbox Only" }, type: 1 },
              { buttonId: `${config.PREFIX}chatbotmode group`, buttonText: { displayText: "👥 Groups Only" }, type: 1 },
              { buttonId: `${config.PREFIX}chatbotmode off`, buttonText: { displayText: "❌ Disabled" }, type: 1 }
            ];
            
            return await socket.sendMessage(sender, {
              text: `*🤖 CHATBOT MODE*\n\nSelect where chatbot should respond:\n\n• *all* - All chats (inbox + groups)\n• *inbox* - Private chats only\n• *group* - Group chats only\n• *off* - Disabled\n\nCurrent mode: ${userCfg.chatbotmode || 'not set'}`,
              footer: "Click a button to set mode",
              buttons
            }, { quoted: msg });
          }
          
          let userCfg = await loadUserConfigFromMongo(number) || {};
          userCfg.chatbotmode = mode;
          await setUserConfigInMongo(number, userCfg);
          
          await socket.sendMessage(sender, {
            text: `*✅ CHATBOT MODE SET*\n\nChatbot mode set to: *${mode.toUpperCase()}*\n\nNow chatbot will respond in:\n${mode === 'all' ? '• All chats (inbox + groups)' : mode === 'inbox' ? '• Private chats only' : mode === 'group' ? '• Group chats only' : '• Nowhere (disabled)'}`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Chatbot mode error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to set chatbot mode*'
          }, { quoted: msg });
        }
      }
    },
    {
      name: 'autostatusreply',
      description: 'Toggle auto reply to status',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autostatusreply || 'off';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autostatusreply = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autostatusreply`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*💬 STATUS AUTO-REPLY ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAuto reply to status is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will automatically reply to status updates with AI.' : 'Bot will not reply to status updates.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Status auto-reply toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle status auto-reply*'
          }, { quoted: msg });
        }
      }
    },
    {
      name: 'noprefix',
      description: 'Disable prefix (bot responds without .)',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          userCfg.prefix = '';
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `menu`, buttonText: { displayText: "📜 Test Menu" }, type: 1 },
            { buttonId: `ping`, buttonText: { displayText: "📍 Test Ping" }, type: 1 },
            { buttonId: `${config.PREFIX}setprefix .`, buttonText: { displayText: "🔣 Restore Prefix" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*✅ PREFIX DISABLED*\n\nNow bot will respond without prefix!\n\nTry typing:\n• menu\n• ping\n• help\n\n*Note:* Commands work without . now!`,
            footer: "Prefix removed successfully",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "🚀", key: msg.key } });
          
        } catch (error) {
          console.error('No prefix error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to disable prefix*'
          }, { quoted: msg });
        }
      }
    }
  ]
};
