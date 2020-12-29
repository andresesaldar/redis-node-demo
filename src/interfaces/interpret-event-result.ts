import {DistinctQuestion} from "inquirer";

export interface InterpretEventResult {
    next: boolean;
    nextQuestion?: DistinctQuestion<any>;
    toStart: boolean;
}