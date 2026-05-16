export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export type Session = {
  user: SessionUser;
};
