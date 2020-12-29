import {InputQuestion, ListQuestion} from "inquirer";
import {MenuOptionAnswers, QuestionTypes} from "../enums";

export const menuOption:  ListQuestion<any> = {
    name: QuestionTypes.menuOption,
    type: "list",
    message: "Seleccione una opción para realizar una acción",
    default: MenuOptionAnswers.getValue,
    choices: [
        {
            name: "Establecer valor",
            value: MenuOptionAnswers.setValue
        },
        {
            name: "Obtener valor",
            value: MenuOptionAnswers.getValue
        },
        {
            name: "Salir",
            value: MenuOptionAnswers.close
        }
    ]
}

export const setValue:  InputQuestion<any> = {
    name: QuestionTypes.setValue,
    type: "input",
    message: "Establezca un valor",
    default: "DEFAULT",
}

export const setKey:  InputQuestion<any> = {
    name: QuestionTypes.setKey,
    type: "input",
    message: "Establezca un clave",
    default: "DEFAULT",
}


