import { NextRequest, NextResponse } from "next/server";
import Session from "@/types/Session";
import * as SocialAccounts from "@/lib/resources/SocialAccounts";

/**
 * Discord連携状態をチェックするエンドポイント
 * GET /api/auth/check-discord-link
 */
export const GET = async (_request: NextRequest) => {
  try {
    // セッションからユーザーIDを取得
    const session = await Session.get();
    if (!session) {
      return NextResponse.json(
        { linked: false, hasSession: false },
        { status: 200 },
      );
    }

    // ユーザーの外部アイデンティティを取得
    const externalIdentities = await SocialAccounts.list(session.userId);

    // Discord連携があるかチェック
    const hasDiscord = externalIdentities.some(
      (identity) => identity.provider === "discord",
    );

    return NextResponse.json(
      { linked: hasDiscord, hasSession: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Discord連携状態の確認エラー:", error);
    return NextResponse.json(
      { linked: false, hasSession: false },
      { status: 200 },
    );
  }
};
