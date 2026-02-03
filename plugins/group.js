const fs = require('fs');

module.exports = {
  commands: [
    {
      name: 'group',
      alias: ['grouptools', 'groupmenu'],
      description: 'Group management tools',
      execute: async (socket, sender, args, context) => {
        const { msg, config, fakevcard } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "👥", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: `*👥 GROUP MANAGEMENT*\n\nThis command works only in groups!\n\nJoin a group and use:\n\`${config.PREFIX}group\`\nor\n\`${config.PREFIX}grouptools\``
            }, { quoted: msg });
          }
          
          // Get group metadata
          let groupInfo = {};
          try {
            groupInfo = await socket.groupMetadata(sender);
          } catch (error) {
            console.error('Failed to get group info:', error);
          }
          
          const text = `
*👥 GROUP MANAGEMENT MENU*

*📊 Group Info:*
• *Name:* ${groupInfo.subject || 'Unknown'}
• *ID:* ${groupInfo.id || 'N/A'}
• *Participants:* ${groupInfo.participants?.length || 0}
• *Created:* ${groupInfo.creation ? new Date(groupInfo.creation * 1000).toLocaleDateString() : 'N/A'}

*🔧 ADMIN COMMANDS:*
• ${config.PREFIX}add <number> - Add member
• ${config.PREFIX}kick @tag - Remove member
• ${config.PREFIX}promote @tag - Make admin
• ${config.PREFIX}demote @tag - Remove admin
• ${config.PREFIX}tagall - Mention all members
• ${config.PREFIX}infogroup - Group information

*⚙️ GROUP SETTINGS:*
• ${config.PREFIX}setname <name> - Change group name
• ${config.PREFIX}setdesc <text> - Change description
• ${config.PREFIX}open - Open group
• ${config.PREFIX}close - Close group (admins only)
• ${config.PREFIX}antilink on/off - Toggle anti-link

*👤 MEMBER COMMANDS:*
• ${config.PREFIX}linkgroup - Get invite link
• ${config.PREFIX}members - List members
• ${config.PREFIX}admins - List admins
• ${config.PREFIX}myrank - Check your status
• ${config.PREFIX}leave - Leave group

*💡 Tips:* Tag users with @mention or use their numbers
`.trim();
          
          const buttons = [
            { buttonId: `${config.PREFIX}infogroup`, buttonText: { displayText: "📊 Group Info" }, type: 1 },
            { buttonId: `${config.PREFIX}tagall`, buttonText: { displayText: "📍 Tag All" }, type: 1 },
            { buttonId: `${config.PREFIX}linkgroup`, buttonText: { displayText: "🔗 Get Link" }, type: 1 },
            { buttonId: `${config.PREFIX}members`, buttonText: { displayText: "👥 Members" }, type: 1 },
            { buttonId: `${config.PREFIX}admins`, buttonText: { displayText: "👑 Admins" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text,
            footer: "Group Management Tools",
            buttons,
            headerType: 1
          }, { quoted: fakevcard });
          
        } catch (error) {
          console.error('Group command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to show group menu.*'
          }, { quoted: msg });
        }
      }
    },
    
    // 1. ADD MEMBER
    {
      name: 'add',
      description: 'Add member to group',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "➕", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          if (args.length === 0) {
            return await socket.sendMessage(sender, {
              text: `*➕ ADD MEMBER*\n\n*Usage:*\n\`${config.PREFIX}add <number>\`\n*Example:*\n${config.PREFIX}add 255789661031\n\n*Note:* Bot must be admin to add members`
            }, { quoted: msg });
          }
          
          // Check if bot is admin
          try {
            const groupInfo = await socket.groupMetadata(sender);
            const botJid = socket.user.id;
            const isBotAdmin = groupInfo.participants.find(p => p.id === botJid)?.admin === 'admin' || 
                              groupInfo.participants.find(p => p.id === botJid)?.admin === 'superadmin';
            
            if (!isBotAdmin) {
              return await socket.sendMessage(sender, {
                text: '*❌ I need to be admin to add members!*'
              }, { quoted: msg });
            }
          } catch (error) {
            console.error('Failed to check admin status:', error);
          }
          
          const numbers = args.map(num => {
            let cleanNum = num.replace(/[^0-9]/g, '');
            if (!cleanNum.startsWith('255')) {
              if (cleanNum.startsWith('0')) {
                cleanNum = '255' + cleanNum.substring(1);
              } else {
                cleanNum = '255' + cleanNum;
              }
            }
            return cleanNum + '@s.whatsapp.net';
          });
          
          await socket.sendMessage(sender, {
            text: `*⏳ Adding ${numbers.length} member(s)...*`
          }, { quoted: msg });
          
          const results = [];
          for (const number of numbers) {
            try {
              await socket.groupParticipantsUpdate(sender, [number], 'add');
              results.push(`✅ ${number.split('@')[0]}`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between adds
            } catch (error) {
              results.push(`❌ ${number.split('@')[0]} - ${error.message || 'Failed'}`);
            }
          }
          
          const resultText = results.join('\n');
          await socket.sendMessage(sender, {
            text: `*➕ ADD MEMBER RESULTS*\n\n${resultText}\n\n*Total:* ${results.length} processed`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Add command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to add members. Make sure bot is admin and numbers are valid.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    
    // 2. KICK MEMBER
    {
      name: 'kick',
      alias: ['remove', 'ban'],
      description: 'Remove member from group',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "🚫", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          // Check if mentioned or provided number
          const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          
          if (!mentionedJid && args.length === 0) {
            return await socket.sendMessage(sender, {
              text: `*🚫 KICK MEMBER*\n\n*Usage:*\n\`${config.PREFIX}kick @mention\`\n\`${config.PREFIX}kick <number>\`\n\n*Example:*\nReply to message with ${config.PREFIX}kick\nor\n${config.PREFIX}kick @username`
            }, { quoted: msg });
          }
          
          const targetJid = mentionedJid || (args[0].includes('@') ? args[0] : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
          
          // Check if user is trying to kick themselves
          const senderJid = msg.key.participant || msg.key.remoteJid;
          if (targetJid === senderJid) {
            return await socket.sendMessage(sender, {
              text: '*❌ You cannot kick yourself! Use .leave instead.*'
            }, { quoted: msg });
          }
          
          // Check if trying to kick bot
          const botJid = socket.user.id;
          if (targetJid === botJid) {
            return await socket.sendMessage(sender, {
              text: '*❌ You cannot kick the bot!*'
            }, { quoted: msg });
          }
          
          await socket.sendMessage(sender, {
            text: `*🚫 Removing member...*`
          }, { quoted: msg });
          
          await socket.groupParticipantsUpdate(sender, [targetJid], 'remove');
          
          const username = targetJid.split('@')[0];
          await socket.sendMessage(sender, {
            text: `*✅ MEMBER KICKED*\n\n*User:* ${username}\n*Action:* Removed from group\n*By:* ${senderJid.split('@')[0]}`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Kick command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to kick member. Make sure bot is admin and you have permission.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    
    // 3. PROMOTE TO ADMIN
    {
      name: 'promote',
      alias: ['admin', 'makeadmin'],
      description: 'Promote member to admin',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "👑", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          
          if (!mentionedJid && args.length === 0) {
            return await socket.sendMessage(sender, {
              text: `*👑 PROMOTE TO ADMIN*\n\n*Usage:*\n\`${config.PREFIX}promote @mention\`\n\`${config.PREFIX}promote <number>\`\n\n*Example:*\nReply to message with ${config.PREFIX}promote\nor\n${config.PREFIX}promote @username`
            }, { quoted: msg });
          }
          
          const targetJid = mentionedJid || (args[0].includes('@') ? args[0] : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
          
          await socket.sendMessage(sender, {
            text: `*👑 Promoting to admin...*`
          }, { quoted: msg });
          
          await socket.groupParticipantsUpdate(sender, [targetJid], 'promote');
          
          const username = targetJid.split('@')[0];
          await socket.sendMessage(sender, {
            text: `*✅ ADMIN PROMOTED*\n\n*User:* ${username}\n*Status:* Now group admin\n*Congratulations!* 🎉`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "🎉", key: msg.key } });
          
        } catch (error) {
          console.error('Promote command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to promote member. Make sure bot is admin and you have permission.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    
    // 4. DEMOTE ADMIN
    {
      name: 'demote',
      alias: ['removeadmin', 'unadmin'],
      description: 'Demote admin to member',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "📉", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          
          if (!mentionedJid && args.length === 0) {
            return await socket.sendMessage(sender, {
              text: `*📉 DEMOTE ADMIN*\n\n*Usage:*\n\`${config.PREFIX}demote @mention\`\n\`${config.PREFIX}demote <number>\`\n\n*Example:*\nReply to message with ${config.PREFIX}demote\nor\n${config.PREFIX}demote @username`
            }, { quoted: msg });
          }
          
          const targetJid = mentionedJid || (args[0].includes('@') ? args[0] : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
          
          // Check if trying to demote self
          const senderJid = msg.key.participant || msg.key.remoteJid;
          if (targetJid === senderJid) {
            return await socket.sendMessage(sender, {
              text: '*❌ You cannot demote yourself!*'
            }, { quoted: msg });
          }
          
          await socket.sendMessage(sender, {
            text: `*📉 Demoting admin...*`
          }, { quoted: msg });
          
          await socket.groupParticipantsUpdate(sender, [targetJid], 'demote');
          
          const username = targetJid.split('@')[0];
          await socket.sendMessage(sender, {
            text: `*✅ ADMIN DEMOTED*\n\n*User:* ${username}\n*Status:* Now regular member`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Demote command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to demote admin. Make sure bot is admin and you have permission.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    
    // 5. TAG ALL MEMBERS
    {
      name: 'tagall',
      alias: ['mentionall', 'everyone'],
      description: 'Tag all group members',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "📍", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          // Check if bot is admin
          try {
            const groupInfo = await socket.groupMetadata(sender);
            const botJid = socket.user.id;
            const isBotAdmin = groupInfo.participants.find(p => p.id === botJid)?.admin === 'admin' || 
                              groupInfo.participants.find(p => p.id === botJid)?.admin === 'superadmin';
            
            if (!isBotAdmin) {
              return await socket.sendMessage(sender, {
                text: '*❌ I need to be admin to tag all members!*'
              }, { quoted: msg });
            }
          } catch (error) {
            console.error('Failed to check admin status:', error);
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Getting members list...*'
          }, { quoted: msg });
          
          const groupInfo = await socket.groupMetadata(sender);
          const participants = groupInfo.participants || [];
          
          if (participants.length === 0) {
            return await socket.sendMessage(sender, {
              text: '*❌ No members found in this group!*'
            }, { quoted: msg });
          }
          
          const message = args.join(' ') || 'Attention everyone! 👋';
          
          // Create mention text
          let mentionText = `*📍 TAG ALL MEMBERS*\n\n${message}\n\n`;
          
          // Add mentions (max 20 to avoid message too long)
          const maxMentions = Math.min(participants.length, 20);
          const mentionedJids = [];
          
          for (let i = 0; i < maxMentions; i++) {
            const participant = participants[i];
            mentionText += `@${participant.id.split('@')[0]} `;
            mentionedJids.push(participant.id);
          }
          
          if (participants.length > 20) {
            mentionText += `\n\n...and ${participants.length - 20} more members`;
          }
          
          mentionText += `\n\n*Total Members:* ${participants.length}`;
          
          await socket.sendMessage(sender, {
            text: mentionText,
            mentions: mentionedJids
          });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Tagall command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to tag members. Make sure bot is admin.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    
    // BONUS: GROUP INFO
    {
      name: 'infogroup',
      alias: ['groupinfo', 'ginfo'],
      description: 'Show group information',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "📊", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Getting group information...*'
          }, { quoted: msg });
          
          const groupInfo = await socket.groupMetadata(sender);
          
          // Count admins and members
          let adminCount = 0;
          let superAdminCount = 0;
          let memberCount = 0;
          
          groupInfo.participants.forEach(p => {
            if (p.admin === 'superadmin') superAdminCount++;
            else if (p.admin === 'admin') adminCount++;
            else memberCount++;
          });
          
          const creationDate = groupInfo.creation ? new Date(groupInfo.creation * 1000).toLocaleString() : 'Unknown';
          
          const text = `
*📊 GROUP INFORMATION*

*🔹 Basic Info:*
• *Name:* ${groupInfo.subject || 'Unknown'}
• *ID:* ${groupInfo.id}
• *Description:* ${groupInfo.desc || 'No description'}
• *Created:* ${creationDate}

*👥 Participants:*
• *Total:* ${groupInfo.participants.length}
• *Super Admins:* ${superAdminCount}
• *Admins:* ${adminCount}
• *Members:* ${memberCount}

*⚙️ Settings:*
• *Announcement:* ${groupInfo.announce ? '✅ Enabled' : '❌ Disabled'}
• *Restricted:* ${groupInfo.restrict ? '✅ Yes' : '❌ No'}
• *Ephemeral:* ${groupInfo.ephemeralDuration ? `${groupInfo.ephemeralDuration} seconds` : '❌ Disabled'}

*👑 Group Creator:*
${groupInfo.owner ? `• ${groupInfo.owner.split('@')[0]}` : '• Unknown'}
`.trim();
          
          const buttons = [
            { buttonId: `${config.PREFIX}members`, buttonText: { displayText: "👥 Members" }, type: 1 },
            { buttonId: `${config.PREFIX}admins`, buttonText: { displayText: "👑 Admins" }, type: 1 },
            { buttonId: `${config.PREFIX}linkgroup`, buttonText: { displayText: "🔗 Get Link" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text,
            footer: "Group Information",
            buttons,
            headerType: 1
          }, { quoted: msg });
          
        } catch (error) {
          console.error('Infogroup command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to get group information.*'
          }, { quoted: msg });
        }
      }
    },
    
    // BONUS: LIST MEMBERS
    {
      name: 'members',
      alias: ['listmembers'],
      description: 'List all group members',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "👥", key: msg.key } });
          
          const isGroup = sender.endsWith('@g.us');
          if (!isGroup) {
            return await socket.sendMessage(sender, {
              text: '*❌ This command works only in groups!*'
            }, { quoted: msg });
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Getting members list...*'
          }, { quoted: msg });
          
          const groupInfo = await socket.groupMetadata(sender);
          const participants = groupInfo.participants || [];
          
          if (participants.length === 0) {
            return await socket.sendMessage(sender, {
              text: '*❌ No members found in this group!*'
            }, { quoted: msg });
          }
          
          let memberList = '*👥 GROUP MEMBERS LIST*\n\n';
          let adminList = '*👑 ADMINS:*\n';
          let memberCount = 0;
          let adminCount = 0;
          
          participants.forEach((p, index) => {
            const number = p.id.split('@')[0];
            const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
            
            if (isAdmin) {
              adminCount++;
              adminList += `${adminCount}. ${number} ${p.admin === 'superadmin' ? '👑' : '⭐'}\n`;
            } else {
              memberCount++;
              if (memberCount <= 50) { // Limit display to 50 members
                memberList += `${memberCount}. ${number}\n`;
              }
            }
          });
          
          if (memberCount > 50) {
            memberList += `\n...and ${memberCount - 50} more members`;
          }
          
          memberList += `\n*📊 STATISTICS:*\n• Total: ${participants.length}\n• Admins: ${adminCount}\n• Members: ${memberCount}`;
          
          // Send in multiple messages if too long
          await socket.sendMessage(sender, {
            text: adminList + '\n' + memberList
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Members command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to get members list.*'
          }, { quoted: msg });
        }
      }
    }
  ]
};
