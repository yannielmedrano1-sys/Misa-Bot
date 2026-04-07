import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    jidNormalizedUser
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { socketLogger } from './print.js';
import { pixelHandler } from '../pixel.js';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

global.subBots = new Map();

export const startSubBot = async (userId, mainConn = null) => {
    const jid = jidNormalizedUser(userId);
    const userNumber = jid.split('@')[0];
    const userSessionPath = path.join(sessionsPath, userNumber);
    
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        // --- CAMBIO DE IDENTIFICACIÓN ---
        // Ahora aparecerá como Safari en MacOS para diferenciarlo del principal
        browser: Browsers.macOS('Safari'), 
        markOnlineOnConnect: true,
    });

    global.subBots.set(jid, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const code = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log(chalk.yellow(`[SUB-BOT] 🔄 Reconectando: ${userNumber}`));
                setTimeout(() => startSubBot(jid, mainConn), 5000);
            } else {
                console.log(chalk.red(`[SUB-BOT] 🚪 Sesión cerrada: ${userNumber}`));
                
                if (mainConn) {
                    try {
                        const despedida = `[✿︎] Hola *${userNumber}*.\n\nGracias por haber formado parte de nuestros sockets. Si algún día quieres volver a ser SubBot de Misa, puedes hacerlo con el comando *${config.prefix}code*.\n\n> ¡Nos vemos la próxima vez!`;
                        await mainConn.sendMessage(jid, { text: despedida });
                    } catch (e) {}
                }
                
                global.subBots.delete(jid);
                if (fs.existsSync(userSessionPath)) {
                    fs.rmSync(userSessionPath, { recursive: true, force: true });
                }
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`[SUB-BOT] ✅ Conectado como SAFARI: ${userNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;
        socketLogger(m, sock);
        await pixelHandler(sock, m, config);
    });

    return sock;
};

export const loadAllSubBots = async (mainConn) => {
    try {
        const sessions = fs.readdirSync(sessionsPath);
        if (sessions.length === 0) return;
        for (const num of sessions) {
            const jid = `${num}@s.whatsapp.net`;
            await new Promise(resolve => setTimeout(resolve, 3000));
            startSubBot(jid, mainConn);
        }
    } catch (err) {}
};
