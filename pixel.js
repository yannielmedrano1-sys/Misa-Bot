/* MISA BOT - PIXEL HANDLER (MASTER FIX) 
   Corrección: Inyección de m.reply para evitar TypeErrors
*/

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { logger } from './config/print.js';

const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const sessionsPath = path.join(process.cwd(), 'sesiones_subbots');

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        
        // --- FIX CRÍTICO: Definición de m.reply ---
        const chat = m.key.remoteJid;
        m.reply = async (text) => {
            return await conn.sendMessage(chat, { text: text }, { quoted: m });
        };
        // ------------------------------------------

        if (chat === 'status@broadcast') return;

        const sender = m.sender || m.key.participant || m.key.remoteJid;
        const misIdentidades = config.owner || [];
        const isOwner = misIdentidades.includes(sender);
        const isGroup = chat.endsWith('@g.us');

        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body) return;

        const allPrefixes = config.allPrefixes || ['#', '!', '.', '/'];
        const foundPrefix = allPrefixes.find(p => body.startsWith(p));
        const usedPrefix = foundPrefix ? foundPrefix : '#';

        let commandName = foundPrefix 
            ? body.slice(foundPrefix.length).trim().split(/ +/).shift().toLowerCase()
            : body.trim().split(/ +/).shift().toLowerCase();

        // --- LÓGICA DE BOT PRIMARIO ---
        if (isGroup) {
            const comandosGestion = ['setprimary', 'delprimary'];
            if (!comandosGestion.includes(commandName)) {
                const myJid = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
                if (fs.existsSync(databasePath)) {
                    let db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
                    if (db[chat]) {
                        const primaryNumber = db[chat].replace(/[^0-9]/g, '');
                        const isSubActive = fs.existsSync(path.join(sessionsPath, primaryNumber));
                        if (isSubActive || primaryNumber === myJid) {
                            if (myJid !== primaryNumber) return; 
                        } else {
                            delete db[chat];
                            fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));
                        }
                    }
                }
            }
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (!cmd) return;
        if (!foundPrefix && !cmd.noPrefix) return;
        if (!isGroup && !isOwner && commandName !== 'code') return;

        // --- VALIDACIONES CON M.REPLY YA FUNCIONANDO ---
        if (cmd.isOwner && !isOwner) {
            return m.reply(`✧ ‧₊˚ *ACCESO DENEGADO* ୧ֹ˖\n\n> Solo mi desarrollador puede usar esto.`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply(`✧ ‧₊˚ *AVISO* ୧ֹ˖\n\n> Comando exclusivo para grupos.`);
        }

        logger(m, conn);

        // Ejecución del comando
        await cmd.run(conn, m, args, usedPrefix, commandName, text, usedPrefix);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};
