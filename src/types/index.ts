export interface User {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
  isPaid: boolean;
  priceInr?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: string;
  uploader: {
    id: string;
    userName: string;
    avatarUrl?: string;
  };
  country: { id: string; name: string };
  state: { id: string; name: string };
  university: { id: string; name: string };
  topics: { topic: { id: string; name: string } }[];
}

export interface Purchase {
  id: string;
  contentId: string;
  amountInr: number;
  status: string;
  content: Content;
}
