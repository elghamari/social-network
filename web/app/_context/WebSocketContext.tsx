"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WSContextType {
    socket: WebSocket | null;
    isConnected: boolean
};

const WebSocketContext = createContext<WSContextType>({
    socket: null,
    isConnected: false
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/api/ws/chat');
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
        };

        socket.onclose = () => {
            setIsConnected(false);
        };
        socket.onerror = (error) => {
            console.log(' WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};