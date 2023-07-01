import { ExtractDiffTimePipe } from './../extract-diff-time.pipe';
import { ExtractDatePipe } from './../extract-date.pipe';
import { ExtractTimePipe } from '../extract-time.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeTextPipe } from '../resume-text.pipe';

@NgModule({
  declarations: [
    ExtractTimePipe,
    ExtractDatePipe,
    ExtractDiffTimePipe,
    ResumeTextPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExtractTimePipe,
    ExtractDatePipe,
    ExtractDiffTimePipe,
    ResumeTextPipe
  ]
})
export class SharingPipeModule { }
