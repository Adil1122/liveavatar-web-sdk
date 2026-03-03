export type SessionMode = "FULL" | "FULL_PTT" | "LITE";

export enum MessageSender {
  USER = "user",
  AVATAR = "avatar",
}

export interface LiveAvatarSessionMessage {
  id?: string;
  sender: MessageSender;
  message: string;
  timestamp: number;
}
