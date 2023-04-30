import { ValidationErrors,AbstractControl, ValidatorFn } from "@angular/forms";

export class RegisterValidators {
static match(controlname:string,matchingControlName:string):ValidatorFn
{
    return (group:AbstractControl):ValidationErrors | null=>{

 
const control = group.get(controlname)
const matchingControl = group.get(matchingControlName)
if (!control ||!matchingControl)
{
    return {controlNotFound:false}
}
const error = control.value ===matchingControl.value ? null :{noMatch:true}
matchingControl.setErrors(error)
return error
}
}


}
