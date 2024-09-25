export declare class GravatarService {
    private readonly GRAVATAR_BASE_URL;
    private readonly DEFAULT_SIZE;
    generateAvatarUrl(email: string, size?: number): string;
    fetchAvatar(email: string, size?: number): Promise<string | null>;
}
