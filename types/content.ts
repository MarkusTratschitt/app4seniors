/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type OSFamily = "ios" | "ipados" | "android" | "windows" | "macos";

type BaseMedia = {
  id: string;
  alt: string;
  description?: string;
};

export type ImageMedia = BaseMedia & {
  type: "image";
  src: string;
  width?: number;
  height?: number;
};

export type AudioMedia = BaseMedia & {
  type: "audio";
  src: string;
  transcript?: string;
};

export type VideoMedia = BaseMedia & {
  type: "video";
  src: string;
  poster?: string;
  captions?: string;
};

export type Media = ImageMedia | AudioMedia | VideoMedia;

export type Step = {
  id: string;
  order: number;
  title: string;
  description: string;
  media?: Media[];
  tips?: string[];
};

export type HowTo = {
  id: string;
  slug: string;
  os: OSFamily;
  osVersion: {
    min: string;
    max?: string;
  };
  title: string;
  summary: string;
  keywords: string[];
  estimatedMinutes: number;
  steps: Step[];
  prerequisites?: string[];
  resources?: Array<{ label: string; href: string }>;
};
