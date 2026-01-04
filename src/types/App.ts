export interface App {
  /** primary key (non auto-increment) */
  id: string;
  /** unique */
  aud: string;
  client_secret: string;
  name: string;
  /** ISO 8601 datetime or null when absent */
  created_at: string | null;
  /** ISO 8601 datetime or null when absent */
  updated_at: string | null;
  /** optional boolean */
  is_enable: boolean | null;
}

export type CreateAppInput = Omit<App, "id" | "created_at" | "updated_at"> & {
  id?: string; // allow supplying id for non-auto-increment PK or let caller generate
};

export type UpdateAppInput = Partial<
  Pick<App, "aud" | "client_secret" | "name" | "is_enable">
> & {
  updated_at?: string | null;
};

export default App;
