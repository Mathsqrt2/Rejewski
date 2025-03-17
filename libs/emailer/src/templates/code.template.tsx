import { Container, Text, Section, Head, Html, Tailwind, Hr } from "@react-email/components";
import * as React from "react";

export type CodeMessageProps = {
    subject: string,
    welcome: string,
    introduction: string,
    rulesHeading: string,
    rules: string,
    yourCode: string,
    aboutCode: string,
    code: string,
    warning: string
}

export default (props: CodeMessageProps) => {
    return (
        <Html>
            <Head>
                <title>{props.subject}</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <Tailwind config={{
                theme: {
                    extend: {
                        colors: { mainbg: "#eeeeee" },
                        fontFamily: { montserrat: [`montserrat`, `sans-serif`] }
                    }
                }
            }
            }>
                <Container className="max-w-[600px] p-5 bg-white font-montserrat text-center">

                    <Section className="pb-3 bg-mainbg rounded-lg mb-5">
                        <Text className="text-xl font-bold">
                            {props.welcome || "Witam"}
                        </Text>
                        <Text>
                            {props.introduction || `wprowadzenie`}
                        </Text>
                    </Section>

                    <Section className="pb-3 bg-mainbg rounded-lg mb-5">
                        <Text className="text-xl font-bold">
                            {props.rulesHeading}
                        </Text>
                        <Text>
                            {props.rules}
                        </Text>
                    </Section>

                    <Hr />

                    <Section className="pb-3 px-8 bg-mainbg rounded-lg mb-5 text-center">
                        <Text> {props.yourCode}</Text>
                        <Text className="bg-white p-8 text-2xl tracking-[10px] rounded-lg">{props.code || `213769`}</Text>
                        <Text>{props.aboutCode}</Text>
                    </Section>

                    <Hr />

                    <Section className="pb-3 bg-mainbg rounded-lg mb-5">
                        <Text>{props.warning}</Text>
                    </Section>

                </Container>
            </Tailwind>

        </Html >
    );
}
