import { ActionSuspendedSubject, ContentStorage, NotFoundSubject } from "@libs/types/content";

export class Content {

    private static uppercaseFirst = (word: string): string => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    public static verificationEmail: ContentStorage = {
        subject: (): string => `Twój kod weryfikacyjny w kole naukowym Cyber Security.`,
        welcome: (): string => `Witaj na serwerze koła naukowego "Cyber Security" Politechniki Opolskiej`,
        introduction: (): string => `O serwerze !!!!todo!!!!`,
        rulesHeading: (): string => `Reguły serwera`,
        rules: (): string => `Pamiętaj, że na serwerze obowiązują pewne reguły, do któych wszyscy `,
        yourCode: (): string => `Twój kod weryfikacyjny:`,
        aboutCode: (): string => `Podaj go Botowi Rejewskiemu aby uzyskać dostęp do serwera.`,
        expiringDate: (endTime: string) => `Uwaga, kod będzie on ważny przez następne 72 godziny. Masz czas do ${endTime}.`,
        warning: (): string => `Jeżeli to nie ty wysłałeś zapytanie weryfikacyjne podając ten adres email, po prostu zignorują tą wiadomość.`,
        mediaHeading: (): string => `Sprawdź nasze media:`,
        facebookLink: (): string => `#`,
        instagramLink: (): string => `#`,
        discordLink: (): string => `#`,
        websiteLink: (): string => `https://cyber-sec.cc/`,
    }

    public static messages: ContentStorage = {
        welcomeNewMember: (): string => `Witaj na serwerze Cyber Security, miło Cię tu widzieć`,
        welcomeReturningMember: (): string => `Witaj na serwerze Cyber Security, cieszymy się że do nas wracasz`,
        askAboutEmail: (): string => `Aby odblokować pełny dostęp do serwera musisz zweryfikować się mailem należącym do Politechniki Opolskiej, podaj swój adres w domenie @po.edu.pl lub @student.po.edu.pl, a ja wyślę Ci na niego kod weryfikacyjny`,
        retryToAskAboutEmail: (): string => `Coś poszło nie tak, podaj mi ponownie swój studencki adres email w domenie @po.edu.pl lub @student.po.edu.pl aby uzyskać pełny dostęp do serwera`,
        respondToStrangeEmailFormat: (): string => `Wygląda na to, że podany adres email jest nie poprawny, spróbuj jeszcze raz`,
        respondToWrongMessage: (): string => `Nie widzę tutaj studenckiego adresu email, podaj mi swój adres aby odblokować pełny dostęp do serwera`,
        askAboutCode: (email?: string): string => `Wysłałem Ci kod weryfikacyjny na maila${email ? ` "${email}"` : ``}, sprawdź swoją skrzynkę i podaj mi kod`,
        retryToAskAboutCode: (): string => `Podaj kod weryfikacyjny aby uzyskać pełny dostęp do serwera`,
        informAboutWrongCode: (code?: string): string => `Kod${code ? ` "${code}"` : ``}, który wpisałeś wygląda na niepoprawny, spróbuj jeszcze raz`,
        sendServerRules: (): string => `todo: Regulamin serwera CyberSec`,
        askAboutAcceptanceOfRules: (): string => `Czy akceptujesz warunki regulaminu?`,
        confirmRulesAcceptance: (): string => `Pomyślnie zaakceptowano regulamin`,
        informAboutMessageRemoval: (): string => `Twoja wiadomość narusza zasady serwera, dlatego została usunięta.\n`,
        informAboutMaliciousLinks: (): string => `- wiadomość zawierała nieodpowiednie linki.\n`,
        informAboutProfanity: (): string => `- wiadomość zawierała niewłaściwe słownictwo.\n`,
        followRulesReminder: (): string => `Zachęcamy do przestrzegania regulaminu serwera.`,

    };

    public static interface: ContentStorage = {
        rulesAcceptButton: (): string => `akceptuję`,
        cancelRulesAcceptance: (): string => `wycofaj akceptację`,
    }

    public static error: ContentStorage = {
        failedToDisplayInviteMessage: (): string => `Failed to display invite message.`,
        failedToAssignRole: (role: string): string => `Failed to assign role ${role} to user.`,
        failedToRemoveRole: (role: string): string => `Failed to remove user role ${role}.`,
        failedToRefreshData: (subject: string): string => `Failed to update ${subject.toLowerCase()} data.`,
        failedToUpdate: (subject: string): string => `Failed to update ${subject}.`,
    }

    private static actionSuspendedSubject = {
        role: `Unhandled role type.`,
    }

    public static warn: ContentStorage = {
        actionSuspended: (reason?: ActionSuspendedSubject): string => `Action suspended.${reason ? this.actionSuspendedSubject[reason] || `` : ``}`
    }

    public static log: ContentStorage = {
        roleHasBeenRemoved: (role: string): string => `Role ${role} has been removed.`,
        roleHasBeenAssigned: (role: string): string => `Role ${role} has been successfully assigned.`,
        dataRefreshed: (subject: string): string => `${this.uppercaseFirst(subject)} refreshed successfully.`,
    }

    public static exceptions: ContentStorage = {
        notFound: (subject?: NotFoundSubject) => `Specified ${subject.toLowerCase() || `property`} not found.`
    }

}