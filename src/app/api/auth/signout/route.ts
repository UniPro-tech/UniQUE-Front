import Session from "@/types/Session";

export const POST = async () => {
  await Session.logout();
  return new Response(null, { status: 204 });
};
