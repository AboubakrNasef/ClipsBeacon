import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
showAlert = false;
alertMsg='Please wait!'
alertColor ='blue'
inSubmission = false
  constructor(private auth:AngularFireAuth) {
  

  }
credentials ={
  email:'',
  password:'',
}

async login(){
this.showAlert = true;
this.alertMsg='Please wait!'
this.alertColor ='blue'
this.inSubmission = true
 try {
 await this.auth.signInWithEmailAndPassword(
    this.credentials.email,this.credentials.password
  )
 } catch (error) {
  this.alertMsg='Error occured try again'
this.alertColor ='red'
this.inSubmission = false
return
 }
 this.alertMsg='You Are Logged in'
 this.alertColor ='green'

}


}
