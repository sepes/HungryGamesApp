import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive) => {
    const containerRef = useRef(null);
    const previousActiveElement = useRef(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        // Store the previously focused element
        previousActiveElement.current = document.activeElement;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus the first element
        if (firstElement) {
            firstElement.focus();
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift + Tab: go to previous element
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        if (lastElement) {
                            lastElement.focus();
                        }
                    }
                } else {
                    // Tab: go to next element
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        if (firstElement) {
                            firstElement.focus();
                        }
                    }
                }
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            // Restore focus to the previously focused element when panel closes
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isActive]);

    return containerRef;
};