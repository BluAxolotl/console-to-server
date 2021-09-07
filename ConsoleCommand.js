// Requiring chalk (because I didn't do that first before 😅) and Commands object ⬇⬇⬇

var chalk = require('chalk');

var Commands = {
	array: [],
	dict: {}
}

// Exported functions ⬇⬇⬇

const print = function (stuff) {
	console.log(stuff)
	console_io.emit("print", stuff)
}

const print_debug = function(stuff) {
	// console.log(stuff)
	console.log(chalk.hex("#888888").italic(stuff))

	console_io.emit("print", stuff)
}

// Server startup and configuration ⬇⬇⬇

const express = require('express');
const console_app = express();
const { Server } = require("socket.io");
const http = require('http');
const console_server = http.createServer(console_app);
const readline = require('readline')
var fs = require('fs')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 30,
    prompt: '$ '
})

const console_io = new Server(console_server)

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

rl.on('line', (input) => {
  let args = input.split(" ")
  let command_name = args.shift()
  try {
  	Commands.dict[command_name].exec(args)
  } catch (err) {
  	print_debug(String(err))
  }
})

// Default Commands ⬇⬇⬇

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

// Server Redirect and Listen ⬇⬇⬇

console_app.get('/console', (req, res) => {
  res.sendFile(__dirname + '/console.html'); // Fix icon/logo/favicon thing
})

console_server.listen({
	host: "192.168.1.240", // Make this dynamic to get current machine's ipv4 address and also interact with config json
	port: 8000 // Make this interact with config json
}, () => {
	print('listening on *:8000'); // Make this dynamic config json
})

// Module Exports ⬇⬇⬇

module.exports = {
    print: print,
    print_debug: print_debug,
    ConsoleCommand: ConsoleCommand
}

// My personal to-do list ⬇⬇⬇

// ## List of stuff to add
// [ ] Get machine's IvP4 address to set default Host
// [ ] Add in 'console_server_config.json' functionality
// [ ] Host changes to 'console_server_config.json'
// [ ] Port changes to 'console_server_config.json'
// [ ] Prefix support (enabling and setting) in 'console_server_config.json'
// [ ] Set custom HTML path in 'console_server_config.json'
// [ ] Adjusting simple HTML parameters (styling, font, text size, show timestamps?) in 'console_server_config.json'
// [ ] Fix icon/logo/favicon thing on html
// [ ] Update README to show it working on mobile phone browser
// [ ] Environmental Variable that toggles the module (off by default for deploying purposes)
// [ ] Print ip of ConsoleServer when initializing (toggable in 'console_server_config.json')
// [ ] Toggle default commands in 'console_server_config.json'
// ( ) Public Console feature: Allows people to view console server after being deployed (Oh?)
// ( ) Look into directly streaming all console output