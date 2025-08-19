export class Tag {
  id: number;
  name: string;
}

export class TagResponse {
  id: number;
  name: string;
  articleCount: number;
}

export class TagListResponse {
  tags: TagResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CreateTagResponse {
  message: string;
  tag: TagResponse;
}

export class UpdateTagResponse {
  message: string;
  tag: TagResponse;
}

export class DeleteTagResponse {
  message: string;
}

export class TagWithArticlesResponse {
  id: number;
  name: string;
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    description?: string;
    author: {
      id: number;
      username: string;
      email: string;
      bio?: string;
      image?: string;
    };
    createdAt: Date;
    _count: {
      comments: number;
      likes: number;
    };
  }>;
  total: number;
  page: number;
  limit: number;
}

export class TagStats {
  totalTags: number;
  mostUsedTags: Array<{
    name: string;
    articleCount: number;
  }>;
}
