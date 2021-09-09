![ConsoleServer Logo](https://i.imgur.com/V8PrJZC.png)
# ConsoleServer
 A module that hosts a local server and outputs console to website
 Useful for people who...
- Want to view console output on another devide *(linux machine, mobile phone, etc.)*
- Want to share console with other people
- Send simple strings to an HTML document

## Usage
```javascript
const {print, print_debug} = require('console-to-server')

print('stuff') // Normal printing

print_debug('stuff') // Grey & italics formatting
```
And then hosts a server on from your machine's Ipv4 address *``192.168.1.240:8000/console``*

## New ConsoleCommand
```javascript
const {print, print_debug} = require('console-to-server')
const {ConsoleCommand} = require('console-to-server')

new ConsoleCommand("name", "this is a description", ["none"], function () {
    print("this is my custom command!")
})
```

## Configuration
Make a json file named 'console_server_config.json' and then you can configure how the package works!
Example 'console_server_config.json' file:
```json
{
  "print_link": true,
  "server": {
    "port": "1234"
  },
  "html": {
    "styles": [
      "body { background: #231f23 }",
      ".log_message { color: #FFF; font-family: FreeMono, monospace }"
    ]
  },
  "console": {
    "default_commands": true
  }
}
```

- **require_enable** (bool): If true, then you have to call ``CONSERV=true`` environment variable to enable server features *(value can literally be anything, just call)*
- **print_link** (bool): If true, prints the url of the console server *(if not defined, then it won't print url)*
- **server:**
  - **path** (string): Changes the path of the console ``localhost:8000*/path_here*`` *(if not defined, is '/console' by default)*
  - **host** (string): Changes the host of the server *(If not defined, is internal IP by default)*
  - **port** (string): Changes the port of server *(If not defined, is '8000' by default)*
- **console:**
  - **prefix** (string): Sets the prefix to be entered before every command ``$ ping`` *(If not defined, then there is no prefix)*
  - **default_commands** (bool): If false, disables all default commands ``ping, help, testargs`` *(If not defined, then default_commands are enabled)*
- **html:**
  - **styles** (array[String]): An array of css rules to alter the look of the website hosted on server

## Screenshots
Working on a mobile browser!

![ConsoleServer in a console](https://i.imgur.com/ANcYKzd.png)
![ConsoleServer on mobile](https://i.imgur.com/vHVp3Ok.png)

## Things I'd like to add:
- Ability to send input from site *(togglable in 'console_server_config.json')*
- Try to read everything that prints in the console *(only shows print functions at the moment)*
  - This also means that I'd add in support for replace line inputs
- Ability to send output as web request instead of sockets *(useful if you want to send to a pre-existing host or webhooks)*
- Formatted HTML option *(For those who use chalk or ansi formatting)*
