const print = function (stuff) {
	console.log(stuff)
	console_io.emit("print", stuff)
}

const print_debug = function(stuff) {
	// console.log(stuff)
	console.log(chalk.hex("#888888").italic(stuff))

	console_io.emit("print", stuff)
}

const express = require('express');
const console_app = express();
const { Server } = require("socket.io");
const http = require('http');
const console_server = http.createServer(console_app);
var chalk = require('chalk');
const readline = require('readline')
var fs = require('fs')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 30,
    prompt: '$ '
})

var Commands = {
	array: [],
	dict: {}
}

const console_io = new Server(console_server)

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

rl.on('line', (input) => { // Add in prefix support
  let args = input.split(" ")
  let command_name = args.shift()
  try {
  	Commands.dict[command_name].exec(args)
  } catch (err) {
  	print_debug(String(err))
  }
})

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

console_app.get('/console', (req, res) => {
  res.sendFile(__dirname + '/console.html'); // Fix icon/logo/favicon thing
})

console_server.listen({
	host: "192.168.1.240", // Make this dynamic to get current machine's ipv4 address and also interact with config json
	port: 8000 // Make this interact with config json
}, () => {
	print('listening on *:8000'); // Make this dynamic config json
})

module.exports = {
    print: print,
    print_debug: print_debug
}

// ## List of stuff to add
// [ ] Get machine's IvP4 address to set default Host
// [ ] Add in 'console_server_config.json' functionality
// [ ] Host changes to 'console_server_config.json'
// [ ] Port changes to 'console_server_config.json'
// [ ] Prefix support (enabling and setting) in 'console_server_config.json'
// [ ] Set custom HTML path in 'console_server_config.json'