import {
  fetchMessagesAPI,
  sendMessageAPI,
  deleteMessageAPI,
  editMessageAPI,
  fetchRoomsAPI,
  createDMAPI,
  createGroupAPI,
  fetchUsersAPI,
  updateGroupMembersAPI,
} from './domoAPI';

export const ChatService = {
  fetchMessages:        (roomId)                      => fetchMessagesAPI(roomId),
  sendMessage:          (payload)                     => sendMessageAPI(payload),
  deleteMessage:        (id, roomId)                  => deleteMessageAPI(id, roomId),
  editMessage:          (id, newMessage, originalMsg) => editMessageAPI(id, newMessage, originalMsg),
  fetchRooms:           (username)                    => fetchRoomsAPI(username),
  createDM:             (userA, userB)                => createDMAPI(userA, userB),
  createGroup:          (name, members, createdBy)    => createGroupAPI(name, members, createdBy),
  fetchUsers:           ()                            => fetchUsersAPI(),
  updateGroupMembers:   
          (roomId, roomName, members, updatedMembers) => updateGroupMembersAPI(roomId, roomName, members, updatedMembers),
};