import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TerminalMessage, TerminalContextValue } from '../types/component.types';

const TerminalContext = createContext<TerminalContextValue | undefined>(undefined);

export const useTerminal = (): TerminalContextValue => {
    const context = useContext(TerminalContext);
    if (!context) {
        throw new Error('useTerminal must be used within a TerminalProvider');
    }
    return context;
};

interface TerminalProviderProps {
    children: ReactNode;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({ children }) => {
    const [terminalOutput, setTerminalOutput] = useState<TerminalMessage[]>([]);
    const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);

    const addTerminalMessage = useCallback((type: TerminalMessage['type'], message: string, timestamp: Date = new Date()): void => {
        const newMessage: TerminalMessage = {
            id: `${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            timestamp
        };

        setTerminalOutput(prev => [...prev, newMessage]);
    }, []);

    const logError = useCallback((message: string): void => {
        addTerminalMessage('error', `[ERROR] ${message}`);
    }, [addTerminalMessage]);

    const logWarning = useCallback((message: string): void => {
        addTerminalMessage('warning', `[WARNING] ${message}`);
    }, [addTerminalMessage]);

    const logInfo = useCallback((message: string): void => {
        addTerminalMessage('info', `[INFO] ${message}`);
    }, [addTerminalMessage]);

    const clearTerminal = useCallback((): void => {
        setTerminalOutput([]);
    }, []);

    const toggleTerminal = useCallback((): void => {
        setIsTerminalVisible(prev => !prev);
    }, []);

    const value: TerminalContextValue = {
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
        TerminalContext.Provider,
        { value },
        children
    );
};

