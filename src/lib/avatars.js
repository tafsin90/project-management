import { assets } from "../assets/assets";

export function userAvatar(image) {
  return image || assets.profile_img_a;
}
