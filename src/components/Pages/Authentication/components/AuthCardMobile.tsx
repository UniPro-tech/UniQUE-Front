"use client";

import { useAuthPageMode } from "../Client";
import MigrationCard from "./MobileCards/MigrationCard";
import SignInCard from "./MobileCards/SignInCard";
import SignUpCard from "./MobileCards/SignUpCard";

export default function AuthCardMobile() {
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
