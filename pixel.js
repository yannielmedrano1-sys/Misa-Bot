/* MISA BOT - PIXEL HANDLER (MASTER FIX CUSTOM) 
   Lógica: Gestión de prefijos, Muro de Privado y Control de Bot Primario
*/

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { logger } from './config/print.js';

// Rutas absolutas
const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const sessionsPath = path.join(process.cwd(), 'sesiones_subbots');

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
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

        // --- GESTIÓN DE PREFIJOS (MISA STYLE) ---
        const allPrefixes = config.allPrefixes || ['#', '!', '.', '/'];
        const foundPrefix = allPrefixes.find(p => body.startsWith(p));

        // Fix Crítico para evitar 'undefined' en comandos sin prefijo
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
        
        // El bot responde si hay prefijo real O si el comando es noPrefix
        if (!foundPrefix && !cmd.noPrefix) return;

        // --- MURO DE PRIVADO ---
        if (!isGroup && !isOwner && commandName !== 'code') return;

        // --- VALIDACIONES DE USUARIO (MISA THEME) ---
        if (cmd.isOwner && !isOwner) {
            return m.reply(`✧ ‧₊˚ *MISA BOT: ACCESO RESTRINGIDO* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Usuario\`: @${sender.split('@')[0]}\n✰ \`Estado\`: No autorizado\n\n> Solo mi desarrollador puede ejecutar este comando.`);
        }

        if (cmd.isGroup && !isGroup) {
            return m.reply(`✧ ‧₊˚ *MISA BOT: INFO* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ Este comando está diseñado exclusivamente para grupos.\n\n> ¡Únete a un chat grupal para usarlo!`);
        }

        logger(m, conn);

        // PASO DE ARGUMENTOS AL COMANDO (Compatible con tu lógica actual)
        await cmd.run(conn, m, args, usedPrefix, commandName, text, usedPrefix);

    } catch (err) {
        console.error(chalk.red('[ERROR EN MISA-HANDLER]'), err);
    }
};
