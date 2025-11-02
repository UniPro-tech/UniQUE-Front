import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";

export default function Page() {
  return (
    <>
      <Content isSignUp={false} />
      <SignInCard signUp={false} />
    </>
  );
}
