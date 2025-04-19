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
        youNeedToAcceptRules: (): string => `Aby odblokować zawartość serwera, musisz najpierw zaakceptować regulamin.`,
        tooManyAttempts: (when: string): string => `Spróbowałeś podać kod zbyt wiele razy. Możesz spróbować ponownie po ${when}`,
        codeHasBeenSentToSpecifiedEmail: (email: string) => `Właśnie wysłałem wiadomość z kodem na Twój email: "${email}", podaj mi go aby uzyskać dostęp do serwera.`,
        codeIsStillActive: (): string => `Twój poprzedni kod jest wciąż aktualny, wysłałem go ponownie na Twojego maila. Jeżeli go nie widzisz, sprawdź w spamie.`,
        codeAlreadyExpired: (): string => `Twój ostatni kod już wygasł, podaj ponownie maila, a wyślę Ci nowy`,
        incorrectCode: (): string => `Podany kod jest nieprawidłowy, spróbuj ponownie:`,
    };

    public static defaults: ContentStorage = {
        status: (): string => `✅ W czym mogę służyć?`,
    }

    public static interface: ContentStorage = {
        rulesAcceptButton: (): string => `akceptuję`,
        cancelRulesAcceptance: (): string => `wycofaj akceptację`,
    }

    public static error: ContentStorage = {
        failedToDisplayInviteMessage: (): string => `Failed to display invite message.`,
        failedToAssignRole: (role: string): string => `Failed to assign role ${role} to member.`,
        failedToRemoveRole: (role: string): string => `Failed to remove member role ${role}.`,
        failedToRefreshData: (subject: string): string => `Failed to update ${subject.toLowerCase()} data.`,
        failedToUpdate: (subject: string): string => `Failed to update ${subject}.`,
        notSendable: (): string => `Specified channel is not sendable.`,
        emptyMessage: (type: string): string => `Message from template: "${type}" is empty.`,
        failedToSendButton: (): string => `Failed to send rules button.`,
        failedToSendEmail: (): string => `Failed to send email.`,
        failedToSaveLog: (type: string): string => `Failed to save ${type || `log`} in database.`,
        failedToShowChannel: (): string => `Failed to show validation channel to member.`,
        failedToDiscoverChannel: (hash: string): string => `Failed to discorver channel for member ${hash || ``}`,
        failedToHandleInteraction: (): string => `Failed to handle interaction.`,
        failedToValidatePresence: (): string => `Failed to validate member presence.`,
        failedToHandlePrivateMessage: (): string => `Failed to handle private channel message.`,
        failedToLaunchApplication: (): string => `Failed to launch application.`,
        failedToValidateMember: (): string => `Failed to validate user.`,
        failedToFindChannel: (type?: string): string => `Failed to find${type ? ` ${type}` : ``} channel.`,
        invalidMetadata: (hash?: string): string => `Invalid message metadata for${hash ? ` ${hash}` : ``} message.`,
        failedToHandleMessage: (reason?: string) => `Failed to handle message${reason ? `. ${reason}` : ``}.`,
        failedToEmitEvent: (): string => `Failed to emit rules accept event.`,
    }

    private static actionSuspendedSubject = {
        role: ` Unhandled role type.`,
        missingMembers: ` Private channel has no assigned members.`,
        unpermittedUsage: ` Someone else is using client channel.`,
        unpermittedInteraction: ` Interaction member is not channel owner.`,
        realUserMessageInDevMode: ` Message was sent by real user in development mode.`,
        realUserJoinedInDevMode: ` Real user joined to the server when bot was in development mode.`,
        messageOnRealChannelInDevMode: ` Message was sent on real channel in development mode.`,
        realUserInteractionInDevMode: ` Interaction happened with real user in development mode.`,
        realChannelInteractionInDevMode: ` Interaction happened on real channel in development mode.`
    }

    public static warn: ContentStorage = {
        actionSuspended: (reason?: ActionSuspendedSubject): string => `Action suspended.${reason ? this.actionSuspendedSubject[reason] || `` : ``}`,
        messageDoesntExist: (): string => `Original message doesn't exist`,
        messageAuthorIsBot: (): string => `Message handling canceled. Author is bot.`,
    }

    public static log: ContentStorage = {
        roleHasBeenRemoved: (role: string): string => `Role ${role} has been removed.`,
        roleHasBeenAssigned: (role: string): string => `Role ${role} has been successfully assigned.`,
        dataRefreshed: (subject: string): string => `${this.uppercaseFirst(subject)} refreshed successfully.`,
        messageSent: (): string => `Message sent successfully.`,
        memberJoined: (hash: string): string => `New member ${hash} joined to the server.`,
        memberFound: (hash: string): string => `Member ${hash} found in database.`,
        cronStarted: (name: string): string => `${this.uppercaseFirst(name)} cron started.`,
        appLaunched: (name: string, id: string) => `Application ${name} (${id}) has launched successfully.`,
        eventEmitted: (name?: string) => `Event${name ? ` ${name}` : ``} emitted successfully.`,
    }

    public static exceptions: ContentStorage = {
        notFound: (subject?: NotFoundSubject) => `Specified ${subject.toLowerCase() || `property`} not found.`

    }

}