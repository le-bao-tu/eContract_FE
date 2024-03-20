import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { keycloakRouter } from '@util';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class KeyCloakApiService {
    constructor(private http: _HttpClient) { }

    verifyToken(token: string) {
        return this.http.post(environment.API_URL + keycloakRouter.verify + "?token=" + token);
    }

    getUserInfo(token: string) {
        return this.http.post(environment.API_URL + keycloakRouter.getUserInfo + "?token=" + token)
    }

    refreshToken(token: string) {
        return this.http.get(environment.API_URL + keycloakRouter.refreshToken + "?token=" + token);
    }

    getAccessToken(authorizationCode: string) {
        return this.http.get(environment.API_URL + keycloakRouter.getAccessToken + "?authorizationCode=" + authorizationCode);
    }

    logout(refreshToken: string) {
        return this.http.get(environment.API_URL + keycloakRouter.logout + "?refreshToken=" + refreshToken);
    }
}
