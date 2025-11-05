import { useEffect, useRef, useState } from "react";
import "./SingleChatMessageContainer.css";
import { useAppStore } from "../../../store";
import { apiClient } from "../../../lib/api-client";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_GROUP_MESSAGES_ROUTE,
} from "../../../utils/constants";
import moment from "moment";
import { MdChatBubble } from "react-icons/md";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { PiClockFill } from "react-icons/pi";
import { getColor } from "../../../lib/group-member-color";
import ScrollToBottom from "../ScrollToBottom/scrollToBottom";

const SingleChatMessageContainer = () => {
  const messageContainerRef = useRef();
  const scrollRef = useRef();
  const scrollProgressRef = useRef();
  const placeholderMessageRef = useRef();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    selectedChatMembers,
    setSelectedChatMembers,
    uploadProgress,
    setUploadProgress,
    uploadTargetId,
    setUploadTargetId,
    uploadFileName,
    setUploadFileName,
    placeholderMessage,
    setPlaceholderMessage,
    showFileUploadPlaceholder,
    setShowFileUploadPlaceholder,
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getGroupMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_GROUP_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "group") {
        getGroupMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "instant" });
  //   }
  // }, []);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "auto" });
  //     // scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [selectedChatData]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedChatMessages]);
  useEffect(() => {
    if (scrollProgressRef.current) {
      scrollProgressRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // }, [showFileUploadPlaceholder]);
  }, [uploadProgress]);
  useEffect(() => {
    if (placeholderMessageRef.current) {
      placeholderMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [placeholderMessage]);

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const checkIfImage = (filePath) => {
    // Extract the part before the query parameters
    const pathWithoutParams = filePath.split("?")[0];

    // Define regex to check if it ends with a valid image extension
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif|jfif)$/i;

    // Test the cleaned path
    return imageRegex.test(pathWithoutParams);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");

      const showDate = messageDate !== lastDate;

      const isMessageDateToday =
        moment(Date.now()).format("YYYY-MM-DD") ===
        moment(message.timestamp).format("YYYY-MM-DD");
      const isMessageDateYesterday =
        moment(Date.now()).subtract(1, "days").format("YYYY-MM-DD") ===
        moment(message.timestamp).format("YYYY-MM-DD");
      const isMessageDateThisWeekExceptTodayAndYesterday =
        moment(Date.now()).subtract(2, "days").format("YYYY-MM-DD") ===
          moment(message.timestamp).format("YYYY-MM-DD") ||
        moment(Date.now()).subtract(3, "days").format("YYYY-MM-DD") ===
          moment(message.timestamp).format("YYYY-MM-DD") ||
        moment(Date.now()).subtract(4, "days").format("YYYY-MM-DD") ===
          moment(message.timestamp).format("YYYY-MM-DD") ||
        moment(Date.now()).subtract(5, "days").format("YYYY-MM-DD") ===
          moment(message.timestamp).format("YYYY-MM-DD") ||
        moment(Date.now()).subtract(6, "days").format("YYYY-MM-DD") ===
          moment(message.timestamp).format("YYYY-MM-DD");

      lastDate = messageDate;

      // console.log("showDate: " + showDate);

      return (
        <div key={index}>
          {showDate && (
            <div className="general-date-container">
              <div className="general-date-line left"></div>
              <div className="general-date">
                {isMessageDateToday
                  ? "Today"
                  : isMessageDateYesterday
                  ? "Yesterday"
                  : isMessageDateThisWeekExceptTodayAndYesterday
                  ? moment(message.timestamp).format("dddd")
                  : moment(message.timestamp).format("L")}
              </div>
              <div className="general-date-line right"></div>
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "group" && renderGroupMessages(message)}
        </div>
      );
    });
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", ""); // This forces a download -> Downloads with the original filename from the URL
    // link.setAttribute("download", "myFileName.extension"); // Downloads as "myImage.jpg" for example
    document.body.appendChild(link);
    link.click();
    // link.remove(); redundant -> below line already does the same thing
    document.body.removeChild(link);
  };

  const shortenFileName = (fileName, maxLength = 81) => {
    if (fileName.length <= maxLength) {
      return fileName; // No need to shorten
    }

    const startLength = 24; // Length of the start part
    const endLength = 24; // Length of the end part

    const start = fileName.slice(0, startLength); // First 24 characters
    const end = fileName.slice(-endLength); // Last 24 characters

    const totalLength = fileName.length; // Total length of the original file name
    const dotsCount = totalLength - startLength - endLength; // Calculate number of dots

    // Create dots string based on calculated number
    const dots = dotsCount > 0 ? ".".repeat(dotsCount) : "";

    return `${start}${dots}${end}`;
  };

  const getFileNameFromUrl = (fileName, maxLength = 81) => {
    if (!fileName) return "";

    // Find the last closing parenthesis ")"
    const lastClosingParenIndex = fileName.lastIndexOf(")");

    // Extract the file name part after the last closing parenthesis
    const cleanFileName =
      lastClosingParenIndex !== -1
        ? fileName.substring(lastClosingParenIndex + 1).trim()
        : fileName; // If no closing parenthesis, return the original file name

    return cleanFileName.length > maxLength
      ? cleanFileName.substring(0, maxLength) + "..."
      : cleanFileName;
  };

  const renderDMMessages = (message) => (
    <div
      className={`message ${
        message.sender === selectedChatData._id
          ? "contact-message"
          : "own-message"
      }`}
    >
      <div
        className={`${
          message.sender !== selectedChatData._id
            ? "own-message-content"
            : "contact-message-content"
        } message-content`}
      >
        <div className="user-pointer">
          <MdChatBubble className="user-pointer-icon" />
        </div>
        {message.messageType === "text" && message.content}
        {message.messageType === "file" && message.fileUrl && (
          <div>
            {checkIfImage(message.fileUrl) ? (
              <div
                className="image-container"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl}
                  alt=""
                  style={{
                    width: "12.5rem",
                    height: "12.5rem",
                    // objectFit: "contain",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ) : (
              <div className="file-container">
                <div className="file-icon-container">
                  <MdFolderZip className="file-icon" />
                </div>
                <div className="file-name">
                  {getFileNameFromUrl(
                    message.fileUrl.split("?")[0].split("/").pop()
                  )}
                </div>
                <div className="download-icon-container-link">
                  <a
                    className="download-icon-container"
                    onClick={() => handleDownload(message.fileUrl)}
                  >
                    <IoMdArrowRoundDown className="download-icon" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={`${
            message.messageType === "file" && checkIfImage(message.fileUrl)
              ? "image-timestamp"
              : message.messageType === "file" && !checkIfImage(message.fileUrl)
              ? "file-timestamp"
              : ""
          } timestamp-container`}
        >
          <div className="message-timestamp">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    </div>
  );
  const renderGroupMessages = (message) => (
    <div
      className={`message group-message ${
        message.sender._id === userInfo.id ? "own-message" : "contact-message"
      }`}
    >
      {/* {console.log("selectedChatData")}
      {console.log(selectedChatData)} */}
      {message.sender._id === userInfo.id ? null : (
        <div className="contact-avatar">
          {message.sender.image ? (
            <div className="avatar">
              <img src={message.sender.image} alt="" />
            </div>
          ) : (
            <div className="no-avatar" style={{ color: "#53a6fd" }}>
              {message.sender.firstName && message.sender.lastName
                ? `${message.sender.firstName.charAt(
                    0
                  )} ${message.sender.lastName.charAt(0)}`
                : message.sender.firstName
                ? message.sender.firstName.charAt(0)
                : message.sender.lastName
                ? message.sender.lastName.charAt(0)
                : message.sender.email.charAt(0)}
            </div>
          )}
        </div>
      )}
      <div
        className={`${
          message.sender._id === userInfo.id
            ? "own-message-content"
            : "contact-message-content"
        } message-content`}
      >
        <div className="user-pointer">
          <MdChatBubble className="user-pointer-icon" />
        </div>
        {message.sender._id !== userInfo.id && (
          <div className="group-message-contact-info-above-content">
            <div
              className="contact-info"
              style={{ color: "#53a6fd" }}
            >{`${message.sender.firstName} ${message.sender.lastName}`}</div>
          </div>
        )}
        {message.messageType === "text" && message.content}
        {message.messageType === "file" && message.fileUrl && (
          <div>
            {checkIfImage(message.fileUrl) ? (
              <div
                className="image-container"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={message.fileUrl}
                  alt=""
                  style={{
                    width: "12.5rem",
                    height: "12.5rem",
                    // objectFit: "contain",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ) : (
              <div className="file-container">
                <div className="file-icon-container">
                  <MdFolderZip className="file-icon" />
                </div>
                <div className="file-name">
                  {getFileNameFromUrl(
                    message.fileUrl.split("?")[0].split("/").pop()
                  )}
                </div>
                <div className="download-icon-container-link">
                  <a
                    className="download-icon-container"
                    onClick={() => handleDownload(message.fileUrl)}
                  >
                    <IoMdArrowRoundDown className="download-icon" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={`${
            message.messageType === "file" && checkIfImage(message.fileUrl)
              ? "image-timestamp"
              : message.messageType === "file" && !checkIfImage(message.fileUrl)
              ? "file-timestamp"
              : ""
          } timestamp-container`}
        >
          <div className="message-timestamp">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="message-container" ref={messageContainerRef}>
      {/* {selectedChatMessages.length > 0 ? ( */}
      {renderMessages()}
      {/* ) : (
        <div className="loading-chat-messages-container">
          Loading Messages...
        </div>
      )} */}
      {/* {showFileUploadPlaceholder && uploadTargetId === selectedChatData._id && ( */}
      {uploadProgress > 0 && uploadTargetId === selectedChatData._id && (
        <>
          <div className="message own-message">
            <div className="message-content own-message-content">
              <div className="user-pointer">
                <MdChatBubble className="user-pointer-icon" />
              </div>
              <div>
                <div className="file-container">
                  <div className="file-icon-container">
                    <MdFolderZip className="file-icon" />
                  </div>
                  <div className="file-name">
                    {`Uploading "${shortenFileName(
                      uploadFileName
                    )}": ${uploadProgress.toFixed(2)}%`}
                  </div>
                  <div className="download-icon-container-link">
                    <a
                      className="download-icon-container"
                      style={{ pointerEvents: "none" }}
                    >
                      <IoMdArrowRoundDown className="download-icon" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="timestamp-container file-timestamp">
                <div className="message-timestamp">
                  {/* {moment(message.timestamp).format("LT")} */}
                  {moment(Date.now()).format("LT")}
                </div>
              </div>
            </div>
          </div>
          {/* <div ref={scrollProgressRef} /> */}
          {/* <div ref={scrollRef} /> */}
        </>
      )}
      {/* {console.log("placeholderMessage:")}
      {console.log(placeholderMessage)} */}
      {placeholderMessage !== undefined && (
        // placeholderMessage !== null &&
        // placeholderMessage !== "" &&
        <>
          <div className="message own-message">
            <div className="message-content own-message-content">
              <div className="user-pointer">
                <MdChatBubble className="user-pointer-icon" />
              </div>
              {placeholderMessage}
              <div className="timestamp-container">
                <div className="message-timestamp">
                  {/* {moment(placeholderMessage.timestamp).format("LT")} */}
                  <PiClockFill />
                </div>
              </div>
            </div>
          </div>
          {/* <div ref={placeholderMessageRef} /> */}
        </>
      )}
      <div className="scroll-ref scroll-progress-ref" ref={scrollProgressRef} />
      <div
        className="scroll-ref placeholder-message-ref"
        ref={placeholderMessageRef}
      />
      <ScrollToBottom
        containerRef={messageContainerRef}
        targetRef={scrollRef}
      />
      <div className="scroll-ref" ref={scrollRef} />
    </div>
  );
};

export default SingleChatMessageContainer;
