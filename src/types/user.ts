export interface User {
  id: string;
  name: string;
  customId: string;
  email: string;
  externalEmail: string;
  period: string | null;
  isEnable: boolean;
  isSuspended: boolean;
  isSystem: boolean;
  suspendedReason: string | null;
  suspendedUntil: Date | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  discords?: any[];
}
