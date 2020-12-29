import {bgMagenta, bgRed} from "chalk";
import {RedisManager} from "./core";

console.log(bgMagenta.black("[WELCOME TO REDIS-NODE POC]"))

try {
    const redisManager = RedisManager.instance();
    redisManager.listenPromptEvents()
} catch (error) {
    console.error(bgRed.black("[ERROR]"), error)
}
