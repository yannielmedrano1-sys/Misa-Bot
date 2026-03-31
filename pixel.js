/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Soporte para Cambio de Prefijo Dinámico + LID
*/

import { syncLid } from './lid/resolver.js'; 

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;

        // 1. LID SYNC (Garantiza que siempre te reconozca como Owner)
        try { 
            m.sender = await syncLid(conn, m, chat); 
        } catch (e) {
            m.sender = m.key.participant || m.key.remoteJid;
        }

        // 2. Extraer Texto
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : '';

        if (!body) return;

        // 3. Lógica de Prefijo Activo
        const activePrefix = config.prefix || '!'; // El que esté guardado en config.js
        const isCmd = body.startsWith(activePrefix);
        
        // Extraemos el nombre del comando
        let commandName = isCmd 
            ? body.slice(activePrefix.length).trim().split(/ +/).shift().toLowerCase() 
            : body.trim().split(/ +/).shift().toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. Validaciones de Identidad
        const owners = Array.isArray(config.owner) ? config.owner : [];
        const isOwner = [conn.user.id.split(':')[0], ...owners].some(num => m.sender.includes(num));
        const isGroup = chat.endsWith('@g.us');

        // 5. Ejecución
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Si el comando NO tiene prefijo y el comando NO es de tipo 'noPrefix', ignoramos.
            // Si tú quieres que TODOS respondan sin prefijo, quita la validación !isCmd
            if (!isCmd && !cmd.noPrefix) return; 

            if (cmd.isOwner && !isOwner) return m.reply('❌ Acceso exclusivo.');
            if (cmd.isGroup && !isGroup) return m.reply('❌ Comando para grupos.');

            await cmd.run(conn, m, { 
                prefix: activePrefix, 
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