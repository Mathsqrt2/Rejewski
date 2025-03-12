export type MessageType =
    | `welcomeNewMember`
    | `welcomeReturningMember`
    | `askAboutEmail`
    | `retryToAskAboutEmail`
    | `respondToStrangeEmailFormat`
    | `respondToWrongMessage`
    | `askAboutCode`
    | `informAboutWrongCode`
    | `retryToAskAboutCode`
    | `sendServerRules`