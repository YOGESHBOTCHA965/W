import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

export interface WowUser {
  _id?: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNo: string;
  emailId: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  user?: WowUser;
  accessToken?: string;
  refreshToken?: string;
  resetToken?: string;
  securityQuestion?: string | null;
  hasSecurityQuestion?: boolean;
  exists?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly CURRENT_USER_KEY = 'wow_current_user';
  private readonly API_URL = '/api/auth';

  isUserLogged: boolean;
  loginStatus: BehaviorSubject<boolean>;
  private currentUser: WowUser | null = null;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Restore session from tokens + cached user profile
    if (this.tokenService.hasTokens()) {
      const saved = localStorage.getItem(this.CURRENT_USER_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
        this.isUserLogged = true;
      } else {
        this.isUserLogged = false;
      }
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      this.isUserLogged = false;
    }
    this.loginStatus = new BehaviorSubject<boolean>(this.isUserLogged);
  }

  // ═══════ Observables ═══════

  getLoginStatus(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }

  getUserLoginStatus(): boolean {
    return this.isUserLogged;
  }

  getCurrentUser(): WowUser | null {
    return this.currentUser;
  }

  getCurrentUserName(): string {
    if (this.currentUser) {
      return this.currentUser.firstName + ' ' + this.currentUser.lastName;
    }
    return '';
  }

  // ═══════ Registration (server-side bcrypt hashing) ═══════

  registerUser(user: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/register`, user);
  }

  // ═══════ Login (server verifies bcrypt + issues JWT pair) ═══════

  loginUser(emailId: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/login`, { emailId, password }).pipe(
      tap(res => {
        if (res.success && res.accessToken && res.refreshToken && res.user) {
          // Store tokens securely
          this.tokenService.saveTokens(res.accessToken, res.refreshToken);
          // Cache user profile (no password hash present)
          this.currentUser = res.user;
          this.isUserLogged = true;
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(res.user));
          this.loginStatus.next(true);
        }
      })
    );
  }

  // ═══════ Logout (invalidates refresh token server-side) ═══════

  logoutUser(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of({ success: true, message: 'Logged out.' });
      })
    );
  }

  private clearSession(): void {
    this.isUserLogged = false;
    this.currentUser = null;
    this.tokenService.clearTokens();
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.loginStatus.next(false);
  }

  /** @deprecated Use logoutUser() observable instead */
  setUserLogout(): void {
    this.clearSession();
  }

  // ═══════ Forgot Password: Step 1 - Send OTP + get security question ═══════

  forgotPassword(emailId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/forgot-password`, { emailId });
  }

  // ═══════ Forgot Password: Get security question ═══════

  getSecurityQuestion(email: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.API_URL}/security-question`, {
      params: { email }
    });
  }

  // ═══════ Forgot Password: Step 2a - Verify OTP ═══════

  verifyOtp(emailId: string, otp: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/verify-otp`, { emailId, otp });
  }

  // ═══════ Forgot Password: Step 2b - Verify Security Q + DOB ═══════

  verifyIdentity(emailId: string, securityAnswer: string, dob: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/verify-identity`, {
      emailId, securityAnswer, dob
    });
  }

  // ═══════ Forgot Password: Step 3 - Reset password ═══════

  resetPassword(emailId: string, newPassword: string, resetToken: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/reset-password`, {
      emailId, newPassword, resetToken
    });
  }

  // ═══════ Profile ═══════

  getProfile(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.API_URL}/me`);
  }

  // ═══════ Booking API helpers ═══════

  createBooking(booking: any): Observable<any> {
    return this.http.post('/api/booking', booking);
  }

  getMyBookings(): Observable<any> {
    return this.http.get('/api/booking');
  }

  // ═══════ Payment API helpers ═══════

  processPayment(bookingId: string, paymentMethod: string): Observable<any> {
    return this.http.post('/api/payment/process', { bookingId, paymentMethod });
  }

  skipPayment(bookingId: string): Observable<any> {
    return this.http.post('/api/payment/skip', { bookingId });
  }

  // ═══════ Review API helpers ═══════

  submitReview(review: { bookingId: string; rating: number; comment: string }): Observable<any> {
    return this.http.post('/api/review', review);
  }

  getMyReviews(): Observable<any> {
    return this.http.get('/api/review/my');
  }

  getPublicReviews(): Observable<any> {
    return this.http.get('/api/review/public');
  }

  getReviewStats(): Observable<any> {
    return this.http.get('/api/review/stats');
  }

  // ═══════ Referral & Loyalty API helpers ═══════

  getMyReferral(): Observable<any> {
    return this.http.get('/api/referral/my');
  }

  applyReferralCode(referralCode: string): Observable<any> {
    return this.http.post('/api/referral/apply', { referralCode });
  }

  getReferralLeaderboard(): Observable<any> {
    return this.http.get('/api/referral/leaderboard');
  }

  // ═══════ Subscription API helpers ═══════

  getSubscriptionPlans(): Observable<any> {
    return this.http.get('/api/subscription/plans');
  }

  subscribeToPlan(plan: string): Observable<any> {
    return this.http.post('/api/subscription/subscribe', { plan });
  }

  getMySubscription(): Observable<any> {
    return this.http.get('/api/subscription/my');
  }

  cancelSubscription(): Observable<any> {
    return this.http.post('/api/subscription/cancel', {});
  }

  // ═══════ Waitlist API helpers ═══════

  joinWaitlist(data: { email: string; city: string; name?: string }): Observable<any> {
    return this.http.post('/api/waitlist/join', data);
  }

  getWaitlistCounts(): Observable<any> {
    return this.http.get('/api/waitlist/count');
  }

  // ═══════ SOS & Tracking API helpers ═══════

  createSOSBooking(data: { vehicleType: string; address: string; brand?: string; model?: string; notes?: string; contactNo?: string }): Observable<any> {
    return this.http.post('/api/booking/sos', data);
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.patch(`/api/booking/${bookingId}/cancel`, {});
  }

  trackBooking(bookingId: string): Observable<any> {
    return this.http.get(`/api/booking/${bookingId}/track`);
  }

  // ═══════ Price Calculator (client-side) ═══════

  calculatePrice(vehicleType: string, servicePlan: string, issues: string[]): { base: number; extras: number; total: number; discount: number } {
    const basePrices: any = {
      bike: { standard: 49, premium: 99, pro: 199 },
      bicycle: { standard: 29, premium: 59, pro: 99 }
    };
    const issuePrices: any = {
      'oil-change': 15, 'brake-repair': 25, 'chain-replace': 20,
      'tire-puncture': 10, 'battery': 35, 'engine-tune': 50,
      'clutch-repair': 30, 'electrical': 40, 'body-work': 60,
      'gear-tuning': 15, 'wheel-truing': 20, 'suspension': 35
    };
    const base = basePrices[vehicleType]?.[servicePlan] || 49;
    const extras = issues.reduce((sum, issue) => sum + (issuePrices[issue] || 0), 0);
    const total = base + extras;
    const discount = total > 200 ? Math.round(total * 0.1) : 0;
    return { base, extras, total: total - discount, discount };
  }
  

brand(){
  return [
    { id: 1, name: "Harley-Davidson" },
    { id: 2, name: "Honda" },
    { id: 3, name: "Yamaha" },
    { id: 4, name: "Kawasaki" },
    { id: 5, name: "Suzuki" },
    { id: 6, name: "Indian" },
    { id: 7, name: "BMW" },
    { id: 8, name: "Ducati" },
    { id: 9, name: "Triumph" },
    { id: 10, name: "KTM" },
    { id: 11, name: "Polaris / Can-Am" },
    { id: 12, name: "Zero (Electric)" }
  ]
}


Modal(){
return [
  // Harley-Davidson (id: 1)
  { id: 1, name: "Street Glide" },
  { id: 1, name: "Road Glide" },
  { id: 1, name: "Softail Standard" },
  { id: 1, name: "Sportster S" },
  { id: 1, name: "Sportster 883" },
  { id: 1, name: "Fat Boy" },
  { id: 1, name: "Electra Glide" },
  { id: 1, name: "Heritage Classic" },
  { id: 1, name: "Low Rider S" },
  { id: 1, name: "Road King" },
  { id: 1, name: "Street Bob" },
  { id: 1, name: "Fat Bob" },
  { id: 1, name: "Nightster" },
  { id: 1, name: "Iron 883" },
  { id: 1, name: "Breakout" },
  { id: 1, name: "Pan America" },

  // Honda (id: 2)
  { id: 2, name: "CBR600RR" },
  { id: 2, name: "CBR1000RR" },
  { id: 2, name: "CB500F" },
  { id: 2, name: "CB300R" },
  { id: 2, name: "CRF450R" },
  { id: 2, name: "Africa Twin" },
  { id: 2, name: "Gold Wing" },
  { id: 2, name: "Rebel 500" },
  { id: 2, name: "Rebel 1100" },
  { id: 2, name: "NC750X" },
  { id: 2, name: "CB650R" },
  { id: 2, name: "CRF300L" },

  // Yamaha (id: 3)
  { id: 3, name: "YZF-R1" },
  { id: 3, name: "YZF-R7" },
  { id: 3, name: "YZF-R3" },
  { id: 3, name: "MT-07" },
  { id: 3, name: "MT-09" },
  { id: 3, name: "MT-10" },
  { id: 3, name: "Tenere 700" },
  { id: 3, name: "XSR900" },
  { id: 3, name: "Bolt" },
  { id: 3, name: "V Star 250" },
  { id: 3, name: "YZ450F" },

  // Kawasaki (id: 4)
  { id: 4, name: "Ninja ZX-10R" },
  { id: 4, name: "Ninja ZX-6R" },
  { id: 4, name: "Ninja 650" },
  { id: 4, name: "Ninja 400" },
  { id: 4, name: "Z900" },
  { id: 4, name: "Z650" },
  { id: 4, name: "Z400" },
  { id: 4, name: "Versys 650" },
  { id: 4, name: "Vulcan S" },
  { id: 4, name: "KLR 650" },
  { id: 4, name: "Concours 14" },

  // Suzuki (id: 5)
  { id: 5, name: "GSX-R1000" },
  { id: 5, name: "GSX-R750" },
  { id: 5, name: "GSX-R600" },
  { id: 5, name: "SV650" },
  { id: 5, name: "V-Strom 650" },
  { id: 5, name: "V-Strom 1050" },
  { id: 5, name: "Hayabusa" },
  { id: 5, name: "Boulevard M109R" },
  { id: 5, name: "DR-Z400SM" },
  { id: 5, name: "GSX-S750" },

  // Indian (id: 6)
  { id: 6, name: "Scout" },
  { id: 6, name: "Scout Bobber" },
  { id: 6, name: "Chief" },
  { id: 6, name: "Chieftain" },
  { id: 6, name: "Roadmaster" },
  { id: 6, name: "FTR 1200" },
  { id: 6, name: "Springfield" },
  { id: 6, name: "Challenger" },
  { id: 6, name: "Super Chief" },

  // BMW (id: 7)
  { id: 7, name: "R 1250 GS" },
  { id: 7, name: "R 1250 RT" },
  { id: 7, name: "S 1000 RR" },
  { id: 7, name: "S 1000 XR" },
  { id: 7, name: "F 850 GS" },
  { id: 7, name: "F 900 R" },
  { id: 7, name: "R nineT" },
  { id: 7, name: "K 1600 GTL" },
  { id: 7, name: "G 310 R" },

  // Ducati (id: 8)
  { id: 8, name: "Panigale V4" },
  { id: 8, name: "Panigale V2" },
  { id: 8, name: "Monster" },
  { id: 8, name: "Monster 937" },
  { id: 8, name: "Multistrada V4" },
  { id: 8, name: "Scrambler Icon" },
  { id: 8, name: "Scrambler Desert Sled" },
  { id: 8, name: "Diavel V4" },
  { id: 8, name: "Streetfighter V4" },
  { id: 8, name: "Hypermotard 950" },

  // Triumph (id: 9)
  { id: 9, name: "Street Triple" },
  { id: 9, name: "Speed Triple 1200" },
  { id: 9, name: "Bonneville T120" },
  { id: 9, name: "Bonneville T100" },
  { id: 9, name: "Tiger 900" },
  { id: 9, name: "Tiger 1200" },
  { id: 9, name: "Scrambler 1200" },
  { id: 9, name: "Rocket 3" },
  { id: 9, name: "Trident 660" },
  { id: 9, name: "Speed 400" },

  // KTM (id: 10)
  { id: 10, name: "390 Duke" },
  { id: 10, name: "790 Duke" },
  { id: 10, name: "1290 Super Duke R" },
  { id: 10, name: "RC 390" },
  { id: 10, name: "890 Adventure" },
  { id: 10, name: "1290 Super Adventure" },
  { id: 10, name: "690 Enduro R" },

  // Polaris / Can-Am (id: 11)
  { id: 11, name: "Slingshot S" },
  { id: 11, name: "Slingshot R" },
  { id: 11, name: "Can-Am Ryker" },
  { id: 11, name: "Can-Am Spyder F3" },
  { id: 11, name: "Can-Am Spyder RT" },

  // Zero Electric (id: 12)
  { id: 12, name: "SR/F" },
  { id: 12, name: "SR/S" },
  { id: 12, name: "FX" },
  { id: 12, name: "FXE" },
  { id: 12, name: "DSR/X" },
  { id: 12, name: "S" }
]
}


  }



