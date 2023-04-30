import firebase from 'firebase/compat/app';
import { Component, OnDestroy } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { v4 as uuid } from 'uuid';
import { ClipService } from 'src/app/services/clip.service';
import { IClip } from 'src/app/Models/clip.model';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  constructor(
    private router: Router,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }
  ngOnDestroy(): void {
    this.task?.cancel();
  }
  task: AngularFireUploadTask;
  percentage: number;
  public isDragover = false;
  file: File | null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please Wait! Uploading Clip.';
  inSubmission = false;
  showPercentage = false;
  user: firebase.User | null = null;
  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;
  title = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  uploadForm = new FormGroup({ title: this.title });
  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }
  public async uploadFile() {
    this.uploadForm.disable();
    this.showPercentage = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please Wait! Uploading Clip.';
    this.inSubmission = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    const screenshotRef = this.storage.ref(screenshotPath);
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) return;
      const total = clipProgress + screenshotProgress;
      this.percentage = total / 200;
    });
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL,screenshotURL]=urls
          const clip: IClip = {
            uid: this.user.uid,
            displayName: this.user.displayName,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url:clipURL,
            screenshotURL:screenshotURL,
            screenshotFileName:`${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          const clipDocRef = await this.clipsService.createClip(clip);
          this.alertColor = 'green';
          this.alertMsg = 'Success';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },

        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload Failed';
          this.inSubmission = true;
          this.showPercentage = false;
        },
      });
  }
}
