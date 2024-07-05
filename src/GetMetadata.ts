import Ffmpeg from "fluent-ffmpeg";

const GetMetadata = (video_path: string) =>
  new Promise((resolve: (data: Ffmpeg.FfprobeData) => void, reject) => {
    Ffmpeg.ffprobe(video_path, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });

export default GetMetadata;
