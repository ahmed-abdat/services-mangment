import { Timestamp } from "firebase/firestore/lite"

export type TUserDate = {
    date : Date | undefined,
    setDate : React.Dispatch<React.SetStateAction<Date | undefined>>
}


export type TUserData = {
    id? : string,
    email : string,
    telephone : string,
    description : string
    startingDate : Date,
    endingDate: Date ,
}


export type TUserTabel = {
    id? : string,
    email : string,
    telephone : string,
    description : string
    startingDate : Timestamp,
    endingDate: Timestamp ,
    reminderDays : number,
    subscriptionStatus? : string
}