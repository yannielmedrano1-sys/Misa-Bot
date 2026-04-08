/* KURAYAMI TEAM - PIXEL HANDLER (VERSIÓN FINAL CON REPLY) 
   Lógica: Identidad Dual + Auto-IA en Reply
*/

import chalk from 'chalk';
import { logger } from './config/print.js';
import { jidDecode } from '@whiskeysockets/baileys';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        const sender = decodeJid(m.key.participant || m.key.remoteJid || m.sender || '');
        const botNumber = decodeJid(conn.user.id); // Limpiamos la ID del bot

        const misIdentidades = [
            '125860308893859@lid',
            '18492797341@s.whatsapp.net',
            '18297677527@s.whatsapp.net'
        ];

        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));

        // 🧠 --- LÓGICA DE CONVERSACIÓN CONTINUA (REPLY) ---
        // Obtenemos quién es el dueño del mensaje al que estamos respondiendo
        const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant;
        const isReplyToBot = decodeJid(quotedParticipant) === botNumber;

        if (!usedPrefix && isReplyToBot && body) {
            const aiCmd = global.commands.get('ia');
            if (aiCmd) {
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

        // --- MURO DE PRIVADO (Después del reply para no bloquear la IA) ---
        if (!isGroup && !isOwner && !isReplyToBot) {
            if (body.toLowerCase() !== 'code') return; 
        }

        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            if (!usedPrefix && !cmd.noPrefix) return;

            if (cmd.isOwner && !isOwner) {
                return conn.sendMessage(chat, { 
                    text: `🚫 *ACCESO DENEGADO*\n\nTu ID: \`${sender}\` no está autorizada.` 
                }, { quoted: m });
            }

            if (cmd.isGroup && !isGroup) {
                return conn.sendMessage(chat, { text: '❌ Comando solo para grupos.' }, { quoted: m });
            }

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
