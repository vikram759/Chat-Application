import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessageModel.js";
import Group from "./models/GroupModel.js";

const setupSocket = (server) => {
  console.log("Socket.io server started");

  const io = new SocketIOServer(server, {
    cors: {
      origin: [process.env.ORIGIN],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    console.log(userSocketMap);

    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);
    // const recipientSocketId = message.recipient;

    console.log(
      `Sending message to ${recipientSocketId} from ${senderSocketId}`
    );

    // console.log("recipient: ", message.recipient);
    // console.log("recipientId: ", recipientSocketId);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  const sendFriendRequest = async (friendRequest) => {
    // console.log(friendRequest);
    const recipientSocketId = userSocketMap.get(friendRequest.target._id);
    const senderSocketId = userSocketMap.get(friendRequest.friendRequest.id);

    console.log(
      `Sending friend request to ${recipientSocketId} from ${senderSocketId}`
    );
    if (recipientSocketId) {
      io.to(recipientSocketId).emit(
        "receiveFriendRequest",
        friendRequest.friendRequest
      );
    }
  };

  const sendGroupMessage = async (message) => {
    // console.log("inside send group message");
    const { groupId, sender, content, messageType, fileUrl } = message;
    // console.log("msg content: " + content);
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();
    // console.log("messageData: " + messageData);
    // Select only the fields you want to store in the lastMessage
    const lastMessageData = {
      content: messageData.content,
      messageType: messageData.messageType,
      timestamp: messageData.timestamp,
      fileUrl: messageData.fileUrl,
    };
    // Update the group with the new message and store only selected fields in lastMessage
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: createdMessage._id }, // Push the message ID to the messages array
      $set: { lastMessage: lastMessageData }, // Store only selected fields in lastMessage
    });
    const group = await Group.findById(groupId).populate("members");
    const finalData = { ...messageData._doc, groupId: group._id, group: group };
    // console.log("finalData: " + finalData);
    if (group && group.members) {
      group.members.forEach((member) => {
        // console.log("member: " + member);
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("receiveGroupMessage", finalData);
        }
      });
    }
  };
  const createGroup = async (group) => {
    console.log(group);
    if (group && group.members) {
      group.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member);
        if (memberSocketId) {
          io.to(memberSocketId).emit("receiveGroupCreation", group);
        }
      });
    }
  };

  io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected.`);
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket id: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("sendFriendRequest", sendFriendRequest);
    socket.on("sendGroupMessage", sendGroupMessage);
    socket.on("createGroup", createGroup);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
