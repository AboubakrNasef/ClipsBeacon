import  firebase from 'firebase/compat/app';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'fbTimestamp'
})
export class FbTimestampPipe implements PipeTransform {
constructor(private datepipe:DatePipe){}


  transform(value: firebase.firestore.FieldValue |undefined){
    if(!value) return '';
    const date = (value as firebase.firestore.Timestamp).toDate()
    return this.datepipe.transform(date,'mediumDate');
  }

}
