![ConsoleServer Logo](https://i.imgur.com/V8PrJZC.png)
# ConsoleServer
 A module that hosts a local server and outputs console to website
 Useful for people who...
- Want to view console output on another devide *(linux machine, mobile phone, etc.)*
- Want to share console with other people
- Send simple strings to an HTML document

## Usage
```javascript
const { ConsoleServer } = require('./ConsoleCommand.js')

ConsoleServer.init()

const { print, print_debug, print_error, print_warn } = require('./ConsoleCommand.js') // comepletely optional, console.log just sucks bawlls

print("Text!")
print_debug("Debug!")
print_error("Error!")
print_warn("Warning!")

const { ConsoleCommand } = require('./ConsoleCommand.js')

new ConsoleCommand("name", "this is a description", ["none"], function (args) {
    print("this is my custom command!")
})
```

## Configuration

```js
ConsoleServer.init({
  print_link: false,
  server: {
    port: 8000
  },
  html: {
    styles: [
      ".timestamp { color: #4f4f4f; font-weight: normal }",
      "body { background: #000000 }",
      ".console_line { font-family: FreeMono, monospace }",
      ".warn { color: #ffe737 }",
      ".error { color: #e03c28; font-weight: bold; }",
      ".debug { color: #7b7b7b; font-style: italic }",
    ],
    show_timestamps: true
  },
  console: {
    default_commands: true
  }
})
```

- **print_link** (bool): If true, prints the url of the console server *(if not defined, then it won't print url)*
- **server:**
  - **host** (string): Changes the host of the server *(If not defined, is internal IP by default)*
  - **port** (string): Changes the port of server *(If not defined, is '8000' by default)*
  - **path** (string): Changes the path of the console ``localhost:8000*/path_here*`` *(if not defined, is '/console' by default)*
- **console:**
  - **prefix** (string): Sets the prefix to be entered before every command ``$ ping`` *(If not defined, then there is no prefix)*
  - **default_commands** (bool): If false, disables all default commands ``ping, help, testargs`` *(If not defined, then default_commands are enabled)*
- **html:**
  - **styles** (array[String]): An array of css rules to alter the look of the website hosted on server
    - timestamp (class): This is a class for all timestamps ``opacity: 0.5;``
    - console_line (class): This is a class that every console_line has ``.console_line { color: white }``
    - warn (class): This is a class that all the console.warn lines have ``.warn { color: #ffe737 }``
    - error (class): This is a class that all the console.error lines have ``.error { color: #e03c28; font-weight: bold; }``
    - debug (class): This is a class that all the console.debug lines have ``.debug { color: #7b7b7b; font-style: italic }``
  - **format_ansi** (bool): Converts ANSI formatting to HTML for chalk users *(If not defined, is false)*
  - **show_timestamps** (bool): Toggles timestamp on console lines *(If not defined, then false)*

## Screenshots
Working on a mobile browser!

![ConsoleServer in a console](https://i.imgur.com/ANcYKzd.png)
![ConsoleServer on mobile](https://i.imgur.com/vHVp3Ok.png)
