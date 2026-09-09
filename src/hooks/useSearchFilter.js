import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useSearchFilter(paramKey = "search", delay = 350) {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlValue = searchParams.get(paramKey) || "";

    // Track both the input text and what URL value it was last based on
    const [query, setQuery] = useState(urlValue);
    const [prevUrlValue, setPrevUrlValue] = useState(urlValue);

    // If the URL changed externally (e.g., user clicked Back/Forward),
    // update the local state directly during rendering—no cascading effect.
    if (urlValue !== prevUrlValue) {
        setPrevUrlValue(urlValue);
        setQuery(urlValue);
    }

    // Debounce pushing updates back to the URL with replace: true
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParam = searchParams.get(paramKey) || "";
            const trimmed = query.trim();

            if (trimmed !== currentParam) {
                const nextParams = new URLSearchParams(searchParams);
                if (trimmed) {
                    nextParams.set(paramKey, trimmed);
                } else {
                    nextParams.delete(paramKey);
                }
                setSearchParams(nextParams, { replace: true });
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [query, paramKey, delay, searchParams, setSearchParams]);

    const clearSearch = () => {
        setQuery("");
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(paramKey);
        setSearchParams(nextParams, { replace: true });
    };

    return [query, setQuery, clearSearch];
}