/**
 * Adds a command to edit configurations.
 * 
 * @param {Object} command - The command object.
 * @param {string} command.pattern - The regex pattern to match the command.
 * @param {boolean} command.fromMe - Whether the command is from the user.
 * @param {boolean} command.notAvaliablePersonelChat - Whether the command is not available in personal chat.
 * @param {string} command.desc - The description of the command.
 * @param {string} command.usage - The usage of the command.
 * @param {Function} callback - The callback function to handle the command.
 * @param {Object} msg - The message object.
 * @param {Array} match - The matched patterns from the command.
 * @param {Object} sock - The socket object for sending messages.
 * 
 * @returns {Promise<void>}
*/
const fs = require('fs');
const lang = require(`../language/${database.language}.json`).edit;

addCommand( {pattern: "^edit ?(.*)", access: "sudo", notAvaliablePersonelChat: true, desc: lang.edit_desc, usage: global.handlers[0] + "edit <alive || welcome || goodbye>"}, async (msg, match, sock) => {

    const grupId = msg.key.remoteJid;
    if (!match[1]) {
        const replyText = `${lang.enter_configuration}\n\n${lang.available_configurations} \`\`\`alive, welcome, goodbye\`\`\``;
        if (msg.key.fromMe) {
            return await sock.sendMessage(grupId, { text: replyText, edit: msg.key });
        } else {
            return await sock.sendMessage(grupId, { text: replyText });
        }
    }

    if (!msg.quotedMessage) {
        const replyText = lang.reply_message_needed;
        if (msg.key.fromMe) {
            return await sock.sendMessage(grupId, { text: replyText, edit: msg.key });
        } else {
            return await sock.sendMessage(grupId, { text: replyText });
        }
    }
    /*
        Text Messages = msg.quotedMessage.extendedTextMessage.text 
        Image Messages = msg.quotedMessage.imageMessage
        Video Messages = msg.quotedMessage.videoMessage
        Audio Messages = msg.quotedMessage.audioMessage
        Document Messages = msg.quotedMessage.documentMessage
        Sticker Messages = msg.quotedMessage.stickerMessage
        Location Messages = msg.quotedMessage.locationMessage
        Contact Messages = msg.quotedMessage.contactMessage
        Ptv Messages = msg.quotedMessage.ptvMessage (Video Note)
        View Once Messages = msg.quotedMessage.viewOnceMessage
        View Once V2 Messages = msg.quotedMessage.viewOnceMessageV2
        View Once Messages Extension = msg.quotedMessage.viewOnceMessageV2Extension
    */
    const updateMessage = async (type, mediaPath, content, configType) => {
        const configMap = {
            alive: 'aliveMessage',
            welcome: 'welcomeMessage',
            goodbye: 'goodbyeMessage'
        };
        const configKey = configMap[configType];
        if (configType === 'alive') {
            global.database[configKey] = { type, media: mediaPath ? fs.readFileSync(mediaPath, "base64").toString() : "", content };
        } else {
            let config = global.database[configKey].find(x => x.chat === grupId);
            if (!config) {
                global.database[configKey].push({ chat: grupId, type, media: mediaPath ? fs.readFileSync(mediaPath, "base64").toString() : "", content });
            } else {
                config.type = type;
                config.media = mediaPath ? fs.readFileSync(mediaPath, "base64").toString() : "";
                config.content = content;
            }
        }
        const successMessage = `${lang.success_message_prefix} ${configType.charAt(0).toUpperCase() + configType.slice(1)} ${lang.success_message_suffix}`;
        if (msg.key.fromMe) {
            return await sock.sendMessage(grupId, { text: successMessage, edit: msg.key });
        } else {
            return await sock.sendMessage(grupId, { text: successMessage });
        }
    };

    const { imageMessage, videoMessage, extendedTextMessage } = msg.quotedMessage;
    const configType = match[1];

    if (configType === "alive" || configType === "welcome" || configType === "goodbye") {
        if (imageMessage) {
            const mediaPath = `./${configType}.png`;
            await global.downloadMedia(imageMessage, "image", mediaPath);
            return await updateMessage("image", mediaPath, imageMessage.caption || "", configType);
        } else if (videoMessage) {
            const mediaPath = `./${configType}.mp4`;
            await global.downloadMedia(videoMessage, "video", mediaPath);
            return await updateMessage("video", mediaPath, videoMessage.caption || "", configType);
        } else if (extendedTextMessage) {
            return await updateMessage("text", "", extendedTextMessage.text, configType);
        } else {
            const unsupportedMessage = lang.unsupported_message_type;
            if (msg.key.fromMe) {
                return await sock.sendMessage(grupId, { text: unsupportedMessage, edit: msg.key });
            } else {
                return await sock.sendMessage(grupId, { text: unsupportedMessage });
            }
        }
    }
});
