import { Component } from '@angular/core';
import {FormGroup,FormControl,Validators} from'@angular/forms';
import IUser from 'src/app/Models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';

import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
//#region Constructor
constructor(
private auth:AuthService,
private emailtakenValidator :EmailTaken
  ){

    
  }

//#endregion

//#region Properties

  name=new FormControl('',{nonNullable:true,validators:[
    Validators.required,
    Validators.minLength(4),]})
  
  email=new FormControl('',{nonNullable:true
 
    ,validators:[
    Validators.required,
    Validators.email],asyncValidators:[this.emailtakenValidator.validate]}
  )
  age=new FormControl(18,
  {nonNullable:true,validators:[
    Validators.required,
    Validators.min(18),
  Validators.max(70)]})
  password=new FormControl('',
  {nonNullable:true,validators:[
    Validators.required,
  Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]})
  confirm_password=new FormControl('',
  
  {nonNullable:true,validators:[
    Validators.required,
 
  ]})
  phoneNumber=new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.minLength(4)]})
  showAlert = false;
  alertMsg ='Please Wait! Account being created';
  alertColor ='blue';
registerForm = new FormGroup({
name:this.name,
email:this.email,
age:this.age,
password:this.password,
confirm_password:this.confirm_password,
phoneNumber:this.phoneNumber,

},[RegisterValidators.match('password','confirm_password')]);


inSubmission =false;
//#endregion


async register()
{
 this.showAlert = true;
 this. alertMsg ='Please Wait! Account being created'
 this.alertColor='blue'
 this.inSubmission=true

try {
 const user :IUser = {
  name:this.name.value,
  email:this.email.value,
  age:this.age.value,
  password:this.password.value,
  
  phoneNumber:this.phoneNumber.value,
  
  }
this.auth.createUser( user )
} catch (error) {
  console.log(error);



  this. alertMsg ='error occurred please try again'
  this.alertColor='red'
  return
}
this. alertMsg ='Account Has Been Created'
this.alertColor='green'
this.inSubmission=false;
}


}
