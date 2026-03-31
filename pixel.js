/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Lógica: Multi-Prefijo Activo + No-Prefix Permanente + Persistent UI
*/

import chalk from 'chalk';
import { syncLid } from './lid/resolver.js'; 
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- MOTOR LID ---
        try { m.sender = await syncLid(conn, m, chat); } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. --- EXTRACCIÓN DE BODY ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // 3. --- LÓGICA DE DETECCIÓN (LA QUE NECESITAS) ---
        // Los 3 prefijos siempre deben responder, no importa cuál sea el 'visual'
        const allPrefixes = ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));
        
        // El prefijo visual para el menú siempre será el que esté en config.prefix
        const visualPrefix = config.prefix || '#';

        let commandName = '';
        let isCmd = false;

        if (usedPrefix) {
            isCmd = true;
            commandName = body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase();
        } else {
            // Si no usó prefijo, tomamos la primera palabra (Lógica No-Prefix)
            isCmd = false;
            commandName = body.trim().split(/ +/).shift().toLowerCase();
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. --- VALIDACIONES ---
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat ? chat.endsWith('@g.us') : false;

        logger(m, conn);

        // 5. --- EJECUCIÓN ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // SIEMPRE responde si es comando con prefijo (# ! .) 
            // O SIEMPRE responde si es un comando diseñado para No-Prefix
            if (!isCmd && !cmd.noPrefix) return; 

            if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso exclusivo.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Solo grupos.');

            await cmd.run(conn, m, { 
                body, 
                prefix: visualPrefix, // Aquí pasamos el que tú elegiste para que el menú salga con ese
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red.bold('[ERROR]'), err);
    }
};