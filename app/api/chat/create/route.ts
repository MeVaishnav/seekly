import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }
    //prepare chatdata to be saved in the database

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    //connect to database and create new chat
    await connectDB();
    await Chat.create(chatData);

    return NextResponse.json({ success: true, message: "chat created" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
