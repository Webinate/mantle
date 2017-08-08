declare module 'modepress' {
    export interface IMessage {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
    }
}