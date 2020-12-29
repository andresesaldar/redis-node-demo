import {InterpretEventResult} from "../interfaces";
import {setKey} from "../cli/questions";

export const TO_START: InterpretEventResult = {toStart: true, next: false}
export const TO_NEXT: InterpretEventResult = {toStart: false, next: true}
export const TO_FINISH: InterpretEventResult = {toStart: false, next: false}
export const TO_SET_KEY: InterpretEventResult = Object.assign(TO_NEXT, {nextQuestion: setKey})