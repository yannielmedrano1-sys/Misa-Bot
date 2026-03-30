import chalk from 'chalk';

/**
 * Logger personalizado para Sub-Bots
 * @param {import('@whiskeysockets/baileys').WASocket} conn 
 * @param {Object} m 
 */
export const socketLogger = (m, conn) => {
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const name = m.pushName || 'Sub-Bot User';
    const sender = isGroup ? m.key.participant : from;
    const senderNumber = sender.split('@')[0];
    
    // Detectar tipo de mensaje
    const type = Object.keys(m.message)[0];
    const body = (type === 'conversation') ? m.message.conversation : 
                 (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                 (type === 'imageMessage') ? '[Imagen]' : 
                 (type === 'videoMessage') ? '[Video]' : '[Otro]';

    console.log(
        chalk.magenta(`[SUB-BOT]`) + 
        chalk.blue(`[${new Date().toLocaleTimeString()}]`) + 
        chalk.cyan(` ${name} (${senderNumber}): `) + 
        chalk.white(body.length > 50 ? body.substring(0, 50) + '...' : body) +
        (isGroup ? chalk.yellow(` (Grupo: ${from.split('@')[0]})`) : '')
    );
};