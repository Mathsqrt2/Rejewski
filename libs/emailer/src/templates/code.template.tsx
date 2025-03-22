import {
    Container, Text, Section, Head,
    Html, Tailwind, Link, Body,
    Row,
    Column
} from "@react-email/components";
import * as React from "React";
import { CodeMessageProps } from "../emailer.types";

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
                        colors: { mainbg: "#eee", mainfg: "#fff", accent: "#5c5", text: "#000" },
                        fontFamily: { montserrat: [`montserrat`, `sans-serif`] }
                    }
                }
            }}>
                <Body className="bg-mainbg text-black">
                    <Container className="max-w-[600px] p-5 bg-mainbg font-montserrat text-center">

                        <Section className="px-8 py-4 bg-mainfg rounded-lg mb-5 border-solid border-t-[6px] border-accent">
                            <Text className="text-xl font-bold">
                                {props.welcome}
                            </Text>
                            <Text >
                                {props.introduction}
                            </Text>
                        </Section>

                        <Section className="px-8 py-4 bg-mainfg rounded-lg mb-5 text-center border-solid border-t-[6px] border-accent">
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

                        <Section className="px-8 py-4 bg-mainfg rounded-lg mb-5">
                            <Text>{props.warning}</Text>
                        </Section>

                        <Section className="px-6 py-4 bg-mainfg rounded-lg border-solid border-t-[6px] border-accent">
                            <Text className="text-xl font-bold">
                                {props.mediaHeading}
                            </Text>
                            <Row>
                                <Column className="p-3 w-1/4">
                                    <Link href={props.discordLink}>
                                        Discord
                                    </Link>
                                </Column>
                                <Column className="p-3 w-1/4">
                                    <Link href={props.instagramLink} >
                                        Instagram
                                    </Link>
                                </Column>
                                <Column className="p-3 w-1/4">
                                    <Link href={props.facebookLink}>
                                        Facebook
                                    </Link>
                                </Column>
                                <Column className="p-3 w-1/4">
                                    <Link href={props.websiteLink}>
                                        Strona
                                    </Link>
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html >
    );
}
