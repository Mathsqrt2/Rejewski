import { Container, Text, Section, Head, Html, Tailwind, Hr, Img, Link } from "@react-email/components";
import * as React from "react";

export type CodeMessageProps = {
    subject: string,
    welcome: string,
    introduction: string,
    rulesHeading: string,
    rules: string,
    yourCode: string,
    aboutCode: string,
    codeHeading: string,
    code: string,
    expiringDate: string,
    warning: string,
}

export default (props: CodeMessageProps) => {
    return (
        <Html>
            <Head >
                <title>{props.subject || "Twój kod weryfikacyjny w kole naukowym Cyber Security."}</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <Tailwind config={{
                theme: {
                    extend: {
                        colors: { mainbg: "#eee", mainfg: "#fff", accent: "#5c5" },
                        fontFamily: { montserrat: [`montserrat`, `sans-serif`] }
                    }
                }
            }
            }>
                <Container className="max-w-[600px] p-5 bg-mainbg font-montserrat text-center">

                    <Section className="pb-3 bg-mainfg rounded-lg mb-5 border-solid border-t-[4px] border-accent">
                        <Text className="text-xl font-bold">
                            {props.welcome}
                        </Text>
                        <Text >
                            {props.introduction}
                        </Text>
                    </Section>

                    <Section className="pb-3 bg-mainfg rounded-lg mb-5">
                        <Text className="text-xl font-bold">
                            {props.rulesHeading}
                        </Text>
                        <Text>
                            {props.rules}
                        </Text>
                    </Section>

                    <Hr />

                    <Section className="px-8 py-4 bg-mainfg rounded-lg mb-5 text-center border-solid border-t-[4px] border-accent">
                        <Text className="text-lg pb-2 font-bold">
                            {props.yourCode}
                        </Text>
                        <Text className="bg-mainbg p-8 text-2xl tracking-[10px] rounded-lg">
                            {props.code}
                        </Text>
                        <Text>
                            {props.aboutCode}
                        </Text>
                        <Text>{props.expiringDate}</Text>
                    </Section>

                    <Hr />

                    <Section className="px-8 py-4 bg-mainfg rounded-lg mb-5">
                        <Text>{props.warning}</Text>
                    </Section>

                    <Hr />

                    <Section className=" bg-mainfg rounded-lg border-solid border-t-[4px] border-accent">
                        <Text className="text-xl font-bold">
                            {props.rulesHeading}
                        </Text>

                        <Section className="pb-5">
                            <Link href="#" className="p-3">
                                Discord
                            </Link>
                            <Link href="#" className="p-3">
                                Instagram
                            </Link>
                            <Link href="#" className="p-3">
                                Facebook
                            </Link>
                            <Link href="https://cyber-sec.cc/" className="p-3">
                                Strona
                            </Link>

                        </Section>
                    </Section>

                </Container>
            </Tailwind>

        </Html >
    );
}
