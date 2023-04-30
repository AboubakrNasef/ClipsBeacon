import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClip } from 'src/app/Models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  constructor(private modal: ModalService, private clipService: ClipService) {}
  inSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please Wait!!';
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();
  clipID = new FormControl('');
  title = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  editForm = new FormGroup({ title: this.title });

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }
  ngOnInit(): void {
    this.modal.register('editClip');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }
this.inSubmission=false;
this.showAlert=false;
    this.clipID.setValue(this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if(!this.activeClip) return;
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please Wait!!';
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something is wrong';
    }
    this.activeClip.title= this.title.value;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Updated Successfully !';
  }
}
