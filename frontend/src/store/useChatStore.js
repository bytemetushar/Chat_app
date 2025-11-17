import {create} from 'zustand'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set,get)=>({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading : false,

    getUsers : async()=>{
        set({isUsersLoading: true})
        try {
            const res = await axiosInstance.get('/messages/user');
            set({users: res.data.filteredUsers});
        } catch (err) {
            toast.error(err.response.data.message);
        }finally{
            set({isUsersLoading : false});
        }
    },

    getMessages : async (userId)=>{
        set({isMessagesLoading : true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            const msgs = Array.isArray(res.data.message) ? res.data.message : []
            set({ messages: msgs })
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally{
            set({isMessagesLoading : false});
        }
    },

    sendMessage : async (messageData)=>{
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            const newMessage = res?.data?.newMessage;

        if (!newMessage) {
            console.log("Unexpected response:", res.data);
            return;
        }

        set((state) => ({
                messages: [...state.messages, newMessage]
            }))
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },


    subscribeToMessages : ()=>{
        const {selectedUser} = get();
        if(!selectedUser) return;

        // optimize this later
        const socket = useAuthStore.getState().socket
        socket.on("newMessage",(newMessage)=>{
            if(newMessage.senderId !== selectedUser._id) return;
            set({messages : [...get().messages , newMessage]})
        })

        socket.on("profileUpdated", ({userId, profilePic})=>{
            set({
                users: get().users.map(u =>
                    u._id === userId ? { ...u, profilePic } : u
                )
            });

            const current = get().selectedUser;
            if (current?._id === userId) {
                set({
                    selectedUser: {
                        ...current,
                        profilePic
                    }
                });
            }
        })
    },

    unsubscribeFromMessages : ()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser : (selectedUser) => set({selectedUser})
}))