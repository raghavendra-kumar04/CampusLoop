import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      // Connect to the socket server using proxy pathway
      const newSocket = io({
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket client connected successfully');
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
