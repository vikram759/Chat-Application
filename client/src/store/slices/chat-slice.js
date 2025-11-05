export const createChatSlice = (set, get) => ({
  activeChatId: undefined,
  refreshChatList: undefined,
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  selectedChatMembers: [],
  setSelectedChatMembers: (selectedChatMembers) => set({ selectedChatMembers }),
  directMessagesContacts: [],
  // isSeen: false,
  uploadProgress: 0,
  placeholderMessage: undefined,
  // showFileUploadPlaceholder: false,
  uploadFileName: undefined,
  uploadTargetId: undefined,
  friendRequests: [],
  friendRequestsCount: 0,
  setFriendRequestsCount: (friendRequestsCount) => set({ friendRequestsCount }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  // addFriendRequest: (friendRequest, requester) => {
  //   const { friendRequests } = get();
  // },
  addFriendRequestInFriendRequestsList: (friendRequest) => {
    const { friendRequests } = get();
    // set({ friendRequests: [...friendRequests, friendRequest] });
    get().setFriendRequests([...friendRequests, friendRequest]);
  },
  setUploadTargetId: (uploadTargetId) => set({ uploadTargetId }),
  setPlaceholderMessage: (placeholderMessage) => set({ placeholderMessage }),
  // setShowFileUploadPlaceholder: (showFileUploadPlaceholder) =>
  //   set({ showFileUploadPlaceholder }),
  setUploadFileName: (uploadFileName) => set({ uploadFileName }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setIsSeen: (isSeen) => set({ isSeen }),
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setRefreshChatList: (refreshChatList) => set({ refreshChatList }),
  // setRefreshFriendRequests: (refreshFriendRequests) =>
  //   set({ refreshFriendRequests }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
      selectedChatMembers: [],
    }),
  addMessage: (message) => {
    const { selectedChatMessages } = get();
    const { selectedChatType } = get();
    set({
      placeholderMessage: undefined,
    });
    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "group"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "group" ? message.sender : message.sender._id,
        },
      ],
    });
    // set({
    //   showFileUploadPlaceholder: true,
    // });
  },
  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;
    const fromData =
      message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact) => contact._id === fromId);
    const index = dmContacts.findIndex((contact) => contact._id === fromId);
    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      dmContacts.unshift(fromData);
    }
    set({ directMessagesContacts: dmContacts });
  },

  groups: [],

  setGroups: (groups) => set({ groups }),
  // addGroup: (group) => {
  //   const { groups } = get();
  //   set({ groups: [group, ...groups] });
  // },
  addGroup: (group) => {
    const { groups } = get();
    // Check if the group already exists in the groups array
    const groupExists = groups.some((g) => g._id === group._id);
    // If the group does not exist, add it to the beginning
    if (!groupExists) {
      set({ groups: [group, ...groups] });
    }
  },
  // deleteGroup: (group) => {
  //   const { groups } = get();
  //   const groupExists = groups.some((g) => g._id === group._id);
  //   if (groupExists) {
  //     set({ groups: groups.filter((g) => g._id !== group._id) });
  //   }
  // },
  addGroupInGroupList: (message) => {
    const { groups } = get();
    const data = groups.find((group) => group._id === message.groupId);
    const index = groups.findIndex((group) => group._id === message.groupId);
    if (index !== -1 && index !== undefined) {
      groups.splice(index, 1);
      groups.unshift(data);
    }
    set({ groups });
  },
  sortGroupList: (group) => {
    const { groups } = get();
    const index = groups.findIndex((g) => g._id === group._id);
    if (index !== -1 && index !== undefined) {
      groups.splice(index, 1);
      groups.unshift(group);
    }
    set({ groups });
  },
  contactOrGroupProfile: undefined,
  setContactOrGroupProfile: (profile) =>
    set({ contactOrGroupProfile: profile }),
});
