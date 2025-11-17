import {X} from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';


function ChatHeader() {
    const {selectedUser , setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore();

  return (
    <div className='p-2.5 border-b border-base-300'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
            {/* Avatar */}
            <div className='avatar'>
                <div className='size-10 rounded-full relative'>
                    <img src={selectedUser.profilePic || '/avatar1.png'} alt={selectedUser.fullName} />
                </div>
            </div>

            {/* User info */}
            <div>
                <h3 className='font-medium'>{selectedUser.fullName}</h3>
                <p className={`text-sm ${onlineUsers.includes(selectedUser._id) ? "text-green-500" : "text-base-content/70"}`}>
                    {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
            </div>
        </div>

        {/* close button */}
        <button onClick={()=>setSelectedUser(null)}>
            <X className='cursor-pointer'/>
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
