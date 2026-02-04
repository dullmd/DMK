module.exports = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['🌸', '🪴', '💫', '🍂', '🌟','🫀', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
    FREE_IMAGE: 'https://files.catbox.moe/36vahk.png',
    NEWSLETTER_JID: '120363402325089913@newsletter',
    
    // ✅ SUPPORT/VALIDATION NEWSLETTER
    SUPPORT_NEWSLETTER: {
        jid: '120363402325089913@newsletter',
        emojis: ['❤️', '🌟', '🔥', '💯'],
        name: 'SILA MD',
        description: 'Bot updates & support channel'
    },
    
    // ✅ Default newsletters
    DEFAULT_NEWSLETTERS: [
        {
            jid: '120363402325089913@newsletter',
            emojis: ['❤️', '🌟', '🔥', '💯'],
            name: 'SILA MD',
            description: 'Free Channel'
        }
    ],
    
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: process.env.OWNER_NUMBER || '923141613159',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
    BOT_NAME: '𝑺𝑰𝑳𝑨-𝑴𝑫',
    BOT_VERSION: '1.0.2',
    OWNER_NAME: '𝑺𝑰𝑳𝑨',
    IMAGE_PATH: 'https://files.catbox.moe/36vahk.png',
    BOT_FOOTER: '> 𝒑𝒐𝒘𝒆𝒓.𝒃𝒚𝒆 𝒔𝒊𝒍𝒂',
    BUTTON_IMAGES: { ALIVE: 'https://files.catbox.moe/36vahk.png' }
};

// ---------------- MONGO SETUP ----------------
const MONGO_URI = process.env.MONGODB || "mongodb+srv://sila_md:sila0022@sila.67mxtd7.mongodb.net/?appName=sila";
const MONGO_DB = process.env.MONGO_DB || 'SILA-MD';

