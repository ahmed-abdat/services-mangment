
export type Thumbnail = {
    name: string;
    url: string;
    file: File ;
  } | null; 


  export type Service = {
    name : string;
    id? : string;
    thumbnail : Thumbnail;
  }