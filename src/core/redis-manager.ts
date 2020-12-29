import {Prompt} from "../cli";
import {bgGreenBright, bgCyan, bgRed, bgYellow} from "chalk";
import {mergeMap} from "rxjs/operators";
import {Observable, of, Subscription} from "rxjs";
import {menuOption} from "../cli/questions";
import {InterpretEventResult} from "../interfaces";
import {EventProcessor} from "./event-processor";
import {Answer, QuestionTypes} from "../enums";
import {RedisInterpreter} from "./redis-interpreter";
import {TO_START} from "../constants";

export class RedisManager {

    private static _instance: RedisManager;

    private readonly redisInterpreter: RedisInterpreter;
    private readonly prompt: Prompt;

    private promptSubscription: Subscription | null;
    private eventProcessor: EventProcessor;

    public static instance(): RedisManager {
        return this._instance || (this._instance = new this())
    }

    private constructor() {
        console.log(bgGreenBright.black("[INFO] INITIALIZING REDIS MANAGER"))
        this.prompt = Prompt.instance();
        this.redisInterpreter = RedisInterpreter.instance();
        this.eventProcessor = new EventProcessor(this.redisInterpreter, this.prompt);
        this.promptSubscription = null;
    }

    private launchMenu() {
        this.prompt.cleanAnswers();
        this.prompt.ask(menuOption);
    }

    private finish(): void {
        console.log(bgGreenBright.black("[INFO] FINISHING REDIS MANAGER EXECUTION"))
        this.prompt.close()
        if(this.promptSubscription) {
            this.promptSubscription.unsubscribe();
            this.promptSubscription = null;
        }
        this.redisInterpreter.disconnect();
    }

    private interpretAnswer(answer: Answer): Observable<InterpretEventResult> {
        const {name, answer: response} = answer;
        console.log(bgYellow.black("[INFO] INTERPRETING EVENT", `${response} on ${name}`))
        switch (name) {
            case QuestionTypes.menuOption: return this.eventProcessor.processMenuOption(response);
            case QuestionTypes.setValue: return this.eventProcessor.processSetValue(response);
            case QuestionTypes.setKey: return this.eventProcessor.processSetKey();
            default: return of(TO_START)
        }

    }

    public listenPromptEvents(): void {
        const promptResult$: Observable<InterpretEventResult> = this.prompt.result.pipe(
            mergeMap<any, Observable<InterpretEventResult>>(
                (answer: Answer) => this.interpretAnswer(answer)
            )
        );
        this.promptSubscription = promptResult$.subscribe(
            ({next, nextQuestion, toStart}) => {
                if(next && nextQuestion) {
                    this.prompt.ask(nextQuestion)
                } else if(toStart) {
                    this.launchMenu()
                } else {
                    this.finish();
                }
            },
            (error) => console.error(bgRed.black("[ERROR]"), error),
            () => console.error(bgCyan.black("[COMPLETE]"))
        )
        this.launchMenu()
    }

}
