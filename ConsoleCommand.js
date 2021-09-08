// Requiring and Declaring ⬇⬇⬇

var chalk = require('chalk');
const internalIp = require('internal-ip')
var fs = require('fs')
const default_config = {
	require_enable: false,
	print_link: false
}
var inited = false
var config = null
var enabled = null
if (process.env.DEV == null) {
	config = require('../../console_server_config.json')
	if (config == null) {
		config = default_config
	}
	enabled = process.env.CONSERV
	if (config.require_enable == false) {
		enabled = true
	}
} else {
	config = require('./console_server_config.json')
	enabled = true
}

var Commands = {
	array: [],
	dict: {}
}

console.log(config)

// Exported functions ⬇⬇⬇

const print = function (stuff) {
	console.log(stuff)
	if (enabled) {
		console_io.emit("print", stuff)
	}
}

const print_debug = function(stuff) {
	// console.log(stuff)
	console.log(chalk.hex("#888888").italic(stuff))
	if (enabled) {
		console_io.emit("print", stuff)
	}
}

// Server startup and configuration ⬇⬇⬇

const express = require('express');
const console_app = express();
const { Server } = require("socket.io");
const http = require('http');
const console_server = http.createServer(console_app);
const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 30,
    prompt: '$ '
})

const console_io = new Server(console_server)

if (enabled == null) {
	enabled = false
}

// Here's the constructor class. Feel free to make a new one that extends this one to fit your needs! ⬇⬇⬇

class ConsoleCommand {
	constructor (name, desc, args, func) {
		this.name = name
		this.desc = desc
		this.args = args
		this.func = func
		Commands.array.push(this)
		Commands.dict[this.name] = this
	}

	exec(args) {
		this.func(args)
	}
}

// Reading Console Input ⬇⬇⬇

if (enabled) {
	rl.on('line', (input) => {
	  let run = false
	  let args = input.split(" ")
	  if (config.console && config.console.prefix) {
		let prefix = args.shift()
		run = (config.console && prefix == config.console.prefix)
	  } else {
		run = true
	  }
	  let command_name = args.shift()
	  if (run) {
		  try {
		  	let command = Commands.dict[command_name]
		  	if (command) {
		  		command.exec(args)
		  	} else {
		  		print_debug(`Command '${command_name}' does not exist`)
		  	}
		  } catch (err) {
			print_debug(String(err))
		  }
	  }
	})
}

// Default Commands ⬇⬇⬇

if (config.console == null || config.console.default_commands == true) {
	new ConsoleCommand("help", "Lists all commands and their functions", ["none"], function() {
		let arr = []
		Commands.array.forEach(i => {
			arr.push(`${i.name}: ${i.desc} (${i.args.join(", ")})`)
		})
		print_debug(arr.join("\n"))
	})

	new ConsoleCommand("ping", "Responds with pong!", ["none"], function() {
		print_debug("pong")
	})

	new ConsoleCommand("testargs", "Test command for arguments", ["arg1", "arg2"], function(args) {
		print_debug(`The arguments were ${args[0]} & ${args[1]}`)
	})

	new ConsoleCommand("send", "Sends to web server", ["stuff..."], function(args) {
		console_io.emit("print", (args.join(" ")))
	})

	new ConsoleCommand("crash", "Intentionally crashes nodejs", ["none"], function(args) {
		nonexistant()
	})
}

// Server Redirect and Listen ⬇⬇⬇

var server_path = (config.server && config.server.path ? config.server.path : "/console")

console_app.get(server_path, (req, res) => {
  res.sendFile(__dirname + '/console.html') // Fix icon/logo/favicon thing
})

var server_host = (config.server && config.server.host ? config.server.host : internalIp.v4.sync())
var server_port = (config.server && config.server.port ? config.server.port : 8000)

console_io.on('connection', socket => {
	if (config.html != null && config.html.styles != null) {
		socket.emit("html_init", JSON.stringify(config.html.styles))
	}
})

if (enabled) {
	console_server.listen({
		host: server_host, // Make this dynamic to get current machine's ipv4 address and also interact with config json
		port: server_port // Make this interact with config json
	}, () => {
		inited = true
		if (config.print_link == true) {
			print("hello!")
			print(`ConsoleServer @http://${server_host}:${server_port}${server_path}`)
		}

		if (config.html != null && config.html.styles != null) {
			console_io.emit("html_init", JSON.stringify(config.html.styles))
		}
	})
}

// Module Exports ⬇⬇⬇

module.exports = {
    print: print,
    print_debug: print_debug,
    ConsoleCommand: ConsoleCommand
}

// My personal to-do list ⬇⬇⬇

// ## List of stuff to add
// [x] Get machine's IvP4 address to set default Host
// [x] Add in 'console_server_config.json' functionality
// [x] Host changes to 'console_server_config.json'
// [x] Port changes to 'console_server_config.json'
// [x] Prefix support (enabling and setting) in 'console_server_config.json'
// [x] Set custom HTML path in 'console_server_config.json'
// [x] Adjusting simple HTML parameters (styling, font, text size, show timestamps?) in 'console_server_config.json'
// [x] Fix icon/logo/favicon thing on html
// [ ] Update README to show it working on mobile phone browser
// [x] Environmental Variable that toggles the module (off by default for deploying purposes)
// [x] Print ip of ConsoleServer when initializing (toggable in 'console_server_config.json')
// [x] Toggle default commands in 'console_server_config.json'
// (x) Public Console feature: Allows people to view console server after being deployed (Oh?)
// ( ) Look into directly streaming all console output
