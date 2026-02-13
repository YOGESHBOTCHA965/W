import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './signup/signup.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { BikesComponent } from './bikes/bikes.component';
import { PremiumComponent } from './premium/premium.component';
import { BicycleServicesComponent } from './bicycle-services/bicycle-services.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { StandardComponent } from './standard/standard.component';
import { ProComponent } from './pro/pro.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { SlotComponent } from './slot/slot.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'home', component: HomeComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'bikes', component: BikesComponent },
  { path: 'contactus', component: ContactUsComponent },
  { path: 'premium', component: PremiumComponent },
  { path: 'bicycleservices', component: BicycleServicesComponent },
  { path: 'standard', component: StandardComponent },
  { path: 'pro', component: ProComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'thankyou', component: ThankyouComponent },
  { path: 'slot', component: SlotComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
