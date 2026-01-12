import Session from "@/types/Session";

export const POST = async () => {
  await Session.logout({ isAPI: true });
  return new Response(null, { status: 204 });
};
