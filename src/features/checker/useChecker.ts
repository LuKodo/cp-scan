import { useEffect, useState } from "react";
import { checkerService } from "./checker.service";

export interface Version {
    version: string;
    minVersion: string;
    downloadUrl: string;
    forceUpdate: boolean;
    changelog: string;
}

export function useChecker() {
    const [version, setVersion] = useState<Version>();

    useEffect(() => {
        const checkVersion = async () => {
            const version = await checkerService.checkVersion();
            if (!version.ok) {
                return;
            }
            setVersion(version.value);
        };
        checkVersion();
    }, []);

    return version;
}