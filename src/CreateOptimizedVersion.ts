import Ffmpeg from "fluent-ffmpeg";
import { OPTIMIZED_VIDEO_PATH, VIDEO_PATH } from ".";

const CreateOptimizedVersion = () =>
  new Promise(async (resolve, reject) => {
    const video = await Ffmpeg(VIDEO_PATH);

    video.size("46x?");
    // video.fps(24);
    video.videoBitrate(2400, false);
    video.noAudio();

    video.on("end", () => {
      resolve(undefined);
    });

    video.save(OPTIMIZED_VIDEO_PATH);
  });

export default CreateOptimizedVersion;
