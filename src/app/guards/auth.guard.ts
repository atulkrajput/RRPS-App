import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { GetResult, Storage } from '@capacitor/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
  constructor() {}
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return new Promise(async (resolve) => {
      Storage.get({ key: 'studentData' })
        .then((result: GetResult) => {
          const studentData = JSON.parse(result.value);
          if (!!studentData) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }
}
