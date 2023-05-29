# rtcBun

## Table of Contents
1. [Description](#description)
2. [Installation](#installation)
3. [Features](#features)
4. [Contributing](#contributing)

---

## Description
  RtcBun is a web application that began as a demonstration of websockets with the [bun runtime](https://bun.sh/). I made this app to learn more about websockets and bun. After implementing plain text chat messaging, I wanted to utilize the established websocket server for a more challenging task, establishing a WebRTC connection. 

  At its core, rtcbun serves as a platform for establishing real-time audio and video connections using WebRTC technology.

  

  ---
## Installation

  - To run rtcBun, you will need the [bun runtime](https://bun.sh).

  - Clone the repo onto your machine 
    ```
    git clone https://github.com/daviszung/rtcbun.git
    ```
  - After navigating to the proper directory, use:
    ```
    bun run build
    ```
    and then...
    ```
    bun run startdev
    ```
  - Open your browser to localhost on port 5000, and you're done!

---

## Features
  RtcBun uses a websocket server running on the bun runtime to deliver messages, as well as establish WebRTC video and audio connections. Users do not have accounts, rather the users create and join rooms. 

  Rooms can currently only hold two users at once, since that is the constraints of the basic WebRTC implementation. In order to add more users to rooms, a different server architecture would be needed.

  After creating or joining a room that has two total users in it, you can establish a WebRTC connection using the "connect" button.

  After connecting with the "connect" button, users can mute their audio and toggle their video camera on or off.

  Additionally, users can use the "chat" button to open a text chat interface, which is supported by a real-time websocket connection.

  ---

## Contributing
  Feel free to leave an issue if you have any suggestions.

