# Bad Apple In Terminal
```ts
let total_hours_wasted = 8;
```

## Requirements
I've used FFMPEG for extracting frames and generating optimized video in this project so you must install FFMPEG before using this repo. 

Probably this project will not work before Node.js v20 (current LTS version) so I recommend you to run this project in Nodejs v20 or newer versions.

I'm using yarn for this project but it's not necessary, you can use npm or else anyway.

And I must say this "I'm suck at commenting."

## Installing
```bash
# Clone repository
git clone https://github.com/Squezilia/bad-apple-terminal.git
# Dive into it
cd bad-apple-terminal
# Install dependencies
yarn
```

## Building
```bash
# Building repository
yarn build
```

## Running
```bash
# It automatically generates optimized video and extracts frames on it
yarn start
```

## Development
```bash
# Automatically restarts when files changed.
yarn dev
```

## CLI Reference
 - `--gen`: Generates optimized video and stops.
 - `--extract`: Extracts all frames from optimized video and stops.
 - `--force`: Removes all temporary files (optimized video and frames) and regenerates them.
 - `--verbose`: Displays debugging info.