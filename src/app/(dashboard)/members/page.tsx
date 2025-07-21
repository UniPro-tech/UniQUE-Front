import { Suspense } from "react";
import MembersContents from "./content";
import { LinearProgress, Stack } from "@mui/material";

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <Stack
          justifyContent={"center"}
          alignItems="center"
          minHeight={"100%"}
          minWidth={"100vw"}
        >
          <LinearProgress style={{ width: "60%" }} />
        </Stack>
      }
    >
      <MembersContents />
    </Suspense>
  );
}
