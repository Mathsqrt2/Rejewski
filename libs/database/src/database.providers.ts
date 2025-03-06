import { Chat } from "./TypeORM/chat.entity";
import { Code } from "./TypeORM/code.entity";
import { Email } from "./TypeORM/email.entity";
import { StartLog } from "./TypeORM/start_log.entity";
import { User } from "./TypeORM/user.entity";

export const databaseEntities = [Chat, Code, Email, User, StartLog];