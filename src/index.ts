import ffmpeg from "fluent-ffmpeg";
import { existsSync, mkdirSync, rmSync, unlinkSync } from "fs";
import path from "path";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readdir } from "fs/promises";

import ImageToASCII from "./ImageToASCII";
import ExtractFrames from "./ExtractFrames";
import GetMetadata from "./GetMetadata";
import CreateOptimizedVersion from "./CreateOptimizedVersion";
import SecondsToTimeline from "./SecondsToTimeline";
import { Image, loadImage } from "canvas";

// Global Declarations
export var argv:
  | {
      [x: string]: unknown;
      _: (string | number)[];
      $0: string;
    }
  | undefined;
export var VIDEO_NAME = "bad_apple_144.mp4";
export var OPTIMIZED_VIDEO_NAME = `bad_apple_optimized.mp4`;
export var TEMP_DIRECTORY = path.join(__dirname, "/temp/");
export var VIDEO_PATH = path.join(__dirname, "/assets/", VIDEO_NAME);
export var OPTIMIZED_VIDEO_PATH = path.join(
  TEMP_DIRECTORY,
  OPTIMIZED_VIDEO_NAME
);
export var FRAMES_DIRECTORY = path.join(TEMP_DIRECTORY, "/frames/");

// Video Metadata Global Declarations
export var VIDEO_METADATA: ffmpeg.FfprobeData | undefined;
export var OPTIMIZED_VIDEO_METADATA: ffmpeg.FfprobeData | undefined;
export var VIDEO_WIDTH = 0;
export var VIDEO_HEIGHT = 0;
export var VIDEO_FPS = "0";
export var VIDEO_DURATION = 0;
export var TIME_BETWEEN_VIDEO_FRAMES = 0;

export var CHARACTER_SET =
  "     -:=;><+!rc/zsLTJ7|if312ESP6h9d4VOGbUAKXHm8RD#$Bg0MNWQ%&@";

export var BRIGHTNESS_TO_CHARACTER_CONSTANT = (CHARACTER_SET.length - 1) / 255;

export var VIDEO_PIXEL_LENGTH = VIDEO_WIDTH * VIDEO_HEIGHT;

// Functions = PascalCase
// Variables = snake_case
// Global Variables = SCREAMING_SNAKE_CASE

async function Main() {
  // Parse CLI
  argv = await yargs(hideBin(process.argv)).argv;

  if (!argv) return;

  if (argv.force) rmSync(TEMP_DIRECTORY, { recursive: true, force: true });
  if (!existsSync(TEMP_DIRECTORY)) mkdirSync(TEMP_DIRECTORY);

  // Generate Optimized Video
  await CheckOptimizedVideo();

  // Get Original Video Metadata
  VIDEO_METADATA = await GetMetadata(VIDEO_PATH);
  OPTIMIZED_VIDEO_METADATA = await GetMetadata(OPTIMIZED_VIDEO_PATH);

  // Set metadata values
  VIDEO_FPS = (
    OPTIMIZED_VIDEO_METADATA.streams[0].avg_frame_rate || "24/1"
  ).split("/")[0];
  TIME_BETWEEN_VIDEO_FRAMES = 1000 / parseInt(VIDEO_FPS);
  VIDEO_DURATION = Math.floor(OPTIMIZED_VIDEO_METADATA.format.duration || 0);
  VIDEO_WIDTH = OPTIMIZED_VIDEO_METADATA.streams[0].width || 0;
  VIDEO_HEIGHT = OPTIMIZED_VIDEO_METADATA.streams[0].height || 0;
  VIDEO_PIXEL_LENGTH = VIDEO_WIDTH * VIDEO_HEIGHT;

  // Extract frames from optimized video
  await CheckExtractedFrames();

  // Start Drawing
  Draw();
}

// Make synchronous timer for Draw loop
const Timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function CheckExtractedFrames() {
  if (argv?.extract || argv?.force || !existsSync(FRAMES_DIRECTORY)) {
    if (!existsSync(FRAMES_DIRECTORY)) mkdirSync(FRAMES_DIRECTORY);

    if (existsSync(FRAMES_DIRECTORY)) {
      rmSync(FRAMES_DIRECTORY, { recursive: true });
      mkdirSync(FRAMES_DIRECTORY);
    }

    console.log("Extracting Frames");
    console.time("Extracted Frames");
    await ExtractFrames(OPTIMIZED_VIDEO_PATH);
    console.timeEnd("Extracted Frames");

    if (argv?.extract) return;
  }
}

async function CheckOptimizedVideo() {
  if (argv?.gen || argv?.force || !existsSync(OPTIMIZED_VIDEO_PATH)) {
    if (existsSync(OPTIMIZED_VIDEO_PATH)) {
      unlinkSync(OPTIMIZED_VIDEO_PATH);
    }

    console.log("Creating Optimized Version");
    console.time("Created Optimized Version");
    await CreateOptimizedVersion();
    console.timeEnd("Created Optimized Version");

    if (argv?.gen) return;
  }
}

async function Draw() {
  let frameFiles = await readdir(FRAMES_DIRECTORY);
  let available_max_width = VIDEO_WIDTH * 2 - (8 + VIDEO_NAME.length);
  let available_width = available_max_width - 5;
  let seconds = 0;

  let duration_to_width_converter_constant = available_width / VIDEO_DURATION;

  let progress = Buffer.alloc(
    Math.floor(seconds * duration_to_width_converter_constant),
    "=",
    "utf-8"
  ).toString("utf-8");

  let spacing = Buffer.alloc(
    available_max_width - progress.length - 2,
    " ",
    "utf-8"
  ).toString("utf-8");

  let images: Image[] = [];

  for (let i = 1; i < frameFiles.length; i++) {
    let frameFile = `${i}.jpg`;
    let image = await loadImage(path.join(FRAMES_DIRECTORY, frameFile));
    images.push(image);
  }

  let frame_draw_start: number = Date.now();

  for (let i = 0; i < images.length; i++) {
    console.clear();
    frame_draw_start = Date.now();
    seconds = i / parseInt(VIDEO_FPS);
    progress = Buffer.alloc(
      Math.floor(seconds * duration_to_width_converter_constant),
      "=",
      "utf-8"
    ).toString("utf-8");
    spacing = Buffer.alloc(
      available_max_width - progress.length - 5,
      " ",
      "utf-8"
    ).toString("utf-8");
    let image = images[i];
    let ascii_viewport = await ImageToASCII(image);
    ascii_viewport.push(
      `${SecondsToTimeline(
        Math.floor(i / parseInt(VIDEO_FPS))
      )} [${progress}>${spacing}] ${VIDEO_NAME}`
    );
    if (argv?.verbose)
      ascii_viewport.push(`Frame Delay: ${Date.now() - frame_draw_start}ms`);
    console.log(ascii_viewport.join("\n"));
    await Timer(TIME_BETWEEN_VIDEO_FRAMES);
  }
}

Main();
