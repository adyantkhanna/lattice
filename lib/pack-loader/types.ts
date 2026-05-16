export type PackSource = {
  rss?: string[];
  twitter_handles?: string[];
  youtube_channels?: string[];
  arxiv_categories?: string[];
  sites?: string[];
};

export type CanonicalReading = {
  title: string;
  url: string;
  why: string;
};

export type KeyPerson = {
  name: string;
  role: string;
  handle?: string;
};

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type OpenDebate = {
  question: string;
  perspectives: string[];
};

export type TopicPack = {
  slug: string;
  name: string;
  description: string;
  maintainers?: string[];
  sources?: PackSource;
  canonical_readings?: CanonicalReading[];
  key_people?: KeyPerson[];
  glossary?: GlossaryEntry[];
  open_debates?: OpenDebate[];
};
