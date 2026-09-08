import type { PlatformName } from "../enums/index.js";

export interface PlatformUser {
  userId: string;
  displayName: string;
  platform: PlatformName;
  platformUserId: string;
}

export interface PlatformAdapter {
  login(displayName?: string): Promise<PlatformUser>;
  getPlatformName(): PlatformName;
}

export class DevelopmentPlatformAdapter implements PlatformAdapter {
  getPlatformName(): PlatformName {
    return "DEVELOPMENT";
  }

  async login(displayName = "无名旅者"): Promise<PlatformUser> {
    const anonymousId = `DEV_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      userId: anonymousId,
      displayName,
      platform: "DEVELOPMENT",
      platformUserId: anonymousId
    };
  }
}
