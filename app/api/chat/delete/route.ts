import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { chatId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    //connect to mongodb database and delete the chat
    await connectDB();
    await Chat.deleteOne({ _id: chatId, userId });

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
