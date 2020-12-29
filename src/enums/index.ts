import {MenuOptionAnswers} from "./menu-option-answers";
import {QuestionTypes} from "./question-types";

export * from "./question-types"
export * from "./menu-option-answers"

export type AnyOptionAnswers = MenuOptionAnswers;
export interface Answer {
    name: QuestionTypes;
    answer: AnyOptionAnswers;
}
