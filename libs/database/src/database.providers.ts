import { Channel } from "./entities/channel.entity";
import { Member } from "./entities/member.entity";
import { Email } from "./entities/email.entity";
import { Code } from "./entities/code.entity";
import { Log } from "./entities/log.entity";
import { Request } from "./entities/request.entity";
import { Description } from "./entities/description.entity";
import { Dictionary } from "./entities/dictionary.entity";
import { Warn } from "./entities/warn.entity";
import { LocalRole } from "./entities/role.entity";


export const databaseEntities = [
    Channel,
    Code,
    Email,
    Member,
    Log,
    Request,
    Description,
    Dictionary,
    Warn,
    LocalRole,
];