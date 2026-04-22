export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  FILE: "file",
} as const;

export type MESSAGE_TYPE = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
