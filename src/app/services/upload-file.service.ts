import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Injectable } from '@angular/core';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File, FileEntry, IFile } from '@ionic-native/file/ngx'
import { AlertController, Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  constructor(private file: File, private filePath: FilePath, private platform: Platform, private camera: Camera, private permissionService:
              PermissionService, private androidPermission: AndroidPermissions) { }


  takePicture(sourceType){
    const destinationType = this.platform.is('ios') ? this.camera.DestinationType.NATIVE_URI
    : (this.platform.is('android') ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.DATA_URL);

    const options: CameraOptions = {
      quality: 75,
      destinationType,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType,
      targetWidth: 1024,
      targetHeight: 1024,
      allowEdit: false,
      saveToPhotoAlbum: false,
      correctOrientation: true,

    };

    console.log(options)
    return new Promise((resolve, reject) => {
      this.permissionService.getPermission(sourceType == this.camera.PictureSourceType.CAMERA ? this.androidPermission.PERMISSION.CAMERA : this.androidPermission.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(
        () => {
          console.log('got permission')
          this.camera.getPicture(options)
          .then((imageData) => {
            console.log('imageData');
            console.log(imageData);

            if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
              this.filePath.resolveNativePath(imageData)
                .then(filePath => {
                  resolve(this.readImgSrc(filePath));
                },err => {
                  reject(err);
                });
            } else {
              resolve(this.readImgSrc(imageData));
            }
          },
          err => {
            console.log('err 1 ');
            reject(err);
          });
        }
      )
    });
  }

  readImgSrc(imageData) {
    return new Promise((resolve, reject) => {
        this.file.resolveLocalFilesystemUrl(imageData)
        .then((fileEntry) => {
            (fileEntry as FileEntry).file(file => {
                resolve(this.generateBlobImg(file, imageData));
            }, err => {
                reject(err);
            });
        }, err => {
            reject(err);
        });
    });
  }

  generateBlobImg(file: IFile,imageData) {
    return new Promise((resolve, reject) => {
        const fileName = file.name.substring(0, file.name.lastIndexOf('.') + 1) + 'jpg';
        const fileReader = new FileReader();

        fileReader.readAsArrayBuffer(file);
        fileReader.onload = evt => {
            const imgBlob = new Blob([fileReader.result], { type: 'image/jpeg' });
            resolve({file: imgBlob, name: fileName, imageData})
        };
        fileReader.onerror = error => {
            reject(error);
        };
    });
  }

}
