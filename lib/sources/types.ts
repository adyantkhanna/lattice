export type SourceResult = {
  url: string;
  title: string;
  content: string;
  publishedAt?: string;
  source: "rss" | "arxiv" | "exa";
};
