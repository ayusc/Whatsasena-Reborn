const {
    default: makeWASocket,
    DisconnectReason,
    useSingleFileAuthState,
    fetchLatestBaileysVersion,
    delay,
    BufferJSON,
    makeInMemoryStore,
    jidNormalizedUser,
    makeWALegacySocket,
    useSingleFileLegacyAuthState,
    DEFAULT_CONNECTION_CONFIG,
    DEFAULT_LEGACY_CONNECTION_CONFIG,
    extensionForMediaMessage,
    extractMessageContent,
    getContentType,
    normalizeMessageContent,
    proto,
    downloadContentFromMessage,
} = require("@adiwajshing/baileys");
const { exec } = require("child_process");

const fs = require("fs");
const util = require("util");
const pino = require("pino");
const path = require("path");
const { Boom } = require("@hapi/boom");
var readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const { state, saveState } = useSingleFileAuthState("proto.json");

async function connectPrimon() {
    var PrimonProto = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Primon Proto", "Chrome", "1.0"],
    });
    PrimonProto.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? connectPrimon()
                : console.log("Connection Logged Out..");
        }
        exec("npm i -g @railway/cli", (err, stdout, stderr) => {
            if (err) {
                console.error(err);
            } else {
              exec("clear", (err, stdout, stderr) => {
                if (err) {
                    exec("cls", (err, stdout, stderr) => {});
                } else {
                  exec("railway up", (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(`stdout: ${stdout}`);
                    }
                  });
                }
              });
            }
        });
    });
}
connectPrimon();
