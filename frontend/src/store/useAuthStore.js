import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from 'socket.io-client'


// const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:5001' : "https://chat-app-pcgp.onrender.com"
const BASE_URL =  "https://chat-app-pcgp.onrender.com"

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers : [],
  socket : null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      console.log("Auth check failed", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success(res.data?.message);

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success(res.data?.message);

      get().connectSocket();

    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      // important for uploading image
      const res = await axiosInstance.put("/auth/update-profile", data);

      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket : () =>{

    const {authUser} = get()

    if(!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL,{
      query : {
        transports: ["websocket"],
        userId : authUser._id,
      }
    });
    socket.connect();
    set({socket : socket});

    socket.on("profileUpdated", ({userId, profilePic})=>{
      if(authUser && authUser._id === userId){
        set({
          authUser : {
            ...authUser, profilePic
          }
        })
      }
    })

    socket.on("getOnlineUsers", (userIds)=>{
      set({onlineUsers : userIds})
    })
  },

  disconnectSocket : () =>{
    if(get().socket?.connected) get().socket.disconnect();
  }
}));
