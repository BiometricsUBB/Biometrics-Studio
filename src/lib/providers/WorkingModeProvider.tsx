import {
    type PropsWithChildren,
    createContext,
    useContext,
    useMemo,
} from "react";
import { WORKING_MODE } from "@/views/selectMode";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

interface IWorkingModeProviderProps {
    workingMode: WORKING_MODE | "";
    setWorkingMode: (mode: WORKING_MODE) => void;
}

export const WorkingModeProviderContext = createContext(
    {} as IWorkingModeProviderProps
);
export const useWorkingMode = () => useContext(WorkingModeProviderContext);

export function WorkingModeProvider({ children }: PropsWithChildren) {
    const [workingMode, setWorkingMode] = useLocalStorage("working_mode", "");

    const value = useMemo(
        () => ({ workingMode, setWorkingMode }),
        [workingMode, setWorkingMode]
    );

    return (
        <WorkingModeProviderContext.Provider value={value}>
            {children}
        </WorkingModeProviderContext.Provider>
    );
}
