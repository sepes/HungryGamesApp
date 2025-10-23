import React, { createContext, useContext, useState, useCallback } from 'react';

const TerminalContext = createContext();

export const useTerminal = () => {
    const context = useContext(TerminalContext);
    if (!context) {
        throw new Error('useTerminal must be used within a TerminalProvider');
    }
    return context;
};

export const TerminalProvider = ({ children }) => {
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [isTerminalVisible, setIsTerminalVisible] = useState(false);

    const addTerminalMessage = useCallback((type, message, timestamp = new Date()) => {
        const newMessage = {
            id: `${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            timestamp
        };

        setTerminalOutput(prev => [...prev, newMessage]);
    }, []);

    const logError = useCallback((message) => {
        addTerminalMessage('error', `[ERROR] ${message}`);
    }, [addTerminalMessage]);

    const logWarning = useCallback((message) => {
        addTerminalMessage('warning', `[WARNING] ${message}`);
    }, [addTerminalMessage]);

    const logInfo = useCallback((message) => {
        addTerminalMessage('info', `[INFO] ${message}`);
    }, [addTerminalMessage]);

    const clearTerminal = useCallback(() => {
        setTerminalOutput([]);
    }, []);

    const toggleTerminal = useCallback(() => {
        setIsTerminalVisible(prev => !prev);
    }, []);

    const value = {
        terminalOutput,
        isTerminalVisible,
        addTerminalMessage,
        logError,
        logWarning,
        logInfo,
        clearTerminal,
        toggleTerminal
    };
    return React.createElement(
        TerminalContext.Provider, { value },
        children
    );
};