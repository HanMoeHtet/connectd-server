export enum Privacy {
  PUBLIC,
  FRIENDS,
  ONLY_ME,
}

export enum ReactionType {
  LIKE,
  FAVORITE,
  SATISFIED,
  DISSATISFIED,
}

export interface Reaction {
  userId: string;
  type: ReactionType;
  createdAt: Date;
}

export interface Reply {
  userId: string;
  createdAt: Date;
  content: string;
  reactionIds: string[];
}

export interface Comment extends Reply {
  replies: Reply[];
}

export interface Share {
  userId: string;
  createdAt: Date;
}

export interface Post {
  userId: string;
  createdAt: Date;
  privacy: Privacy;
  content: string;
  reactionIds: string[];
  commentIds: string[];
  shareIds: string[];
}
