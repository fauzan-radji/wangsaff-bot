# WANGSAFF BOT

Whatsapp bot

## Installation

1. Clone this repo
2. Run `npm install` in terminal
3. Duplicate `.env.example` file and rename to `.env`

## Usage

1. Run `npm start`
2. Scan the barcode if you are not authenticated
3. Start trigger the bot by sending it a `.ping` message or send `.help` to get list of `commands` and `mention` available.

## Available Commands

### Default Commands

| Command | Description                                | Arguments | Aliases            |
| ------- | ------------------------------------------ | --------- | ------------------ |
| `.ping` | Check if the bot is alive                  | -         | `.p`               |
| `.menu` | Get list of commands and mention available | `name?`   | `.help` `.bantuan` |

### Custom Commands

| Command      | Description                            | Arguments      | Aliases |
| ------------ | -------------------------------------- | -------------- | ------- |
| `.broadcast` | Send message to all members in a group | `...message`   | -       |
| `.sticker`   | Create sticker from image              | `stickerName?` | `.s`    |
| `.instagram` | Download media from Instagram          | `url`          | `.ig`   |
| `.bot`       | Chat with AI                           | `...prompt`    | `.ai`   |
| `.dalle`     | Generate image from prompt             | `...prompt`    | -       |

## Available Mention

### Default Mention

| Mention     | Description                    | Aliases                                    |
| ----------- | ------------------------------ | ------------------------------------------ |
| `@everyone` | Mention all members in a group | `@everybody` `@all` `@semua` `@semuaorang` |
| `@admin`    | Mention all admins in a group  | `@atmint` `@min` `@mint`                   |
| `@member`   | Mention all members in a group | `@anggota`                                 |
