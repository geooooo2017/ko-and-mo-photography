import weddingBrideMirror from "../assets/portfolio/wedding-bride-mirror.png";
import weddingHandfasting from "../assets/portfolio/wedding-handfasting.png";
import weddingRings from "../assets/portfolio/wedding-rings.png";

import cakeJungleSmash from "../assets/portfolio/cake-jungle-smash.png";
import cakeJungleTub from "../assets/portfolio/cake-jungle-tub.png";
import cakeRockBw from "../assets/portfolio/cake-rock-bw.png";
import cakeRockSmashFull from "../assets/portfolio/cake-rock-smash-full.png";
import cakeRockTub from "../assets/portfolio/cake-rock-tub.png";
import cakeSafariLaugh from "../assets/portfolio/cake-safari-laugh.png";
import cakeSafariLook from "../assets/portfolio/cake-safari-look.png";

import familyChristmas from "../assets/portfolio/family-christmas.png";
import familyChristmasDuo from "../assets/portfolio/family-christmas-duo.png";
import familyDoubleExposure from "../assets/portfolio/family-double-exposure.png";
import familyReindeer from "../assets/portfolio/family-reindeer.png";
import familyRoseBw from "../assets/portfolio/family-rose-bw.png";
import familyRoseColor from "../assets/portfolio/family-rose-color.png";
import familyWindowNight from "../assets/portfolio/family-window-night.png";

export const images = {
  // Heroes & feature
  heroBride: weddingBrideMirror,
  brideSoft: weddingHandfasting,
  photographer: familyChristmas,

  // Weddings
  coupleHill: weddingHandfasting,
  coupleWalking: weddingRings,
  coupleKissing: weddingHandfasting,
  coupleLake: weddingBrideMirror,
  coupleTreePath: weddingRings,
  coupleField: weddingBrideMirror,

  // Newborn / baby (closest available from provided set)
  newbornPink: cakeJungleTub,
  babyField: cakeSafariLaugh,
  familyBaby: familyRoseBw,

  // Family
  familyCarry: familyChristmas,
  familyKiss: familyChristmasDuo,

  // Cake smash
  cakeKid: cakeRockTub,
  cakeGirl: cakeSafariLaugh,
  cakeBirthday: cakeJungleSmash,

  // Extra portfolio assets
  cakeRockSmash: cakeRockSmashFull,
  cakeRockBw,
  cakeSafariLook,
  familyDoubleExposure,
  familyReindeer,
  familyRoseColor,
  familyWindowNight,
  familyChristmasDuo,
  weddingRings,
} as const;

export const colors = {
  brown: "#5C4B43",
  taupe: "#B8A99A",
  gold: "#D8C5A6",
  cream: "#F5F1EA",
  green: "#4A7A35",
} as const;

export type Page =
  | "home"
  | "weddings"
  | "newborn"
  | "family"
  | "cakesmash"
  | "booking";
