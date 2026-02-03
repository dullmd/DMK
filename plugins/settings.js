module.exports = {
  commands: [
    {
      name: 'settings',
      description: 'Bot settings menu',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, fakevcard, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "⚙️", key: msg.key } });
          
          let userCfg = {};
          try {
            userCfg = await loadUserConfigFromMongo(number) || {};
          } catch(e) {
            console.warn('Failed to load user config:', e);
          }
          
          // Default settings
          const settings = {
            autotyping: userCfg.autotyping || 'on',
            autoread: userCfg.autoread || 'on',
            autoreaction: userCfg.autoreaction || 'on',
            autostatusview: userCfg.autostatusview || 'on',
            autostatuslike: userCfg.autostatuslike || 'on',
            antidelete: userCfg.antidelete || 'on',
            welcome: userCfg.welcome || 'on',
            botName: userCfg.botName || config.BOT_NAME_FREE,
            prefix: userCfg.prefix || config.PREFIX
          };
          
          const text = `
*⚙️ SILA MD SETTINGS MENU*

*📊 CURRENT SETTINGS:*

🤖 *Bot Name:* ${settings.botName}
🔣 *Prefix:* ${settings.prefix}

*🔧 FEATURE STATUS:*
• ✍️ Autotyping: ${settings.autotyping === 'on' ? '✅ ON' : '❌ OFF'}
• 👁️ Autoread: ${settings.autoread === 'on' ? '✅ ON' : '❌ OFF'}
• ❤️ Autoreaction: ${settings.autoreaction === 'on' ? '✅ ON' : '❌ OFF'}
• 📸 Status View: ${settings.autostatusview === 'on' ? '✅ ON' : '❌ OFF'}
• 👍 Status Like: ${settings.autostatuslike === 'on' ? '✅ ON' : '❌ OFF'}
• 🗑️ Anti-Delete: ${settings.antidelete === 'on' ? '✅ ON' : '❌ OFF'}
• 🎉 Welcome Msg: ${settings.welcome === 'on' ? '✅ ON' : '❌ OFF'}

*💡 Use commands below to toggle features*
`.trim();
          
          const buttons = [
            { buttonId: `${config.PREFIX}autotyping`, buttonText: { displayText: "✍️ Autotyping" }, type: 1 },
            { buttonId: `${config.PREFIX}autoread`, buttonText: { displayText: "👁️ Autoread" }, type: 1 },
            { buttonId: `${config.PREFIX}autoreaction`, buttonText: { displayText: "❤️ Autoreaction" }, type: 1 }
          ];
          
          const buttons2 = [
            { buttonId: `${config.PREFIX}autostatusview`, buttonText: { displayText: "📸 Status View" }, type: 1 },
            { buttonId: `${config.PREFIX}autostatuslike`, buttonText: { displayText: "👍 Status Like" }, type: 1 },
            { buttonId: `${config.PREFIX}antidelete`, buttonText: { displayText: "🗑️ Anti-Delete" }, type: 1 }
          ];
          
          const buttons3 = [
            { buttonId: `${config.PREFIX}welcome`, buttonText: { displayText: "🎉 Welcome Msg" }, type: 1 },
            { buttonId: `${config.PREFIX}setprefix`, buttonText: { displayText: "🔣 Set Prefix" }, type: 1 },
            { buttonId: `${config.PREFIX}setname`, buttonText: { displayText: "🤖 Set Bot Name" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text,
            footer: "Tap buttons to toggle features",
            buttons,
            headerType: 1
          }, { quoted: fakevcard });
          
          // Send second row of buttons
          await new Promise(resolve => setTimeout(resolve, 500));
          await socket.sendMessage(sender, {
            text: "_ _", // Empty text for buttons only
            buttons: buttons2,
            headerType: 1
          }, { quoted: fakevcard });
          
          // Send third row of buttons
          await new Promise(resolve => setTimeout(resolve, 500));
          await socket.sendMessage(sender, {
            text: "_ _", // Empty text for buttons only
            buttons: buttons3,
            headerType: 1
          }, { quoted: fakevcard });
          
        } catch (error) {
          console.error('Settings command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to show settings menu*'
          }, { quoted: msg });
        }
      }
    },
    
    // Autotyping toggle
    {
      name: 'autotyping',
      description: 'Toggle autotyping feature',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autotyping || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autotyping = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autotyping`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*✍️ AUTOTYPING ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAutotyping is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will show typing indicator when you message.' : 'Bot will not show typing indicator.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Autotyping toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle autotyping*'
          }, { quoted: msg });
        }
      }
    },
    
    // Autoread toggle
    {
      name: 'autoread',
      description: 'Toggle autoread feature',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autoread || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autoread = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autoread`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*👁️ AUTOREAD ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAutoread is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will mark messages as read automatically.' : 'Bot will not mark messages as read.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Autoread toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle autoread*'
          }, { quoted: msg });
        }
      }
    },
    
    // Autoreaction toggle
    {
      name: 'autoreaction',
      description: 'Toggle autoreaction feature',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autoreaction || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autoreaction = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autoreaction`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*❤️ AUTOREACTION ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAutoreaction is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will auto-react to messages.' : 'Bot will not auto-react to messages.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Autoreaction toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle autoreaction*'
          }, { quoted: msg });
        }
      }
    },
    
    // Autostatus View toggle
    {
      name: 'autostatusview',
      description: 'Toggle auto status view',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autostatusview || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autostatusview = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autostatusview`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*📸 STATUS VIEW ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAuto Status View is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will automatically view status updates.' : 'Bot will not view status updates.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Autostatus view toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle status view*'
          }, { quoted: msg });
        }
      }
    },
    
    // Autostatus Like toggle
    {
      name: 'autostatuslike',
      description: 'Toggle auto status like',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.autostatuslike || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.autostatuslike = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}autostatuslike`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*👍 STATUS LIKE ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAuto Status Like is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will automatically like status updates.' : 'Bot will not like status updates.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Autostatus like toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle status like*'
          }, { quoted: msg });
        }
      }
    },
    
    // Anti-Delete toggle
    {
      name: 'antidelete',
      description: 'Toggle anti-delete feature',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.antidelete || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.antidelete = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}antidelete`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*🗑️ ANTI-DELETE ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nAnti-Delete is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will notify when messages are deleted.' : 'Bot will not notify about deleted messages.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Anti-delete toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle anti-delete*'
          }, { quoted: msg });
        }
      }
    },
    
    // Welcome message toggle
    {
      name: 'welcome',
      description: 'Toggle welcome message',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          let userCfg = await loadUserConfigFromMongo(number) || {};
          const current = userCfg.welcome || 'on';
          const newStatus = current === 'on' ? 'off' : 'on';
          
          userCfg.welcome = newStatus;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${config.PREFIX}welcome`, buttonText: { displayText: newStatus === 'on' ? "❌ Turn OFF" : "✅ Turn ON" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*🎉 WELCOME MESSAGE ${newStatus === 'on' ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\nWelcome Message is now *${newStatus}*. ${newStatus === 'on' ? 'Bot will send welcome message when added to groups.' : 'Bot will not send welcome message.'}`,
            footer: "Click button to toggle again",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: newStatus === 'on' ? "✅" : "❌", key: msg.key } });
          
        } catch (error) {
          console.error('Welcome toggle error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to toggle welcome message*'
          }, { quoted: msg });
        }
      }
    },
    
    // Set prefix
    {
      name: 'setprefix',
      description: 'Change bot prefix',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          const newPrefix = args[0];
          
          if (!newPrefix || newPrefix.length > 2) {
            const buttons = [
              { buttonId: `${config.PREFIX}setprefix .`, buttonText: { displayText: "🔣 Set ." }, type: 1 },
              { buttonId: `${config.PREFIX}setprefix !`, buttonText: { displayText: "🔣 Set !" }, type: 1 },
              { buttonId: `${config.PREFIX}setprefix #`, buttonText: { displayText: "🔣 Set #" }, type: 1 },
              { buttonId: `${config.PREFIX}setprefix /`, buttonText: { displayText: "🔣 Set /" }, type: 1 },
              { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
            ];
            
            return await socket.sendMessage(sender, {
              text: `*🔣 SET BOT PREFIX*\n\nCurrent prefix: *${config.PREFIX}*\n\n*Usage:* \`.setprefix <symbol>\`\n*Example:* \`.setprefix !\`\n\n*Available symbols:* . ! # / $ % & * +`,
              footer: "Click a button or type command",
              buttons
            }, { quoted: msg });
          }
          
          let userCfg = await loadUserConfigFromMongo(number) || {};
          userCfg.prefix = newPrefix;
          await setUserConfigInMongo(number, userCfg);
          
          const buttons = [
            { buttonId: `${newPrefix}menu`, buttonText: { displayText: `📜 Test ${newPrefix}menu` }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*✅ PREFIX UPDATED*\n\nNew prefix set to: *${newPrefix}*\n\nNow use commands like:\n*${newPrefix}menu*\n*${newPrefix}ping*\n*${newPrefix}help*`,
            footer: "Prefix changed successfully",
            buttons
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Set prefix error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to set prefix*'
          }, { quoted: msg });
        }
      }
    },
    
    // Set bot name
    {
      name: 'setname',
      description: 'Change bot name',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          const newName = args.join(' ');
          
          if (!newName || newName.trim() === '') {
            const suggestions = [
              "SILA MD PRO",
              "SILA BOT",
              "SILA AI",
              "SILA MINI",
              "SILA TECH"
            ];
            
            const buttons = suggestions.map(name => ({
              buttonId: `${config.PREFIX}setname ${name}`,
              buttonText: { displayText: `🤖 ${name}` },
              type: 1
            }));
            
            buttons.push({ buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "⚙️ Back to Settings" }, type: 1 });
            
            return await socket.sendMessage(sender, {
              text: `*🤖 SET BOT NAME*\n\nCurrent name: *${config.BOT_NAME_FREE}*\n\n*Usage:* \`.setname <new name>\`\n*Example:* \`.setname SILA MD PRO\`\n\n*Max length:* 30 characters`,
              footer: "Click a suggestion or type your own",
              buttons
            }, { quoted: msg });
          }
          
          if (newName.length > 30) {
            return await socket.sendMessage(sender, {
              text: '*❌ Name too long!*\n\nMaximum 30 characters allowed.'
            }, { quoted: msg });
          }
          
          let userCfg = await loadUserConfigFromMongo(number) || {};
          userCfg.botName = newName;
          await setUserConfigInMongo(number, userCfg);
          
          await socket.sendMessage(sender, {
            text: `*✅ BOT NAME UPDATED*\n\nNew bot name: *${newName}*\n\nThe name will appear in menus and messages.`,
            footer: "Name changed successfully"
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Set name error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to set bot name*'
          }, { quoted: msg });
        }
      }
    },
    
    // Reset all settings
    {
      name: 'reset',
      description: 'Reset all settings to default',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, loadUserConfigFromMongo, setUserConfigInMongo } = context;
        
        try {
          const buttons = [
            { buttonId: `${config.PREFIX}confirmreset`, buttonText: { displayText: "✅ Yes, Reset" }, type: 1 },
            { buttonId: `${config.PREFIX}settings`, buttonText: { displayText: "❌ Cancel" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text: `*⚠️ RESET SETTINGS*\n\nAre you sure you want to reset ALL settings to default?\n\nThis will reset:\n• All feature toggles\n• Bot name\n• Prefix\n• Custom settings\n\n*This action cannot be undone!*`,
            footer: "Click to confirm or cancel",
            buttons
          }, { quoted: msg });
          
        } catch (error) {
          console.error('Reset error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to show reset menu*'
          }, { quoted: msg });
        }
      }
    },
    
    // Confirm reset
    {
      name: 'confirmreset',
      description: 'Confirm reset settings',
      execute: async (socket, sender, args, context) => {
        const { msg, number, config, setUserConfigInMongo } = context;
        
        try {
          // Reset to default settings
          const defaultSettings = {
            autotyping: 'on',
            autoread: 'on',
            autoreaction: 'on',
            autostatusview: 'on',
            autostatuslike: 'on',
            antidelete: 'on',
            welcome: 'on',
            botName: config.BOT_NAME_FREE,
            prefix: config.PREFIX
          };
          
          await setUserConfigInMongo(number, defaultSettings);
          
          await socket.sendMessage(sender, {
            text: `*✅ SETTINGS RESET*\n\nAll settings have been reset to default values.\n\n• Bot Name: ${config.BOT_NAME_FREE}\n• Prefix: ${config.PREFIX}\n• All features: ON`,
            footer: "Settings reset successfully"
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "🔄", key: msg.key } });
          
          // Show settings menu again
          const settingsCmd = module.exports.commands.find(cmd => cmd.name === 'settings');
          if (settingsCmd) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await settingsCmd.execute(socket, sender, [], context);
          }
          
        } catch (error) {
          console.error('Confirm reset error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to reset settings*'
          }, { quoted: msg });
        }
      }
    }
  ]
};
