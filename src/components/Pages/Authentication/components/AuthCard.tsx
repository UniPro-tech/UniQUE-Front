"use client";

import { useAuthPageMode } from "..";
import MigrationCard from "./Cards/MigrationCard";
import SignInCard from "./Cards/SignInCard";
import SignUpCard from "./Cards/SignUpCard";

export default function AuthCard() {
  const mode = useAuthPageMode();

  switch (mode) {
    case "signin":
      return <SignInCard />;
    case "signup":
      return <SignUpCard />;
    case "migration":
      return <MigrationCard />;
    default:
      return null;
  }
}
