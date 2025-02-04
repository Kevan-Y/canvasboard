import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  signUpReqObj;
  signUpResObj;

  loginLoad = false;
  loginReqObj;
  loginResObj;

  token = null;

  constructor(private http: HttpClient, public router: Router, private loadingService: LoadingService) {}

  login(): any {
    this.loginLoad = true;
    this.http.post(environment.apiHost + '/api/v1/login', this.loginReqObj).subscribe(
      (res) => {
        this.loginResObj = res;
        localStorage.setItem('token', this.loginResObj.token);
        this.router.navigate(['/dashboard']);
        this.loginLoad = false;
      },
      (err) => {
        this.loginErrorAlert(err);
        this.loginLoad = false;
      },
    );
  }

  signUp(): any {
    this.http.post(environment.apiHost + '/api/v1/register', this.signUpReqObj).subscribe(
      (res) => {
        this.signUpResObj = res;
        Swal.fire({
          icon: 'success',
          title: `${this.signUpResObj.message}`,
          text: `Verify your e-mail address to finish signing up for Canvasboard`,
        });
        this.loadingService.loadingStatus.next(false);
        this.router.navigate(['/login']);
      },
      (err) => {
        let errMsg;
        if (err.error.message.indexOf('dup key: { user_name:') !== -1) {
          errMsg = 'Username already taken!';
        } else {
          errMsg = err.error.message;
        }
        Swal.fire({ icon: 'error', text: errMsg });
        this.loadingService.loadingStatus.next(false);
      },
    );
  }

  logout(): any {
    this.token = null;
    // Removing Token Value
    localStorage.removeItem('token');
  }

  isUserLoggedIn() {
    // logic
    if (localStorage.getItem('token') !== null) {
      this.token = localStorage.getItem('token');
      return true;
    } else {
      return false;
    }
  }

  loginErrorAlert({ error }: ErrorEvent) {
    if (error.message === 'Please verify your email-id') {
      Swal.fire({
        icon: 'warning',
        text: `Please verify your email address.
       An email has been sent to your registered email id!`,
      });
    } else if (error.message === 'Incorrect password') {
      Swal.fire({ icon: 'error', text: 'Incorrect username or password.' });
    } else if (error.message === 'User not found.') {
      Swal.fire({
        icon: 'warning',
        text: 'This email address does not correspond to a registered account.',
      });
    }
  }
}
