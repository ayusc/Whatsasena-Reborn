const { default: makeWASocket, MessageType, MessageOptions, Mimetype, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, AnyMediaMessageContent } = require("@adiwajshing/baileys")
const P = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
var axios = require("axios")
require('util').inspect.defaultOptions.depth = null

const { state, saveState } = useSingleFileAuthState("./session.json")

const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) })

setInterval(() => {
	store.writeToFile('./baileys_store_multi.json')
}, 10000)

async function Primon() {
  const Proto = makeWASocket({ auth: state, logger: P().child({ level: process.env.DEBUG === undefined ? 'silent' : process.env.DEBUG === true ? "trace" : "silent", stream: 'store' }) }) 
  Proto.ev.on('creds.update', saveState)
  
  var message, isreplied, repliedmsg;
  
  Proto.ev.on('messages.upsert', async (m) => {
    
    try {
      message = m.messages[0].message.conversation
    } catch {
      try {
        message = m.messages[0].message.extendedTextMessage.text
      } catch {
	      try {
          message = m.messages[0].message.quotedMessage.extendedTextMessage.conversation
        } catch {
          console.log(m.messages[0].message)
      }
    }
    
    try {
      if (m.messages[0].message.quotedMessage) {
        isreplied = true
      }
    } catch {
      isreplied = false
    }
    
    if (isreplied) {
      try {
        repliedmsg = m.messages[0].message.quotedMessage.conversation
      } catch {
        try {
          repliedmsg = m.messages[0].message.quotedMessage.extendedTextMessage.text
        } catch {
          try {
            repliedmsg = m.messages[0].message.quotedMessage.extendedTextMessage.conversation
          } catch {
            console.log(m.messages[0].message.quotedMessage)
        }
      }
    }
	  
    if (m.type == "notify") {
      console.log(message)
      console.log(isreplied)
      console.log(repliedmsg)
    }
      /*
      if (m.messages[0].key.fromMe) {
        if (m.messages[0].message.conversation.startsWith(".textpro")) {
	  await Proto.sendMessage(m.messages[0].key.remoteJid, { delete: m.messages[0].key })
          var args = m.messages[0].message.conversation.split(" ")
	  var api = await axios.get("https://open-apis-rest.up.railway.app/api/textpro?url=" +
	    args[1] + "&text1=" + args[2]
          ) 
	  var img = await axios.get(api.data.data, { responseType: "arraybuffer" })
          await Proto.sendMessage(m.messages[0].key.remoteJid, { image: Buffer.from(img.data), caption: "By Primon Proto" })
	}
      }
      */
  })
}
try {
  Primon()
} catch {
  Primon()
}




/*
import { Boom } from '@hapi/boom'
import P from 'pino'
import makeWASocket, { AnyMessageContent, delay, DisconnectReason, makeInMemoryStore, useSingleFileAuthState } from '@adiwajshing/baileys'
import * as fs from "fs"

const store = makeInMemoryStore({ logger: P().child({ level: 'debug', stream: 'store' }) })
store.readFromFile('./baileys_store_multi.json')


fs.writeFile("./session.json", atob(process.env.SESSION), (err) => {
  if (err) {
	  console.log("Error While Writing Session!")
  }
})

const { state, saveState } = useSingleFileAuthState("./session.json")

const Proto = makeWASocket({ })

async function Primon () {
  Proto.ev.on('messages.upsert', async (m) => {
      console.log(m)
  })
}
Primon()
*/
