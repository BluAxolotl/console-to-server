// Requiring and Declaring ⬇⬇⬇

const internalIp = require('internal-ip')
var Convert = require('ansi-to-html');
var format = require('date-format')
var convert = new Convert();
var { exists } = require('fs')
var inited = false
var raw_inited = false 
var console_state = []

var console_methods = ["log", "debug", "error", "warn"]

var Commands = {
	array: [],
	dict: {}
}

function newline_weird(string) {
	return string.replace(/\r?\n/g, '<br>$&');
}

function date_format() {
	return format('hh:mm:ss', new Date())
}

const print_html = function (stuff) {
	let real_time = date_format()
	if (show_timestamps) { stuff = `<span class="timestamp"><em>[${real_time}] </em></span>`+stuff }
	console_io.emit("print", newline_weird(stuff))
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

if (raw_inited == false) {
	raw_inited = true
	console_methods.forEach(i => {
		var normal_method = console[i].bind(console)
		console[i] = function () {
			let obj = {"type":i, "datetime":date_format(), "value":Array.from(arguments)}
			normal_method.apply(console, arguments)
			let args = Array.from(arguments)
			args = args.map(arg => {
				switch (typeof arg) {
					case 'function':
						return arg.toString()
					break;
					case 'object':
						return JSON.stringify(arg)
					break
					default:
						return arg
				}
			})
			let stuff = args.join(" ")
			let thing = convert.toHtml(newline_weird(stuff))
			obj["html"] = thing
			// console_state.push(obj)
		}
	})
}

var print = function () { console.log.apply(console, arguments) }
var print_warn = function () { console.warn.apply(console, arguments) }
var print_error = function () { console.error.apply(console, arguments) }
var print_debug = function () { console.debug.apply(console, arguments) }


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

function initialize() { //initializeinitializeinitializeinitializeinitializeinitializeinitializeinitializeinitializeinitializeinitialize
	var config = (Array.from(arguments).length > 0 ? Array.from(arguments)[0] : {})

	// Exported functions ⬇⬇⬇

	if (!inited) {

		inited = true

		console_methods.forEach(i => {
			var normal_method = console[i].bind(console)
			console[i] = function () {
				let obj = {"type":i, "datetime":date_format(), "value":Array.from(arguments)}
				normal_method.apply(console, arguments)
				let args = Array.from(arguments)
				args = args.map(arg => {
					switch (typeof arg) {
						case 'function':
							return arg.toString()
						break;
						case 'object':
							return JSON.stringify(arg)
						break
						default:
							return arg
					}
				})
				let stuff = args.join(" ")
				let thing = ""
				if (config.html && config.html.format_ansi) {
					thing = convert.toHtml(newline_weird(stuff))
				} else {
					thing = newline_weird(stuff)
				}
				obj["html"] = thing
				console_io.emit("print", JSON.stringify(obj))
				console_state.push(obj)
			}
		})
	}

	var show_timestamps = false
	if (config.html != null && config.html.show_timestamps != null) {
		show_timestamps = config.html.show_timestamps
	}

	// Reading Console Input ⬇⬇⬇

	rl.on('line', console_input)

	function console_input(input) {
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

		new ConsoleCommand("crash", "Intentionally crashes nodejs", ["none"], function(args) {
			try {
				nonexistant()
			} catch(err) {
				print_error(err)
			}
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
		let json = JSON.stringify({
			styles: [],
			current_console: console_state,
			timestamp: show_timestamps,
		})
		if (config.html != null && config.html.styles != null) {
			json = JSON.stringify({
				styles: config.html.styles,
				current_console: console_state,
				timestamp: show_timestamps,
			})
		}
		socket.emit("html_init", json)

		socket.on('input', console_input)

		socket.on('consolelog', i => {
			console.log(i)
		})
	})

	console_server.listen({
		host: server_host, // Make this dynamic to get current machine's ipv4 address and also interact with config json
		port: server_port // Make this interact with config json
	}, () => {
		if (config.print_link == true) {
			print(`ConsoleServer @http://${server_host}:${server_port}${server_path}`)
		}

		if (config.html != null && config.html.styles != null) {
			let json = JSON.stringify({
				styles: config.html.styles,
				current_console: console_state,
				timestamp: show_timestamps,
			})
			console_io.emit("html_init", json)
		} else {
			let json = JSON.stringify({
				styles: [],
				current_console: console_state,
				timestamp: show_timestamps,
			})
			console_io.emit("html_init", json)
		}
	})
}

const ConsoleServer = { init: initialize }

// Module Exports ⬇⬇⬇

module.exports = {
	ConsoleServer: ConsoleServer,
    print: print,
    print_html: print_html,
    print_error: print_error,
    print_warn: print_warn,
    print_debug: print_debug,
    ConsoleCommand: ConsoleCommand
}

// My personal to-do list ⬇⬇⬇

// ## List of stuff to add
// [ ] HTML Send console commands
// [ ] Readable stream process thing
// [ ] Send outputs as POST requests *(or GET, or PUT)*
// [ ] Formatted HTML option
// [ ] 