import weddingBrideMirror from "../assets/portfolio/wedding-bride-mirror.jpg";
import weddingDoubleExposure from "../assets/portfolio/wedding-double-exposure.jpg";
import weddingHandfasting from "../assets/portfolio/wedding-handfasting.jpg";
import weddingRings from "../assets/portfolio/wedding-rings.jpg";

import cakeJungleSmash from "../assets/portfolio/cake-jungle-smash.jpg";
import cakeJungleTub from "../assets/portfolio/cake-jungle-tub.jpg";
import cakeRockBw from "../assets/portfolio/cake-rock-bw.jpg";
import cakeRockDrumSmash from "../assets/portfolio/cake-rock-drum-smash.jpg";
import cakeRockSmashFull from "../assets/portfolio/cake-rock-smash-full.jpg";
import cakeSafariLaugh from "../assets/portfolio/cake-safari-laugh.jpg";
import cakeSafariLook from "../assets/portfolio/cake-safari-look.jpg";

import familyChristmas from "../assets/portfolio/family-christmas.jpg";
import familyChristmasDuo from "../assets/portfolio/family-christmas-duo.jpg";
import familyReindeer from "../assets/portfolio/family-reindeer.jpg";
import familyRoseBw from "../assets/portfolio/family-rose-bw.jpg";
import familyRoseColor from "../assets/portfolio/family-rose-color.jpg";

import newbornJackHand from "../assets/portfolio/newborn-jack-hand.jpg";
import newbornJackPortrait from "../assets/portfolio/newborn-jack-portrait.jpg";

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
  weddingDoubleExposure,

  // Newborn
  newbornPink: newbornJackPortrait,
  babyField: newbornJackHand,
  familyBaby: familyRoseBw,
  newbornJackPortrait,
  newbornJackHand,

  // Family
  familyCarry: familyChristmas,
  familyKiss: familyChristmasDuo,

  // Cake smash
  cakeKid: cakeRockDrumSmash,
  cakeGirl: cakeSafariLaugh,
  cakeBirthday: cakeJungleSmash,
  cakeJungleTub,

  // Extra portfolio assets
  cakeRockSmash: cakeRockSmashFull,
  cakeRockBw,
  cakeSafariLook,
  familyReindeer,
  familyRoseColor,
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
  | "minis"
  | "booking";
