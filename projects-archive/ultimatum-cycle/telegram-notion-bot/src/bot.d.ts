import 'dotenv/config';
import { Bot, Context } from 'grammy';
declare const bot: Bot<Context, import("grammy").Api<import("grammy").RawApi>>;
export default bot;
