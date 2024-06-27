import { Thumbnail } from "../upload-serves";

export type ServiceAccount = { 
    name : string;
    details? : string;
    id? : string;
    thumbnail? : Thumbnail;
}