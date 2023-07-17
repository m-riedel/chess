import {createInterface} from "readline";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const cliQuestion = (questionText: string) =>
    new Promise<string>(resolve => rl.question(questionText, resolve));

export default cliQuestion;