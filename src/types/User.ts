import { Discord } from "./Discord";
import { Role } from "./Role";

// Simple版: 基本情報のみ
interface UserSimple {
  id: string;
  name: string;
  customId: string;
  email: string;
  period: string | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  discords?: Discord[];
  roles?: Role[];
}

// Full版: 全てのパラメータ
interface UserFull {
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
  discords?: Discord[];
  roles?: Role[];
}

// ジェネリック型で簡潔にアクセス
export type User<T = "Full"> = T extends "Full" ? UserFull : UserSimple;
