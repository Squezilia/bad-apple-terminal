import { Image, createCanvas } from "canvas";
import {
  BRIGHTNESS_TO_CHARACTER_CONSTANT,
  CHARACTER_SET,
  VIDEO_PIXEL_LENGTH,
} from ".";

export default async function ImageToASCII(image: Image) {
  let canvas = createCanvas(image.width, image.height);

  let ctx = canvas.getContext("2d");

  ctx?.drawImage(image, 0, 0);
  const image_data = ctx?.getImageData(0, 0, image.width, image.height);

  let viewport_data = "";
  let viewport: string[] = [];

  for (let pixel_index = 0; pixel_index < VIDEO_PIXEL_LENGTH; pixel_index++) {
    let pixel_data_offset = pixel_index * 4;

    let brightness_as_character_set = Math.floor(
      ((image_data.data[pixel_data_offset] +
        image_data.data[pixel_data_offset + 1] +
        image_data.data[pixel_data_offset + 2]) /
        3) *
        BRIGHTNESS_TO_CHARACTER_CONSTANT
    );

    viewport_data += `${CHARACTER_SET[brightness_as_character_set]}${CHARACTER_SET[brightness_as_character_set]}`;
    if (viewport_data.length == image.width * 2) {
      viewport.push(viewport_data);
      viewport_data = "";
    }
  }

  return viewport;
}
