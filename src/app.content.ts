import { ContentStorage } from "@libs/types/content";

export class Content {

    public static messages: ContentStorage = {
        welcomeNewMember: () => `Witaj na serwerze cyber security, miło Cię tu widzieć :)`,
        welcomeReturningMember: () => `Witaj na serwerze Cyber Security, cieszymy się że do nas wracasz`,
        askAboutEmail: () => `Aby odblokować pełny dostęp do serwera musisz zweryfikować się mailem należącym do Politechniki Opolskiej, podaj swój adres w domenie @po.edu.pl lub @student.po.edu.pl, a ja wyślę Ci na niego kod weryfikacyjny`,
        retryToAskAboutEmail: () => `Coś poszło nie tak, podaj mi ponownie swój studencki adres email w domenie @po.edu.pl lub @student.po.edu.pl aby uzyskać pełny dostęp do serwera`,
        respondToStrangeEmailFormat: () => `Wygląda na to, że podany adres email jest nie poprawny, spróbuj jeszcze raz`,
        respondToWrongMessage: () => `Nie widzę tutaj studenckiego adresu email, podaj mi swój adres aby odblokować pełny dostęp do serwera`,
        askAboutCode: (email?: string) => `Wysłałem Ci kod weryfikacyjny na adres ${email ? `"${email}"` : ``}, sprawdź swoją skrzynkę i podaj mi kod`,
        retryToAskAboutCode: () => `Podaj kod weryfikacyjny aby uzyskać pełny dostęp do serwera`,
        informAboutWrongCode: (code?: string) => `Kod${code ? ` "${code}"` : ``}, który wpisałeś wygląda na niepoprawny, spróbuj jeszcze raz`,
        sendServerRules: () => `todo: Regulamin serwera cybersec`,
    };

    public static error: ContentStorage = {
        failedToDisplayInviteMessage: () => `Failed to display invite message.`,
    }

    public static warn: ContentStorage = {

    }

    public static log: ContentStorage = {

    }
}