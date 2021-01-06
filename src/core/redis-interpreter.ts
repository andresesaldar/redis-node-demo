import {bgGreenBright, bgRed, bgBlueBright} from "chalk";
import {createClient, RedisClient} from "redis";
import {fromEvent, Observable, Subject, throwError} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {redisHost, redisPort} from "../configurations";

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
        this.client = createClient({
            host: redisHost ? redisHost : undefined,
            port: redisPort ? redisPort : undefined
        });
        this.publisher = this.client.duplicate();
        this.subscriber = this.client.duplicate();
        this.listenSubscriberEvents();
        this.listenClientErrors();
    }

    private listenSubscriberEvents() {
        fromEvent(this.subscriber, "message").subscribe(
            (message) => console.log(bgBlueBright.black("[REDIS CLIENT EVENT]"), message)
        )
        this.subscriber.subscribe("set", "del")
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
            if(error) {
                result$.error(error)
                this.publisher.publish("setError", key)
            } else {
                result$.next(data);
                this.publisher.publish("set", key)
            }
            result$.complete();
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

    public deleteKey(key: string): Observable<any> {
        const result$ = new Subject();
        this.client.del(key, (error, data) => {
            console.log(bgGreenBright.black("[REDIS DEL]", key))
            if (error) {
                result$.error(error)
                this.publisher.publish("delError", key)
            } else {
                result$.next(data)
                this.publisher.publish("del", key)
            }
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
