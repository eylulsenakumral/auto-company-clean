interface SendEmailParams {
    to: string;
    contactName: string;
    companyName: string;
    contactPhone?: string;
    templateId?: 'a' | 'b' | 'c';
}
interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    rateLimited?: boolean;
}
export declare function sendEmail(params: SendEmailParams): Promise<SendResult>;
export declare function handleBounceWebhook(event: any): Promise<void>;
export declare function handleSpamReportWebhook(event: any): Promise<void>;
export declare function handleDeliveryWebhook(event: any): Promise<void>;
export {};
