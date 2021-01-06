import {Observable, of} from "rxjs";
import {InterpretEventResult} from "../interfaces";
import {MenuOptionAnswers} from "../enums";
import {RedisInterpreter} from "./redis-interpreter";
import {map, tap} from "rxjs/operators";
import {bgMagenta} from "chalk";
import {setValue} from "../cli/questions";
import {Prompt} from "../cli";
import {Answers} from "inquirer";
import {TO_FINISH, TO_NEXT, TO_SET_KEY, TO_START} from "../constants";

export class EventProcessor {

    private redisClient: RedisInterpreter;
    private prompt: Prompt;

    constructor(redisClient: RedisInterpreter, prompt: Prompt) {
        this.redisClient = redisClient
        this.prompt = prompt;
    }

    get answers(): Answers {
        return this.prompt.answers;
    }

    get eventType(): MenuOptionAnswers | null {
        const eventType = this.prompt.answers["menuOption"]
        return eventType ? eventType : null;
    }

    get selectedKey(): string {
        const selectedKey = this.prompt.answers["setKey"]
        return selectedKey ? selectedKey : "";
    }

    public processMenuOption(response: MenuOptionAnswers): Observable<InterpretEventResult> {
        switch (response) {
            case MenuOptionAnswers.getValue: return of(TO_SET_KEY)
            case MenuOptionAnswers.setValue: return of(TO_SET_KEY)
            case MenuOptionAnswers.deleteKey: return of(TO_SET_KEY)
            case MenuOptionAnswers.close: return of(TO_FINISH)
            default: return of(TO_START)
        }
    }

    public processSetKey(): Observable<InterpretEventResult> {
        if(this.eventType === MenuOptionAnswers.setValue) {
            return of({nextQuestion: setValue, ...TO_NEXT})
        } else if(this.eventType === MenuOptionAnswers.deleteKey) {
            return this.processDeleteKey()
        } else {
            return this.getValue()
        }
    }

    public processDeleteKey(): Observable<InterpretEventResult> {
        return this.goBackToStart(
            this.redisClient.deleteKey(this.selectedKey).pipe(
                tap((value) => console.log(bgMagenta.black(`[DEL] Result: `, value)))
            )
        )
    }

    public processSetValue(response: string): Observable<InterpretEventResult> {
        return this.goBackToStart(
            this.redisClient.set(this.selectedKey, response).pipe(
                tap((value) => console.log(bgMagenta.black(`[SET] Result: `, value)))
            )
        )
    }

    private getValue(): Observable<InterpretEventResult> {
        return this.goBackToStart(
            this.redisClient.get(this.selectedKey).pipe(
                tap((value) => console.log(bgMagenta.black(`[GET] Value of ${this.selectedKey}: `, value)))
            )
        )
    }

    private goBackToStart(source$: Observable<any>): Observable<InterpretEventResult> {
        return source$.pipe(map<any,InterpretEventResult>(() => TO_START))
    }

}
