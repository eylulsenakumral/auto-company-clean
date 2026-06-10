/**
 * Email Templates Parser
 * Parses templates from docs/marketing/email-outreach-sequence.md
 */
export interface Template {
    id: number;
    name: string;
    subjects: string[];
    body: string;
}
export interface PersonalizedOpener {
    condition: string;
    opener: string;
}
export declare class TemplateManager {
    getTemplate(id: number): Template | null;
    getAllTemplates(): Template[];
    getPersonalizedOpeners(): PersonalizedOpener[];
    renderTemplate(template: Template, recipient: Recipient, subjectIndex?: number): {
        subject: string;
        html: string;
    };
    private textToHtml;
}
export interface Recipient {
    email: string;
    name: string;
    segment?: string;
    personalizedOpener?: string;
    notes?: string;
}
