export const maxDuartion=60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server";
import { timeStamp } from "console";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with DeepSeek API key and base URL
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

export async function POST(req:Request) {
    try {
        const { userId } = auth()

        const{chatId,prompt}=await req.json();
        if(!userId){
            return NextResponse.json({
                success:false,
                message:"User not authenticated"
            })
        }

        await connectDB()
        const data=Chat.findOne({userId,_id:chatId})

        const userPrompt={
            role:"user",
            content:prompt,
            timeStamp:data.now()
        }

        data.messages.push(userPrompt);
        
        //call deepseek api to get chat completion
         const completion = await openai.chat.completions.create({
           messages: [
             { role: "user  ", content: prompt},
             store:true,
           ],
           model: "deepseek-chat",
         });

         const message=completion.choices[0].message;
         message.timestamp=Date.now();
         data.messages.push(message);
         data.save();

         return NextResponse.json({success:true,data:message})

    } catch (error) {
        return NextResponse.json({success:false,error:error.message})
    }
}
