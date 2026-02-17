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
import { PaymentComponent } from './payment/payment.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ServiceHistoryComponent } from './service-history/service-history.component';
import { PriceCalculatorComponent } from './price-calculator/price-calculator.component';
import { ReferralComponent } from './referral/referral.component';
import { EmergencySosComponent } from './emergency-sos/emergency-sos.component';
import { BlogComponent } from './blog/blog.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  // Public pages (accessible to everyone)
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
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
  { path: 'logout', component: LogoutComponent },

  // Public feature pages
  { path: 'price-calculator', component: PriceCalculatorComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'subscription', component: SubscriptionComponent },

  // Protected pages (require login)
  { path: 'slot', component: SlotComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'thankyou', component: ThankyouComponent, canActivate: [AuthGuard] },
  { path: 'service-history', component: ServiceHistoryComponent, canActivate: [AuthGuard] },
  { path: 'referral', component: ReferralComponent, canActivate: [AuthGuard] },
  { path: 'sos', component: EmergencySosComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
