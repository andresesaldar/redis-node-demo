import {Observable, Subject} from "rxjs";
import inquirer, {Answers, DistinctQuestion} from "inquirer";
import {bgGreenBright} from "chalk";
import PromptUI from "inquirer/lib/ui/prompt";

export class Prompt {

    private static _instance: Prompt;
    private readonly questioner: Subject<DistinctQuestion<any>>;

    private inquirerPrompt: Promise<any> & {ui: PromptUI};

    public result:  Observable<Answers>

    public static instance(): Prompt {
        return this._instance || (this._instance = new this())
    }

    private constructor() {
        console.log(bgGreenBright.black("[INFO] INITIALIZING PROMPT"))
        this.questioner = new Subject<inquirer.DistinctQuestion<any>>();
        this.inquirerPrompt = inquirer.prompt(this.questioner);
        this.result = this.inquirerPrompt.ui.process;
    }

    get answers(): Answers {
        return this.inquirerPrompt.ui.answers
    }

    public ask(question: DistinctQuestion<any>): void {
        this.questioner.next(question)
    }

    public cleanAnswers(): void {
        const keys = Object.keys(this.inquirerPrompt.ui.answers)
        keys.forEach(key => delete this.inquirerPrompt.ui.answers[key])
    }

    public close(): void {
        this.questioner.complete();
    }

}
