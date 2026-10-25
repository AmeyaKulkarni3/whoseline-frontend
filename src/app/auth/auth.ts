import { inject, Injectable } from "@angular/core";
import { OidcSecurityService } from "angular-auth-oidc-client";

@Injectable({
  providedIn: "root",
})
export class Auth {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  login():void{
    this.oidcSecurityService.authorize();
  }
}
