/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Soporte Multi-Prefijo y LID Sync
*/

import { syncLid } from './lid/resolver.js'; 

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;

        // 1. LID SYNC (Reconocimiento de Owner Pase lo que pase)
        try { 
            m.sender = await syncLid(conn, m, chat); 
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. Extraer Body
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body) return;

        // 3. LÓGICA DE PREFIJO DINÁMICO
        // Revisamos si el mensaje empieza con el prefijo ACTUAL de la config
        const activePrefix = config.prefix;
        const isCmd = body.startsWith(activePrefix);
        
        // Extraer el nombre del comando
        let commandName = '';
        if (isCmd) {
            commandName = body.slice(activePrefix.length).trim().split(/ +/).shift().toLowerCase();
        } else {
            // Lógica NO-PREFIX: toma la primera palabra directamente
            commandName = body.trim().split(/ +/).shift().toLowerCase();
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. Validaciones de Identidad
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat.endsWith('@g.us');

        // 5. Búsqueda del Comando
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // REGLA DE ORO: Si no hay prefijo, solo responde si el comando permite 'noPrefix'
            if (!isCmd && !cmd.noPrefix) return; 

            // Filtros de Owner y Grupo
            if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso exclusivo al Desarrollador.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Este comando es para grupos.');

            // Ejecución
            await cmd.run(conn, m, { 
                body, 
                prefix: activePrefix, // Aquí siempre pasará el prefijo activo (#, ! o .)
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(err);
    }
};