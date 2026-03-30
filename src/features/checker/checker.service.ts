import { http, Result, ServiceResponse } from "../../core";
import { Version } from "./index";

export interface CheckerService {
    checkVersion(): Promise<ServiceResponse<Version>>;
}

class CheckerServiceImpl implements CheckerService {
    async checkVersion(): Promise<ServiceResponse<Version>> {
        const version = await http.get<Version>('version');

        if (!version.ok) {
            return Result.failure(version.error);
        }

        return Result.success(version.value);
    }
}

export const checkerService: CheckerService = new CheckerServiceImpl();
