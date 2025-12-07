export interface Role {
  id: string;
  custom_id: string;
  name: string | null;
  permission: number;
  created_at: Date;
  updated_at: Date;
  is_enable: boolean | null;
  is_system: boolean | null;
}
