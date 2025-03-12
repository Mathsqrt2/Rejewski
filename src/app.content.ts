import { ContentStorage } from "@libs/types/content";

export class Content {

    public static messages: ContentStorage = {
        inviteNewMembers: () => `Witaj na serwerze cyber security, miło Cię tu widzieć :)`,
        inviteReturningMembers: () => `Witaj na serwerze Cyber Security, cieszymy się że do nas wracasz`,
        askAboutEmail: () => `Aby odblokować pełny dostęp do serwera musisz zweryfikować się mailem należącym do Politechniki Opolskiej, podaj swój adres, a ja wyślę Ci na niego kod weryfikacyjny`,
        askAboutCode: (email: string) => `Wysłałem Ci kod weryfikacyjny na adres "${email}", sprawdź swoją skrzynkę i podaj mi kod`,
        informAboutWrongCode: () => `Kod, który wpisałeś wygląda na niepoprawny, spróbuj jeszcze raz`,
        retryToAskAboutCode: () => `Podaj kod weryfikacyjny aby uzyskać pełny dostęp do serwera`,
        respondToWrongMessage: () => `Nie widzę tutaj studenckiego adresu email, podaj mi swój adres aby odblokować pełny dostęp do serwera`,
        respondToStrangeEmailFormat: () => `Wygląda na to, że podany adres email jest nie poprawny, spróbuj jeszcze raz`,
    };

    public static error: ContentStorage = {
        failedToDisplayInviteMessage: () => `Failed to display invite message.`,
    }

    public static warn: ContentStorage = {

    }

    public static log: ContentStorage = {

    }
}