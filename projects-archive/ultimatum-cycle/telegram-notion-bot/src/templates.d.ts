export interface Template {
    id: string;
    name: string;
    category: string;
    price_stars: number;
    description: string;
    notion_url: string;
    thumbnail: string;
    tags: string[];
    features: string[];
}
export declare class TemplateCatalog {
    private templates;
    constructor();
    getAll(): Template[];
    getById(id: string): Template | undefined;
    getByCategory(category: string): Template[];
    getCategories(): string[];
    search(query: string): Template[];
}
