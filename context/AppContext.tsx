"use client";

import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

type ChatType = {
  _id: string;
  userId: string;
  name: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
};

type AppContextType = {
  user: ReturnType<typeof useUser>["user"];
  isLoaded: boolean;
  isSignedIn: boolean | undefined;

  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;

  selectedChat: ChatType | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatType | null>>;

  fetchUsersChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return ctx;
};

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

  const createNewChat = async () => {
    try {
      if (!user) return;

      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsersChats();
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        const chatList: ChatType[] = data.chats || data.data || [];

        if (chatList.length === 0) {
          await createNewChat();
          return;
        }

        chatList.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setChats(chatList);
        setSelectedChat(chatList[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Error fetching chats");
    }
  };

  useEffect(() => {
    if (user) fetchUsersChats();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoaded,
      isSignedIn,
      chats,
      setChats,
      selectedChat,
      setSelectedChat,
      fetchUsersChats,
      createNewChat,
    }),
    [user, isLoaded, isSignedIn, chats, selectedChat]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext };
