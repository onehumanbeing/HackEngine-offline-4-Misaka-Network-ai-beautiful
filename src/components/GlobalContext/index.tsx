import React, { useState } from "react";

export type TGender = "girl" | "boy";
export type TMsgRole = "user" | "bot" | "system";
export type TMsgType = "text" | "image";
export type TChat = {
  id: string;
  role: TMsgRole;
  type: TMsgType;
  content: string;
  metadata?: any;
};
export type TGoods = {
  id: string;
  name: string;
  imgs: string;
  price: number;
};

export type TGlobalContext = {
  gender: TGender;
  setGender: (gender: TGender) => void;
  chats: TChat[];
  setChats: (chats: TChat[]) => void;
  cart: TGoods[];
  setCart: (goods: TGoods[]) => void;
  showcase: TGoods[];
  setShowcase: (goods: TGoods[]) => void;
};

export const DEFAULT_GLOBAL_CONTEXT: TGlobalContext = {
  gender: "boy",
  setGender: () => {},
  chats: [],
  setChats: () => {},
  cart: [],
  setCart: () => {},
  showcase: [],
  setShowcase: () => {},
};

export const GlobalContext = React.createContext<TGlobalContext>(
  DEFAULT_GLOBAL_CONTEXT
);

export const GlobalContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [gender, setGender] = useState<TGender>("boy");
  const [chats, setChats] = useState<TChat[]>([{
    id: "1",
    role: "bot",
    type: "text",
    content: "你好，我是AI美GPT，有什么可以帮到你的吗？",
  }]);
  const [cart, setCart] = useState<TGoods[]>([]);
  const [showcase, setShowcase] = useState<TGoods[]>([]);
  return (
    <GlobalContext.Provider
      value={{
        gender,
        setGender,
        chats,
        setChats,
        cart,
        setCart,
        showcase,
        setShowcase,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
