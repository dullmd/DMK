const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

module.exports = {
  commands: [
    {
      name: 'statuspost',
      alias: ['poststatus', 'uploadstatus', 'spost'],
      description: 'Upload status to group',
      execute: async (socket, sender, args, context) => {
        const { msg, config, fakevcard, getZimbabweanTimestamp } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "📤", key: msg.key } });
          
          // Check if message is quoted
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          
          if (!quoted && args.length === 0) {
            return await socket.sendMessage(sender, {
              text: `*📤 STATUS POST TO GROUP*\n\n*Usage:*\n\`${config.PREFIX}statuspost <text>\`\n\`${config.PREFIX}statuspost [reply to image/video]\`\n\n*Examples:*\n• ${config.PREFIX}statuspost Hello everyone!\n• ${config.PREFIX}statuspost Check out this update!\n\n*Note:* Reply to media to post as status`
            }, { quoted: msg });
          }
          
          // Get target group (default to current group if in group)
          let targetGroup = sender;
          const isGroup = sender.endsWith('@g.us');
          
          if (!isGroup) {
            // If in private chat, ask for group
            if (args.length === 0 || !args[0].includes('@g.us')) {
              return await socket.sendMessage(sender, {
                text: `*📤 POST STATUS TO GROUP*\n\nPlease provide group JID:\n\n*Format:* ${config.PREFIX}statuspost <group-jid> <message>\n*Example:* ${config.PREFIX}statuspost 123456789-123456@g.us Hello!`
              }, { quoted: msg });
            }
            
            targetGroup = args[0];
            args.shift(); // Remove group JID from args
          }
          
          let statusText = args.join(' ');
          let mediaBuffer = null;
          let mediaType = null;
          let mediaCaption = '';
          
          // Handle quoted media
          if (quoted) {
            const mediaTypes = {
              'imageMessage': { type: 'image', prop: 'imageMessage' },
              'videoMessage': { type: 'video', prop: 'videoMessage' },
              'audioMessage': { type: 'audio', prop: 'audioMessage' },
              'documentMessage': { type: 'document', prop: 'documentMessage' }
            };
            
            for (const [key, info] of Object.entries(mediaTypes)) {
              if (quoted[key]) {
                mediaType = info.type;
                const mediaData = quoted[key];
                mediaCaption = mediaData.caption || statusText || '';
                
                try {
                  const stream = await downloadContentFromMessage(mediaData, info.type);
                  let buffer = Buffer.from([]);
                  for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                  }
                  mediaBuffer = buffer;
                  break;
                } catch (error) {
                  console.error('Failed to download media:', error);
                  return await socket.sendMessage(sender, {
                    text: '*❌ Failed to download media. Please try again.*'
                  }, { quoted: msg });
                }
              }
            }
          }
          
          // If no media and no text
          if (!mediaBuffer && !statusText) {
            return await socket.sendMessage(sender, {
              text: '*❌ Please provide text or media to post as status.*'
            }, { quoted: msg });
          }
          
          // Send processing message
          await socket.sendMessage(sender, {
            text: '*⏳ Uploading status to group...*'
          }, { quoted: msg });
          
          // Upload to status
          try {
            if (mediaBuffer) {
              // Upload media status
              const uploadResult = await socket.sendMessage(targetGroup, {
                [mediaType]: mediaBuffer,
                caption: mediaCaption || statusText || `Status posted at ${getZimbabweanTimestamp()}`
              });
              
              console.log(`✅ Media status posted to ${targetGroup}`);
              
              await socket.sendMessage(sender, {
                text: `*✅ STATUS POSTED SUCCESSFULLY!*\n\n*📍 Group:* ${targetGroup}\n*📁 Type:* ${mediaType.toUpperCase()}\n*📝 Caption:* ${mediaCaption || 'No caption'}\n*🕒 Time:* ${getZimbabweanTimestamp()}\n\n*Status has been uploaded to the group!*`
              }, { quoted: msg });
              
            } else {
              // Upload text status
              const uploadResult = await socket.sendMessage(targetGroup, {
                text: `*📢 STATUS UPDATE*\n\n${statusText}\n\n_Posted via SILA MD Bot • ${getZimbabweanTimestamp()}_`
              });
              
              console.log(`✅ Text status posted to ${targetGroup}`);
              
              await socket.sendMessage(sender, {
                text: `*✅ STATUS POSTED SUCCESSFULLY!*\n\n*📍 Group:* ${targetGroup}\n*📝 Content:* ${statusText}\n*🕒 Time:* ${getZimbabweanTimestamp()}\n\n*Status has been posted to the group!*`
              }, { quoted: msg });
            }
            
            await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
            
          } catch (uploadError) {
            console.error('Status upload error:', uploadError);
            await socket.sendMessage(sender, {
              text: `*❌ FAILED TO POST STATUS*\n\nError: ${uploadError.message || 'Unknown error'}\n\nMake sure:\n1. Bot is admin in group\n2. Group exists\n3. Media is valid format`
            }, { quoted: msg });
            await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
          }
          
        } catch (error) {
          console.error('Statuspost command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ An error occurred while posting status.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    {
      name: 'statusimg',
      alias: ['postimg', 'uploadimg'],
      description: 'Upload image status to group',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "🖼️", key: msg.key } });
          
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const hasImage = quoted?.imageMessage;
          
          if (!hasImage && (args.length === 0 || !args[0].startsWith('http'))) {
            return await socket.sendMessage(sender, {
              text: `*🖼️ UPLOAD IMAGE STATUS*\n\n*Usage:*\n\`${config.PREFIX}statusimg [image-url]\`\n\`${config.PREFIX}statusimg [reply to image]\`\n\n*Examples:*\n• ${config.PREFIX}statusimg https://example.com/image.jpg\n• Reply to image with ${config.PREFIX}statusimg`
            }, { quoted: msg });
          }
          
          let imageBuffer = null;
          let caption = args.slice(1).join(' ') || 'Image status';
          
          if (hasImage) {
            // Download quoted image
            try {
              const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              imageBuffer = buffer;
              caption = quoted.imageMessage.caption || caption;
            } catch (error) {
              console.error('Failed to download image:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download image. Please try again.*'
              }, { quoted: msg });
            }
          } else if (args[0].startsWith('http')) {
            // Download from URL
            try {
              const response = await axios.get(args[0], { responseType: 'arraybuffer' });
              imageBuffer = Buffer.from(response.data, 'binary');
            } catch (error) {
              console.error('Failed to download image from URL:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download image from URL. Please check the link.*'
              }, { quoted: msg });
            }
          }
          
          // Get target group
          let targetGroup = sender;
          const isGroup = sender.endsWith('@g.us');
          
          if (!isGroup && args.length >= 2) {
            targetGroup = args[1].includes('@g.us') ? args[1] : `${args[1]}@g.us`;
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Uploading image status...*'
          }, { quoted: msg });
          
          // Upload image status
          await socket.sendMessage(targetGroup, {
            image: imageBuffer,
            caption: `*🖼️ IMAGE STATUS*\n\n${caption}\n\n_Posted via SILA MD Bot_`
          });
          
          await socket.sendMessage(sender, {
            text: `*✅ IMAGE STATUS POSTED!*\n\n📍 *Group:* ${targetGroup}\n📝 *Caption:* ${caption}\n✅ *Status:* Uploaded successfully`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Statusimg command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to upload image status.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    {
      name: 'statusvideo',
      alias: ['postvideo', 'uploadvideo'],
      description: 'Upload video status to group',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "🎬", key: msg.key } });
          
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const hasVideo = quoted?.videoMessage;
          
          if (!hasVideo && (args.length === 0 || !args[0].startsWith('http'))) {
            return await socket.sendMessage(sender, {
              text: `*🎬 UPLOAD VIDEO STATUS*\n\n*Usage:*\n\`${config.PREFIX}statusvideo [video-url]\`\n\`${config.PREFIX}statusvideo [reply to video]\`\n\n*Examples:*\n• ${config.PREFIX}statusvideo https://example.com/video.mp4\n• Reply to video with ${config.PREFIX}statusvideo`
            }, { quoted: msg });
          }
          
          let videoBuffer = null;
          let caption = args.slice(1).join(' ') || 'Video status';
          
          if (hasVideo) {
            // Download quoted video
            try {
              const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              videoBuffer = buffer;
              caption = quoted.videoMessage.caption || caption;
            } catch (error) {
              console.error('Failed to download video:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download video. Please try again.*'
              }, { quoted: msg });
            }
          } else if (args[0].startsWith('http')) {
            // Download from URL
            try {
              const response = await axios.get(args[0], { responseType: 'arraybuffer' });
              videoBuffer = Buffer.from(response.data, 'binary');
            } catch (error) {
              console.error('Failed to download video from URL:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download video from URL. Please check the link.*'
              }, { quoted: msg });
            }
          }
          
          // Get target group
          let targetGroup = sender;
          const isGroup = sender.endsWith('@g.us');
          
          if (!isGroup && args.length >= 2) {
            targetGroup = args[1].includes('@g.us') ? args[1] : `${args[1]}@g.us`;
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Uploading video status...*'
          }, { quoted: msg });
          
          // Upload video status
          await socket.sendMessage(targetGroup, {
            video: videoBuffer,
            caption: `*🎬 VIDEO STATUS*\n\n${caption}\n\n_Posted via SILA MD Bot_`
          });
          
          await socket.sendMessage(sender, {
            text: `*✅ VIDEO STATUS POSTED!*\n\n📍 *Group:* ${targetGroup}\n📝 *Caption:* ${caption}\n✅ *Status:* Uploaded successfully`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Statusvideo command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to upload video status.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    {
      name: 'statusaudio',
      alias: ['postaudio', 'uploadaudio', 'statusvoice'],
      description: 'Upload audio status to group',
      execute: async (socket, sender, args, context) => {
        const { msg, config } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "🎵", key: msg.key } });
          
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const hasAudio = quoted?.audioMessage;
          
          if (!hasAudio && (args.length === 0 || !args[0].startsWith('http'))) {
            return await socket.sendMessage(sender, {
              text: `*🎵 UPLOAD AUDIO STATUS*\n\n*Usage:*\n\`${config.PREFIX}statusaudio [audio-url]\`\n\`${config.PREFIX}statusaudio [reply to audio]\`\n\n*Examples:*\n• ${config.PREFIX}statusaudio https://example.com/audio.mp3\n• Reply to audio with ${config.PREFIX}statusaudio`
            }, { quoted: msg });
          }
          
          let audioBuffer = null;
          let caption = args.slice(1).join(' ') || 'Audio status';
          let ptt = false;
          
          if (hasAudio) {
            // Download quoted audio
            try {
              const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }
              audioBuffer = buffer;
              ptt = quoted.audioMessage.ptt || false;
              caption = quoted.audioMessage.caption || caption;
            } catch (error) {
              console.error('Failed to download audio:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download audio. Please try again.*'
              }, { quoted: msg });
            }
          } else if (args[0].startsWith('http')) {
            // Download from URL
            try {
              const response = await axios.get(args[0], { responseType: 'arraybuffer' });
              audioBuffer = Buffer.from(response.data, 'binary');
            } catch (error) {
              console.error('Failed to download audio from URL:', error);
              return await socket.sendMessage(sender, {
                text: '*❌ Failed to download audio from URL. Please check the link.*'
              }, { quoted: msg });
            }
          }
          
          // Get target group
          let targetGroup = sender;
          const isGroup = sender.endsWith('@g.us');
          
          if (!isGroup && args.length >= 2) {
            targetGroup = args[1].includes('@g.us') ? args[1] : `${args[1]}@g.us`;
          }
          
          await socket.sendMessage(sender, {
            text: '*⏳ Uploading audio status...*'
          }, { quoted: msg });
          
          // Upload audio status
          await socket.sendMessage(targetGroup, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: ptt,
            caption: caption
          });
          
          await socket.sendMessage(sender, {
            text: `*✅ AUDIO STATUS POSTED!*\n\n📍 *Group:* ${targetGroup}\n📝 *Caption:* ${caption}\n🎵 *Type:* ${ptt ? 'Voice Note' : 'Audio'}\n✅ *Status:* Uploaded successfully`
          }, { quoted: msg });
          
          await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
          
        } catch (error) {
          console.error('Statusaudio command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to upload audio status.*'
          }, { quoted: msg });
          await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
        }
      }
    },
    {
      name: 'statuslist',
      alias: ['liststatus', 'mystatus'],
      description: 'List available status posting commands',
      execute: async (socket, sender, args, context) => {
        const { msg, config, fakevcard } = context;
        
        try {
          await socket.sendMessage(sender, { react: { text: "📋", key: msg.key } });
          
          const text = `
*📋 STATUS POSTING COMMANDS*

*📤 General Status Post:*
• \`${config.PREFIX}statuspost <text>\` - Post text status
• \`${config.PREFIX}statuspost [reply to media]\` - Post media as status

*🖼️ Image Status:*
• \`${config.PREFIX}statusimg <image-url>\` - Post image from URL
• \`${config.PREFIX}statusimg [reply to image]\` - Post quoted image

*🎬 Video Status:*
• \`${config.PREFIX}statusvideo <video-url>\` - Post video from URL
• \`${config.PREFIX}statusvideo [reply to video]\` - Post quoted video

*🎵 Audio Status:*
• \`${config.PREFIX}statusaudio <audio-url>\` - Post audio from URL
• \`${config.PREFIX}statusaudio [reply to audio]\` - Post quoted audio
• \`${config.PREFIX}statusvoice\` - Alias for statusaudio

*📍 Posting to Specific Group:*
\`${config.PREFIX}statuspost <group-jid> <message>\`
Example: \`${config.PREFIX}statuspost 123456789-123456@g.us Hello!\`

*📝 Notes:*
1. Bot must be admin in the target group
2. Media size limits apply (16MB for images, 64MB for videos)
3. Supports: JPG, PNG, GIF, MP4, MP3, PDF, etc.
`.trim();
          
          const buttons = [
            { buttonId: `${config.PREFIX}statuspost Hello!`, buttonText: { displayText: "📤 Test Text Status" }, type: 1 },
            { buttonId: `${config.PREFIX}statusimg`, buttonText: { displayText: "🖼️ Image Status" }, type: 1 },
            { buttonId: `${config.PREFIX}statusvideo`, buttonText: { displayText: "🎬 Video Status" }, type: 1 }
          ];
          
          await socket.sendMessage(sender, {
            text,
            footer: "Click buttons to test status posting",
            buttons
          }, { quoted: fakevcard });
          
        } catch (error) {
          console.error('Statuslist command error:', error);
          await socket.sendMessage(sender, {
            text: '*❌ Failed to show status commands.*'
          }, { quoted: msg });
        }
      }
    }
  ]
};
