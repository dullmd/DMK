module.exports = {
  commands: [
    {
      name: 'help',
      description: 'Show help menu',
      execute: async (socket, sender, args, context) => {
        const { msg, config, fakevcard } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "❓", key: msg.key } });
          
          const text = `
*🆘 SILA MD HELP MENU*

*🔧 BASIC COMMANDS:*
• ${config.PREFIX}menu - Show main menu
• ${config.PREFIX}ping - Check bot latency
• ${config.PREFIX}alive - Check if bot is online
• ${config.PREFIX}help - This help menu

*🔐 PAIRING COMMANDS:*
• ${config.PREFIX}pair <number> - Get pairing code
• ${config.PREFIX}paircode <number> - Alias for pair
• ${config.PREFIX}getcode <number> - Alias for pair

*⚙️ SETTINGS COMMANDS:*
• ${config.PREFIX}settings - Bot settings menu
• ${config.PREFIX}autotyping - Toggle typing indicator
• ${config.PREFIX}autoread - Toggle auto read
• ${config.PREFIX}autoreaction - Toggle auto reaction
• ${config.PREFIX}autostatusview - Toggle status view
• ${config.PREFIX}autostatuslike - Toggle status like
• ${config.PREFIX}antidelete - Toggle anti-delete
• ${config.PREFIX}welcome - Toggle welcome message
• ${config.PREFIX}setprefix <symbol> - Change prefix
• ${config.PREFIX}setname <name> - Change bot name
• ${config.PREFIX}reset - Reset all settings

*👑 OWNER COMMANDS:*
• ${config.PREFIX}owner - Owner menu
• ${config.PREFIX}developer - Developer info
• ${config.PREFIX}bots - List active sessions
• ${config.PREFIX}deleteme - Delete your session

*📥 DOWNLOAD COMMANDS:*
• ${config.PREFIX}download - Download menu
• ${config.PREFIX}song <name> - Download music
• ${config.PREFIX}tiktok <url> - Download TikTok

*🎨 CREATIVE COMMANDS:*
• ${config.PREFIX}creative - Creative tools
• ${config.PREFIX}ai <prompt> - Chat with AI

*📌 EXAMPLES:*
• \`.pair 255789661031\` - Get pairing code
• \`.autotyping\` - Toggle typing indicator
• \`.setprefix !\` - Change prefix to !
• \`.setname SILA PRO\` - Change bot name
• \`.song afrobeat\` - Download music
• \`.ai hello\` - Chat with AI

*💡 TIP:* Use buttons in menus for easier navigation!
`.trim();
          
          const buttons = [
            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: "📜 ᴍᴇɴᴜ" }, type: 1 },
            { buttonId: `${config.PREFIX}pair`, buttonText: { displayText: "🔐 ᴘᴀɪʀ" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ sᴇᴛᴛɪɴɢs" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text,
            footer: "Need more help? Contact: 255789661031",
            buttons
          }, { quoted: fakevcard });

        } catch (error) {
          console.error('Help command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to show help menu*'
          }, { quoted: msg });
        }
      }
    }
  ]
};
