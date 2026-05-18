export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  interests: string[];
};

export type Note = {
  id: string;
  owner: string;
  title: string;
  content: string;
};

export type Post = {
  id?: string;
  _id?: string;
  author: string;
  title: string;
  content: string;
};

export type InterestGroup = {
  interest: string;
  userCount: number;
  users: User[];
};

export type ListResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
