interface Env {
    SENDGRID_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
    ENVIRONMENT?: string;
    LOG_LEVEL?: string;
}
declare const _default: {
    scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<Response>;
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
