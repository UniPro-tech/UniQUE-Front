import type { NextRequest } from "next/server";
import { baseLogger } from "@/libs/logger";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const logger = baseLogger.getLogger({ function: "LogAPI" });
  (logger[data.level as keyof typeof logger] as Function)(...data.messages);

  return new Response("Message has been successfully logged on the server", {
    status: 200,
  });
}
