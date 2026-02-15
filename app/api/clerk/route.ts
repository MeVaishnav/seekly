import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
      return NextResponse.json(
        { error: "Missing SIGNING_SECRET" },
        { status: 500 }
      );
    }

    const wh = new Webhook(SIGNING_SECRET);

    const headerPayload = await headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id") || "",
      "svix-timestamp": headerPayload.get("svix-timestamp") || "",
      "svix-signature": headerPayload.get("svix-signature") || "",
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const { data, type } = wh.verify(body, svixHeaders) as any;

    await connectDB();

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        break;
    }

    return NextResponse.json({ message: "event received" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Webhook error" },
      { status: 400 }
    );
  }
}
