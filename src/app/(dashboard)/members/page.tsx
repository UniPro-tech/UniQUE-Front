import { Suspense } from "react";
import MembersContents from "./content";

export default function MembersPage() {
  return (
    <Suspense fallback={<div>Loading members...</div>}>
      <MembersContents />
    </Suspense>
  );
}
