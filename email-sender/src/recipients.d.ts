/**
 * CSV Recipients Parser
 * Reads recipient data from CSV file
 */
export interface Recipient {
    email: string;
    name: string;
    segment?: string;
    personalizedOpener?: string;
    notes?: string;
}
export declare class RecipientsLoader {
    loadFromCsv(filePath: string): Recipient[];
    loadSingle(email: string, name?: string): Recipient[];
    private isValidEmail;
    createSampleCsv(filePath: string, count?: number): void;
}
