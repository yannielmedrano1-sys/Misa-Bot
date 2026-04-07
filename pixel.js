/* KURAYAMI TEAM - PIXEL HANDLER (VERSIÓN DOMINICANA 🇩🇴) 
   Lógica: Identidad Dual + Blindaje de JID
*/

import chalk from 'chalk';
import { logger } from './config/print.js';
import { jidDecode } from '@whiskeysockets/baileys';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 🛠️ FUNCIÓN PARA LIMPIAR IDS (Evita el error de jidDecode)
        const decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        // Extraemos y limpiamos el remitente
        const sender = decodeJid(m.key.participant || m.key.remoteJid || m.sender || '');
        
        // 🛡️ --- TUS IDENTIDADES OFICIALES (SIN +57) ---
        const misIdentidades = [
            '125860308893859@lid',           // Tu ID de Sub-Bot
            '18492797341@s.whatsapp.net',    // Yanniel Principal
            '18297677527@s.whatsapp.net'     // Yanniel Secundario
        ];

        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        // Extracción del cuerpo del mensaje (Body)
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // --- MURO DE PRIVADO ---
        if (!isGroup && !isOwner) {
            if (body.toLowerCase() !== 'code') return; 
        }

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));
       
        // 🧠 --- LÓGICA DE CONVERSACIÓN CONTINUA ---
const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.participant === conn.user.id.split(':')[0] + '@s.whatsapp.net' || 
                     m.message?.extendedTextMessage?.contextInfo?.participant === conn.user.id;

// Si no hay prefijo, pero es una respuesta a Misa...
if (!usedPrefix && isReplyToBot && body) {
    const aiCmd = global.commands.get('ia');
    if (aiCmd) {
        // Forzamos la ejecución del comando IA con el texto actual
        return await aiCmd.run(conn, m, { 
            body, 
            prefix: '', 
            command: 'ia', 
            args: body.split(/ +/), 
            text: body, 
            isOwner, 
            isGroup, 
            from: chat,
            config 
        });
    }
}
        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // Buscar comando o alias en el global.commands
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            if (!usedPrefix && !cmd.noPrefix) return;

            // 🔱 --- VERIFICACIÓN DE OWNER ---
            if (cmd.isOwner && !isOwner) {
                return conn.sendMessage(chat, { 
                    text: `🚫 *ACCESO DENEGADO*\n\nTu ID: \`${sender}\` no está autorizada en el Olimpo de **Misa**.` 
                }, { quoted: m });
            }

            if (cmd.isGroup && !isGroup) {
                return conn.sendMessage(chat, { text: '❌ Comando solo para grupos.' }, { quoted: m });
            }

            // Ejecución
            logger(m, conn);
            await cmd.run(conn, m, { 
                body, 
                prefix: usedPrefix || '', 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                from: chat,
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red('[ERROR EN PIXEL.JS]'), err);
    }
};
