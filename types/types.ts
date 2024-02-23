export type RegisterType = {
  name: string;
  email: string;
  password: string;
  secret: string;
  photo: string;
  phone: number;
  secretAnswer: string;
  secretQue: String;
};

export type replyType = {
  _id: string;
  userId: any;
  from: string;
  replyAt: string;
  comment: string;
  created_At: string;
  updated_At: string;
  likes: string[];
};
