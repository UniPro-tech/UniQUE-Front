import { Suspense } from "react";
import PasswordResetClient from "./PasswordResetClient";

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <PasswordResetClient />
    </Suspense>
  );
}
