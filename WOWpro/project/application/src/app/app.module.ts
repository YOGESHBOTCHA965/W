import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider,
  // FacebookLoginProvider
} from '@abacritt/angularx-social-login';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
// import { RegisterAsProfessionalComponent } from './register-as-professional/register-as-professional.component';
// import { HelpComponent } from './help/help.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './signup/signup.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { BikesComponent } from './bikes/bikes.component';
import { FooterComponent } from './footer/footer.component';
import { PremiumComponent } from './premium/premium.component';
import { BicycleServicesComponent } from './bicycle-services/bicycle-services.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PopupComponent } from './popup/popup.component';
import { StandardComponent } from './standard/standard.component';
import { ProComponent } from './pro/pro.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { SlotComponent } from './slot/slot.component';
import { LogoutComponent } from './logout/logout.component';

import { ShowUserComponent } from './show-user/show-user.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PaymentComponent } from './payment/payment.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { JwtInterceptor } from './jwt.interceptor';
import { ServiceHistoryComponent } from './service-history/service-history.component';
import { PriceCalculatorComponent } from './price-calculator/price-calculator.component';
import { ReferralComponent } from './referral/referral.component';
import { EmergencySosComponent } from './emergency-sos/emergency-sos.component';
import { BlogComponent } from './blog/blog.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ReviewsComponent } from './reviews/reviews.component';
// import { ChatComponent } from './chat/chat.component';
@NgModule({
  declarations: [
    AppComponent,
   // EmployeeDashboardComponent,
    LoginComponent,
    HeaderComponent,
    HomeComponent,
    SignUpComponent,
    AboutusComponent,
    BikesComponent,
    FooterComponent,
    PremiumComponent,
    BicycleServicesComponent,
    ContactUsComponent,
    PopupComponent,
    StandardComponent,
    ProComponent,
    PrivacyComponent,
    TermsComponent,
    ThankyouComponent,
    SlotComponent,
    LogoutComponent,

    ShowUserComponent,
     WelcomeComponent,
    PaymentComponent,
    ForgotPasswordComponent,
    ServiceHistoryComponent,
    PriceCalculatorComponent,
    ReferralComponent,
    EmergencySosComponent,
    BlogComponent,
    SubscriptionComponent,
    ReviewsComponent,
    // ChatComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot(),
    HttpClientModule,
    SocialLoginModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              'clientId'
            )
          },
        
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
