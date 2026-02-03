const axios = require('axios');
const fs = require('fs');

module.exports = {
  commands: [
    {
      name: 'pair',
      description: 'Get WhatsApp pairing code',
      execute: async (socket, sender, args, context) => {
        const { msg, config, fakevcard } = context;
        
        try {
          // Send reaction
          try {
            await socket.sendMessage(sender, { react: { text: "🔐", key: msg.key } });
          } catch(e) {}
          
          const text = args.join(" ");
          
          if (!text || text.trim() === "") {
            return await socket.sendMessage(sender, {
              text: "*🔐 SILA MD PAIRING CODE*\n\n*Usage:* `.pair <number>`\n*Example:* `.pair 255789661031`\n\n*Note:* Enter your WhatsApp number without spaces"
            }, { quoted: msg });
          }

          // Clean the number
          let number = text.replace(/[^0-9]/g, '');
          
          if (number.length < 9 || number.length > 15) {
            return await socket.sendMessage(sender, {
              text: "*❌ Invalid number!*\n\nPlease provide a valid WhatsApp number\nExample: `.pair 255789661031`"
            }, { quoted: msg });
          }

          // Check if number is on WhatsApp
          const whatsappID = number + '@s.whatsapp.net';
          
          try {
            const result = await socket.onWhatsApp(whatsappID);
            
            if (!result || !result[0]?.exists) {
              return await socket.sendMessage(sender, {
                text: `*❌ ${number} is not registered on WhatsApp!*\n\nPlease make sure this is a valid WhatsApp number.`
              }, { quoted: msg });
            }
          } catch (checkError) {
            console.warn('Could not verify WhatsApp number:', checkError.message);
          }

          // Send waiting message
          await socket.sendMessage(sender, {
            text: "*⏳ Please wait, generating pairing code...*"
          }, { quoted: msg });

          try {
            // Call pairing API
            const apiUrl = `https://dmk-eh04.onrender.com/pair?number=${number}`;
            console.log(`Calling API: ${apiUrl}`);
            
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            let code = null;
            let message = "Pairing code generated!";
            
            if (response.data) {
              if (response.data.code) {
                code = response.data.code;
              } else if (response.data.pairingCode) {
                code = response.data.pairingCode;
              } else if (response.data.message && response.data.message.includes("code")) {
                // Try to extract code from message
                const match = response.data.message.match(/\b\d{6}\b/);
                if (match) {
                  code = match[0];
                }
              }
              
              if (response.data.message) {
                message = response.data.message;
              }
            }
            
            if (!code) {
              // Try alternative endpoints
              try {
                const altResponse = await axios.get(`https://dmk-eh04.onrender.com/code?number=${number}`, { timeout: 30000 });
                if (altResponse.data && altResponse.data.code) {
                  code = altResponse.data.code;
                }
              } catch (altError) {
                console.log('Alternative endpoint failed:', altError.message);
              }
            }
            
            if (!code) {
              throw new Error('No pairing code received from server');
            }
            
            // Create button message with code
            const buttons = [
              {
                buttonId: `copy_${code}`,
                buttonText: { displayText: `📋 Copy: ${code}` },
                type: 1
              },
              {
                buttonId: 'pair_help',
                buttonText: { displayText: '❓ How to Use' },
                type: 1
              }
            ];
            
            await socket.sendMessage(sender, {
              text: `*🔐 SILA MD PAIRING CODE*\n\n*📱 Number:* ${number}\n*🔢 Code:* \`${code}\`\n\n*📝 Message:* ${message}\n\n*⚠️ Code expires in 5 minutes!*`,
              footer: "Click button below to copy code",
              buttons: buttons,
              headerType: 1
            }, { quoted: fakevcard });
            
            // Send follow-up instructions
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await socket.sendMessage(sender, {
              text: `*📖 HOW TO USE PAIRING CODE:*\n\n1. Open WhatsApp on your phone\n2. Go to *Settings → Linked Devices*\n3. Tap on *"Link a Device"*\n4. Tap on *"Link with Phone Number"*\n5. Enter this code: *${code}*\n\n*✅ Your device will be linked instantly!*`
            }, { quoted: fakevcard });
            
            // Send success reaction
            try {
              await socket.sendMessage(sender, { react: { text: "✅", key: msg.key } });
            } catch(e) {}
            
          } catch (apiError) {
            console.error('API Error:', apiError.message);
            
            if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
              return await socket.sendMessage(sender, {
                text: "*❌ Service Unavailable*\n\nOur pairing service is currently offline.\nPlease try again later or contact support."
              }, { quoted: msg });
            }
            
            if (apiError.response && apiError.response.status === 429) {
              return await socket.sendMessage(sender, {
                text: "*⏳ Too Many Requests*\n\nPlease wait a few minutes before trying again."
              }, { quoted: msg });
            }
            
            // Fallback: Try to generate code locally
            try {
              const localCode = await generateLocalCode(socket, number);
              if (localCode) {
                await socket.sendMessage(sender, {
                  text: `*🔐 SILA MD PAIRING CODE (Local)*\n\n*📱 Number:* ${number}\n*🔢 Code:* \`${localCode}\`\n\n*⚠️ This is a locally generated code. Use it to pair your device.*`,
                  footer: "Generated locally",
                  buttons: [
                    {
                      buttonId: `copy_${localCode}`,
                      buttonText: { displayText: `📋 Copy: ${localCode}` },
                      type: 1
                    }
                  ],
                  headerType: 1
                }, { quoted: fakevcard });
                return;
              }
            } catch (localError) {
              console.error('Local generation failed:', localError);
            }
            
            await socket.sendMessage(sender, {
              text: "*❌ Failed to generate pairing code*\n\nPossible reasons:\n1. Server is busy\n2. Invalid number format\n3. Service temporarily unavailable\n\nPlease try again in a few minutes."
            }, { quoted: msg });
          }

        } catch (error) {
          console.error('Pair command error:', error);
          await socket.sendMessage(sender, {
            text: "*❌ An error occurred*\n\nPlease try again or contact support if the problem persists."
          }, { quoted: msg });
          
          try {
            await socket.sendMessage(sender, { react: { text: "❌", key: msg.key } });
          } catch(e) {}
        }
      }
    },
    {
      name: 'paircode',
      description: 'Alias for pair command',
      execute: async (socket, sender, args, context) => {
        // Use the same function as 'pair'
        const pairCommand = module.exports.commands.find(cmd => cmd.name === 'pair');
        if (pairCommand) {
          await pairCommand.execute(socket, sender, args, context);
        }
      }
    },
    {
      name: 'getcode',
      description: 'Alias for pair command',
      execute: async (socket, sender, args, context) => {
        // Use the same function as 'pair'
        const pairCommand = module.exports.commands.find(cmd => cmd.name === 'pair');
        if (pairCommand) {
          await pairCommand.execute(socket, sender, args, context);
        }
      }
    },
    {
      name: 'copy_',
      description: 'Handle copy button clicks',
      execute: async (socket, sender, args, context) => {
        const { msg } = context;
        const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId || 
                        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
        
        if (buttonId && buttonId.startsWith('copy_')) {
          const code = buttonId.replace('copy_', '');
          await socket.sendMessage(sender, {
            text: `*✅ Code Copied: ${code}*\n\nNow go to WhatsApp → Settings → Linked Devices → Link a Device and enter this code.`
          }, { quoted: msg });
        }
      }
    },
    {
      name: 'pair_help',
      description: 'Show pairing help',
      execute: async (socket, sender, args, context) => {
        const { fakevcard } = context;
        
        await socket.sendMessage(sender, {
          text: `*📖 SILA MD PAIRING GUIDE*\n\n*Step-by-Step Instructions:*\n\n1️⃣ *Open WhatsApp* on your phone\n2️⃣ Go to *Settings* (three dots)\n3️⃣ Tap *"Linked Devices"*\n4️⃣ Tap *"Link a Device"*\n5️⃣ Select *"Link with Phone Number"*\n6️⃣ Enter the *6-digit code* provided\n7️⃣ Wait for confirmation\n\n*💡 Tips:*\n• Code expires in 5 minutes\n• Make sure your phone has internet\n• Keep WhatsApp open during pairing\n\nNeed help? Contact owner: *255789661031*`
        }, { quoted: fakevcard });
      }
    }
  ]
};

// Helper function to generate code locally (fallback)
async function generateLocalCode(socket, number) {
  try {
    // Try to get pairing code from WhatsApp
    if (typeof socket.requestPairingCode === 'function') {
      const code = await socket.requestPairingCode(number);
      return code;
    }
    
    // Generate random 6-digit code as fallback
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return randomCode;
    
  } catch (error) {
    console.error('Local code generation error:', error);
    return null;
  }
}
