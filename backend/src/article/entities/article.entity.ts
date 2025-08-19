export class Article {
  id: number;
  title: string;
  slug: string;
  description?: string;
  body: string;
  published: boolean;
  authorId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ArticleResponse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  body: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    image?: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  _count: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
}

export class ArticleListResponse {
  articles: ArticleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CreateArticleResponse {
  message: string;
  article: ArticleResponse;
}

export class UpdateArticleResponse {
  message: string;
  article: ArticleResponse;
}

export class DeleteArticleResponse {
  message: string;
}

export class ArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
}
