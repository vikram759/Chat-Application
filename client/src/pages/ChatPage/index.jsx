import { useEffect } from "react";
import ChatList from "../../components/ChatPageComponents/ChatList";
import LeftSidebar from "../../components/ChatPageComponents/LeftSidebar";
import SingleChat from "../../components/ChatPageComponents/SingleChat";
import { useAppStore } from "../../store";
import "./ChatPage.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const {
    userInfo,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
    setActiveChatId,
  } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast.error("Please set up your profile first");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveChatId(undefined);
        setSelectedChatType(undefined);
        setSelectedChatData(undefined);
        setSelectedChatMessages([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="chat-page">
      <LeftSidebar />
      <ChatList />
      <SingleChat />
    </div>
  );
};

export default ChatPage;
