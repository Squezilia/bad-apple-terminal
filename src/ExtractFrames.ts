import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { FRAMES_DIRECTORY, VIDEO_FPS } from ".";

const ExtractFrames = (video_path: string) =>
  new Promise((resolve, reject) => {
    const video = ffmpeg(video_path);

    let frame_path = path.join(FRAMES_DIRECTORY, `/%d.jpg`);

    video.outputOptions(["-r", VIDEO_FPS]);

    video.on("end", () => {
      resolve(undefined);
    });

    video.save(frame_path);
  });

export default ExtractFrames;
