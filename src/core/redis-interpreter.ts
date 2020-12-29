import {bgGreenBright, bgRed, bgBlueBright} from "chalk";
import {ClientOpts, createClient, RedisClient} from "redis";
import {fromEvent, Observable, Subject, throwError} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {redisHost} from "../configurations";

export class RedisInterpreter {

    private static _instance: RedisInterpreter;

    private client: RedisClient;
    private publisher: RedisClient;
    private subscriber: RedisClient;

    public static instance(): RedisInterpreter {
        return this._instance || (this._instance = new this())
    }

    private constructor() {
        console.log(bgGreenBright.black("[INFO] INITIALIZING REDIS CLIENT"))
        const options: ClientOpts = {
            host: redisHost ? redisHost : undefined
        }
        this.client = createClient(options);
        this.publisher = createClient(options);
        this.subscriber = createClient(options);
        this.listenSubscriberEvents();
        this.listenClientErrors();
    }

    private listenSubscriberEvents() {
        fromEvent(this.subscriber, "message").subscribe(
            (message) => console.log(bgBlueBright.black("[REDIS CLIENT EVENT]"), message)
        )
        this.subscriber.subscribe("set")
    }

    private listenClientErrors() {
        fromEvent(this.client, "error").pipe(
            mergeMap(error => throwError(error))
        ).subscribe({
            error: (error) => console.error(bgRed.black("[REDIS CLIENT ERROR]"), error)
        })
    }

    public set(key: string, value: any): Observable<any> {
        const result$ = new Subject();
        this.client.set(key, value, (error, data) => {
            console.log(bgGreenBright.black("[REDIS SET]", key));
            error ? result$.error(error) : result$.next(data);
            result$.complete();
            this.publisher.publish("set", key)
        })
        return result$;
    }

    public get(key: string): Observable<any> {
        const result$ = new Subject();
        this.client.get(key, (error, data) => {
            console.log(bgGreenBright.black("[REDIS GET]", key))
            error ? result$.error(error) : result$.next(data);
            result$.complete();
        })
        return result$;
    }

    public disconnect(): void {
        this.client.end(true)
        this.publisher.end(true)
        this.subscriber.end(true)
    }

}