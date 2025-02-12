import { Thumbnail } from "../upload-serves";

export type ServiceAccount = {
  name: string;
  email: string; // One email per account
  details?: string;
  id?: string;
  thumbnail?: Thumbnail;
};
