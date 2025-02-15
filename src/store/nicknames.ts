import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServerNickname {
  serverId: string;
  nickname: string;
}

interface NicknamesState {
  nicknames: ServerNickname[];
  setNickname: (serverId: string, nickname: string) => void;
  removeNickname: (serverId: string) => void;
  getNickname: (serverId: string) => string | null;
}

export const useNicknamesStore = create<NicknamesState>()(
  persist(
    (set, get) => ({
      nicknames: [],
      setNickname: (serverId, nickname) => {
        // Check if nickname is already used
        const isNicknameUsed = get().nicknames.some(
          n => n.nickname.toLowerCase() === nickname.toLowerCase() && n.serverId !== serverId
        );
        
        if (isNicknameUsed) {
          throw new Error('This nickname is already in use');
        }

        set(state => ({
          nicknames: [
            ...state.nicknames.filter(n => n.serverId !== serverId),
            { serverId, nickname }
          ]
        }));
      },
      removeNickname: (serverId) => 
        set(state => ({
          nicknames: state.nicknames.filter(n => n.serverId !== serverId)
        })),
      getNickname: (serverId) => {
        const nickname = get().nicknames.find(n => n.serverId === serverId);
        return nickname ? nickname.nickname : null;
      }
    }),
    {
      name: 'server-nicknames'
    }
  )
);