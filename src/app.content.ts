import { ContentStorage } from "@libs/types/content";

export class Content {

    public static verificationEmail: ContentStorage = {
        subject: () => `Twój kod weryfikacyjny w kole naukowym Cyber Security.`,
        welcome: () => ``,
        introduction: () => ``,
        rulesHeading: () => `Reguły serwera`,
        rules: () => `Pamiętaj, że na serwerze obowiązują pewne reguły, do któych wszyscy `,
        code: (code: string) => `Twój kod weryfikacyjny to ${code}, podaj go Botowi Rejewskiemu aby uzyskać dostęp do serwera. Będzie on ważny przez następne 72 godziny.`,
        warning: () => `Jeżeli to nie ty wysłałeś zapytanie weryfikacyjne podając ten adres email, po prostu zignorują tą wiadomość.`,

    }

    public static messages: ContentStorage = {
        welcomeNewMember: () => `Witaj na serwerze Cyber Security, miło Cię tu widzieć`,
        welcomeReturningMember: () => `Witaj na serwerze Cyber Security, cieszymy się że do nas wracasz`,
        askAboutEmail: () => `Aby odblokować pełny dostęp do serwera musisz zweryfikować się mailem należącym do Politechniki Opolskiej, podaj swój adres w domenie @po.edu.pl lub @student.po.edu.pl, a ja wyślę Ci na niego kod weryfikacyjny`,
        retryToAskAboutEmail: () => `Coś poszło nie tak, podaj mi ponownie swój studencki adres email w domenie @po.edu.pl lub @student.po.edu.pl aby uzyskać pełny dostęp do serwera`,
        respondToStrangeEmailFormat: () => `Wygląda na to, że podany adres email jest nie poprawny, spróbuj jeszcze raz`,
        respondToWrongMessage: () => `Nie widzę tutaj studenckiego adresu email, podaj mi swój adres aby odblokować pełny dostęp do serwera`,
        askAboutCode: (email?: string) => `Wysłałem Ci kod weryfikacyjny na maila${email ? ` "${email}"` : ``}, sprawdź swoją skrzynkę i podaj mi kod`,
        retryToAskAboutCode: () => `Podaj kod weryfikacyjny aby uzyskać pełny dostęp do serwera`,
        informAboutWrongCode: (code?: string) => `Kod${code ? ` "${code}"` : ``}, który wpisałeś wygląda na niepoprawny, spróbuj jeszcze raz`,
        sendServerRules: () => `todo: Regulamin serwera CyberSec`,
        askAboutAcceptanceOfRules: () => `Czy akceptujesz warunki regulaminu?`,
        confirmRulesAcceptance: () => `Pomyślnie zaakceptowano regulamin`,
    };

    public static interface: ContentStorage = {
        rulesAcceptButton: () => `akceptuję`,
        cancelRulesAcceptance: () => `wycofaj akceptację`,
    }

    public static error: ContentStorage = {
        failedToDisplayInviteMessage: () => `Failed to display invite message.`,
    }

    public static warn: ContentStorage = {

    }

    public static log: ContentStorage = {

    }
}