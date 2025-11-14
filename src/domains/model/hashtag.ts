import { PostM } from "./post";

export class HashTagM{
  id: string;
  name: string;
  posts: PostM[];
  postCount : number;
}