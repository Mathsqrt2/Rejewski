import { Description } from "./entities/description.entity";
import { Dictionary } from "./entities/dictionary.entity";
import { Channel } from "./entities/channel.entity";
import { Request } from "./entities/request.entity";
import { LocalRole } from "./entities/role.entity";
import { Member } from "./entities/member.entity";
import { Email } from "./entities/email.entity";
import { Code } from "./entities/code.entity";
import { Warn } from "./entities/warn.entity";
import { Log } from "./entities/log.entity";


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