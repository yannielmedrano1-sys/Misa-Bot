/* KURAYAMI TEAM - PIXEL HANDLER (VERSIÓN DEFINITIVA ANTI-CRASH) 
   Lógica: Identidad Dual + Auto-IA en Reply + Seguridad de JID
*/

import chalk from 'chalk';
import { logger } from './config/print.js';
import { jidDecode } from '@whiskeysockets/baileys';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        
        // --- 🛡️ SEGURIDAD INICIAL: VALIDAR JID DEL CHAT ---
        const chat = m.key.remoteJid;
        if (!chat || chat === 'status@broadcast') return;

        // --- DECODE JID ULTRA-SEGURO ---
        const decodeJid = (jid) => {
            if (!jid || typeof jid !== 'string') return jid;
            try {
                if (jid.includes('@')) {
                    const decode = jidDecode(jid);
                    if (decode && decode.user && decode.server) {
                        return `${decode.user}@${decode.server}`;
                    }
                }
                return jid;
            } catch {
                return jid;
            }
        };

        // Limpiamos identidades principales
        const sender = decodeJid(m.key.participant || m.sender || chat || '');
        const botNumber = conn.user?.id ? decodeJid(conn.user.id) : ''; 

        const misIdentidades = [
            '125860308893859@lid',
            '18492797341@s.whatsapp.net',
            '18297677527@s.whatsapp.net'
        ];

        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        // --- EXTRACCIÓN DE BODY ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));

        // 🧠 --- LÓGICA DE REPLY A IA ---
        const quotedParticipant = m.message?.extendedTextMessage?.contextInfo?.participant;
        const isReplyToBot = botNumber && decodeJid(quotedParticipant) === botNumber;

        if (!usedPrefix && isReplyToBot && body) {
            const aiCmd = global.commands.get('ia');
            if (aiCmd) {
                return await aiCmd.run(conn, m, { 
                    body, prefix: '', command: 'ia', args: body.split(/ +/), 
                    text: body, isOwner, isGroup, from: chat, config 
                });
            }
        }

        // --- MURO DE PRIVADO ---
        if (!isGroup && !isOwner && !isReplyToBot) {
            if (body.toLowerCase() !== 'code') return; 
        }

        // --- PARSEO DE COMANDO ---
        let commandName = usedPrefix 
            ? body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // 🛡️ BLOQUEO SI EL GRUPO ESTÁ EN OFF
            if (isGroup && global.db?.data?.chats?.[chat]?.isBanned && !isOwner) return;

            if (!usedPrefix && !cmd.noPrefix) return;

            // 🛡️ VALIDACIÓN DE DUEÑO
            if (cmd.isOwner && !isOwner) {
                // Aquí el JID 'chat' DEBE ser válido, si no, jidDecode en sendMessage crasheará
                return conn.sendMessage(chat, { 
                    text: `🚫 *ACCESO DENEGADO*\n\nTu ID: \`${sender}\` no autorizada.` 
                }, { quoted: m });
            }

            if (cmd.isGroup && !isGroup) {
                return conn.sendMessage(chat, { text: '❌ Solo grupos.' }, { quoted: m });
            }

            // --- EJECUCIÓN ---
            logger(m, conn);
            try {
                await cmd.run(conn, m, { 
                    body, prefix: usedPrefix || '', command: commandName, 
                    args, text, isOwner, isGroup, from: chat, config 
                });
            } catch (cmdError) {
                console.error(chalk.red(`[ERROR EN COMANDO ${commandName}]`), cmdError);
            }
        }

    } catch (err) {
        console.error(chalk.red('[ERROR CRÍTICO EN PIXEL.JS]'), err);
    }
};
