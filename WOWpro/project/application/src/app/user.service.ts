import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface WowUser {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNo: string;
  emailId: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'wow_registered_users';
  private readonly CURRENT_USER_KEY = 'wow_current_user';

  isUserLogged: boolean;
  loginStatus: BehaviorSubject<boolean>;
  private currentUser: WowUser | null = null;

  constructor(private http: HttpClient) {
    // Restore session from localStorage
    const saved = localStorage.getItem(this.CURRENT_USER_KEY);
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.isUserLogged = true;
    } else {
      this.isUserLogged = false;
    }
    this.loginStatus = new BehaviorSubject<boolean>(this.isUserLogged);
  }

  getLoginStatus() {
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

  // ─── Registration (localStorage) ───
  registerUser(user: WowUser): { success: boolean; message: string } {
    const users = this.getRegisteredUsers();
    // Check if email already exists
    const exists = users.find((u: WowUser) => u.emailId.toLowerCase() === user.emailId.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Registered successfully!' };
  }

  // ─── Login (localStorage) ───
  loginUser(emailId: string, password: string): { success: boolean; message: string; user?: WowUser } {
    const users = this.getRegisteredUsers();
    const found = users.find(
      (u: WowUser) => u.emailId.toLowerCase() === emailId.toLowerCase() && u.password === password
    );
    if (found) {
      this.currentUser = found;
      this.isUserLogged = true;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(found));
      this.loginStatus.next(true);
      return { success: true, message: 'Login successful!', user: found };
    }
    return { success: false, message: 'Invalid email or password.' };
  }

  setUserLoggedIn() {
    this.isUserLogged = true;
    this.loginStatus.next(true);
  }

  setUserLogout() {
    this.isUserLogged = false;
    this.currentUser = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.loginStatus.next(false);
  }

  private getRegisteredUsers(): WowUser[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getAllUsers(): WowUser[] {
    return this.getRegisteredUsers();
  }
  



brand(){
  return [
    {
      id: 1,
      name: "Bajaj Pulsar"
    },
    {
      id: 2,
      name: "Bajaj Avenger"
    },
    {
      id: 3,
      name: "Bajaj Platina"
    },
    {
      id: 4,
      name: "Bajaj Discover"
    },
    {
      id: 5,
      name: "Bajaj CT"
    },
    {
      id: 6,
      name: "Bajaj Dominar"
    },
    {
      id: 7,
      name: "TVS Apache"
    },
    {
      id: 8,
      name: "TVS Jupiter"
    },
    {
      id: 9,
      name: "TVS Ntorq"
    },
    {
      id: 10,
      name: "TVS Scooty"
    },
    {
      id: 11,
      name: "Honda Activa"
    },
    {
      id: 12,
      name: "Honda CB"
    },
    {
      id: 13,
      name: "Honda Dio"
    },
    {
      id: 14,
      name: "Honda Grazia"
    },
    {
      id: 15,
      name: "Honda Navi"
    },
    {
      id: 16,
      name: "Honda Livo"
    },
    {
      id: 17,
      name: "Honda X-Blade"
    },
    {
      id: 18,
      name: "Honda Africa Twin"
    },
    {
      id: 19,
      name: "Honda CBR"
    },
    {
      id: 20,
      name: "Honda Dream Neo"
    },
    {
      id: 21,
      name: "Harley-Davidson"
    },
    {
      id: 22,
      name: "Yamaha FZ"
    },
    {
      id: 23,
      name: "Yamaha YZF"
    },
    {
      id: 24,
      name: "Yamaha Fascino"
    },
    {
      id: 25,
      name: "Yamaha Ray"
    },
    {
      id: 26,
      name: "Yamaha MT-15"
    },
    {
      id: 27,
      name: "Yamaha Saluto"
    },
    {
      id: 28,
      name: "Yamaha FZ25"
    },
    {
      id: 29,
      name: "Yamaha RAY-ZR"
    },
    {
      id: 30,
      name: "Yamaha Alpha"
    },
    {
      id: 31,
      name: "Yamaha SZ-RR"
    },
    {
      id: 32,
      name: "Yamaha YZF R1"
    },

    {
      id: 33,
      name: "Yamaha Fazer 25"
    },

    {
      id: 34,
      name: "Yamaha FZS 25"
    },

    {
      id: 35,
      name: "Kawasaki Ninja"
    },

    {
      id: 36,
      name: "Kawasaki Z"
    },

    {
      id: 37,
      name: "Kawasaki Versys"
    },

    {
      id: 38,
      name: "Suzuki Access"
    },

    {
      id: 39,
      name: "Suzuki Burgman"
    },

    {
      id: 40,
      name: "Suzuki Gixxer"
    },

    {
      id: 41,
      name: "Suzuki Intruder"
    },

    {
      id: 42,
      name: "Suzuki V-Storm"
    },

    {
      id: 43,
      name: "Ducati Panigale"
    },

    {
      id: 44,
      name: "Ducati Diavel"
    },

    {
      id: 45,
      name: "Ducati Scrambler"
    },

    {
      id: 46,
      name: "Ducati Multistrada"
    },

    {
      id: 47,
      name: "Ducati Monster"
    },

    {
      id: 48,
      name: "Ducati Hypermotard"
    },

    {
      id: 49,
      name: "KTM Duke"
    },

    {
      id: 50,
      name: "KTM RC"
    },

    {
      id: 51,
      name: "KTM Adventure"
    },

    {
      id: 52,
      name: "KTM Supermoto"
    },

    {
      id: 53,
      name: "Triumph Street Triple"
    },

    {
      id: 54,
      name: "Triumph Speed Triple"
    },

    {
      id: 55,
      name: "Triumph Bonneville"
    },

    {
      id: 56,
      name: "Triumph Tiger"
    },

    {
      id: 57,
      name: "Triumph Scrambler 1200"
    },

    {
      id: 58,
      name: "Royal Enfield Bullet"
    },

    {
      id: 59,
      name: "Royal Enfield Classic"
    },

    {
      id: 60,
      name: "Royal Enfield Thunderbird"
    },

    {
      id: 61,
      name: "Royal Enfield Interceptor 650"
    },

    {
      id: 62,
      name: "Royal Enfield Continental GT 650"
    },

    {
      id: 63,
      name: "BMW G 310"
    },

    {
      id: 64,
      name: "BMW F 750"
    },

    {
      id: 65,
      name: "BMW F 850"
    },

    {
      id: 66,
      name: "BMW R 1250"
    },

    {
      id: 67,
      name: "BMW S 1000"
    },

    {
      id: 68,
      name: "BMW K 1600"
    }

  ]
}


Modal(){
return [
  {
    id: 1,
    name: "Pulsar 220 F"
  },

  {
    id: 1,
    name: "Pulsar NS200"
  },

  {
    id: 1,
    name: "Pulsar 180 F"
  },

  {
    id: 1,
    name: "Pulsar RS200"
  },

  {
    id: 1,
    name: "Pulsar NS16o "
  },

  {
    id: 1,
    name: "Pulsar 150"
  },

  {
    id: 1,
    name: "Pulsar 125    "
  },

  {
    id: 1,
    name: "Pulsar 135"
  },

  {
    id: 2,
    name: "Avenger Cruise 220    "
  },

  {
    id: 2,
    name: "Avenger Street 220    "
  },

  {
    id: 2,
    name: "Avenger Street 160"
  },

  {
    id: 3,
    name: "Platina 110 H-Gear"
  },

  {
    id: 3,
    name: "Platina 110 "
  },

  {
    id: 3,
    name: "Platina 100 Es "
  },

  {
    id: 4,
    name: "Discover 125"
  },

  {
    id: 4,
    name: "Discover 110"
  },

  {
    id: 4,
    name: "Discover 125 ST"
  },

  {
    id: 5,
    name: "CT100B"
  },


  {
    id: 5,
    name: "CT100 ES"
  },

  {
    id: 5,
    name: "CT110"
  },

  {
    id: 6,
    name: "Dominar 400"
  },

  {
    id: 7,
    name: "Apache RTR 200 4v"
  },

  {
    id: 7,
    name: "Apache RTR 160 4V"
  },

  {
    id: 7,
    name: "Apache RR 310"
  },

  {
    id: 7,
    name: "Apache RTR 180"
  },

  {
    id: 8,
    name: "Jupiter Classic"
  },

  {
    id: 8,
    name: "Jupiter ZX"
  },

  {
    id: 8,
    name: "Jupiter Grande    "
  },

  {
    id: 8,
    name: "Jupiter"
  },

  {
    id: 9,
    name: "Ntorq 125    "
  },

  {
    id: 9,
    name: "TVS Star City+"
  },

  {
    id: 9,
    name: "Star City+"
  },

  {
    id: 9,
    name: "TVS Sport    "
  },

  {
    id: 9,
    name: "TVS Victor"
  },

  {
    id: 10,
    name: "Scooty Pep+"
  },

  {
    id: 10,
    name: "Scooty zest"
  },

  {
    id: 11,
    name: "Activa 125"
  },

  {
    id: 11,
    name: "Activa 6G    "
  },

  {
    id: 11,
    name: "Activa 5G"
  },

  {
    id: 11,
    name: "Activa 4G"
  },

  {
    id: 12,
    name: "CB Shine"
  },

  {
    id: 12,
    name: "CB Hornet 160R"
  },

  {
    id: 12,
    name: "CB Unicorn 150"
  },


  {
    id: 12,
    name: "CB Unicorn 160"
  },


  {
    id: 12,
    name: "CB1000R"
  },

  {
    id: 13,
    name: "Honda Dio"
  },

  {
    id: 14,
    name: "Honda Grazia"
  },

  {
    id: 15,
    name: "Honda Navi"
  },

  {
    id: 16,
    name: "Honda Livo"
  },

  {
    id: 17,
    name: "Honda X-Blade"
  },

  {
    id: 18,
    name: "Honda Africa Twin"
  },

  {
    id: 19,
    name: "CBR1000RR"
  },

  {
    id: 19,
    name: "CBR650F"
  },

  {
    id: 19,
    name: "CBR500R"
  },

  {
    id: 19,
    name: "Honda Gold Wing"
  },

  {
    id: 20,
    name: "Honda Dream Neo"
  },

  {
    id: 20,
    name: "Honda Dream Yuga"
  },

  {
    id: 21,
    name: "Street Glide"
  },

  {
    id: 21,
    name: "Road Glide"
  },

  {
    id: 21,
    name: "Softail"
  },

  {
    id: 21,
    name: "Sportster"
  },

  {
    id: 21,
    name: "Touring"
  },

  {
    id: 21,
    name: "Dyna"
  },

  {
    id: 21,
    name: "Fat Boy"
  },

  {
    id: 21,
    name: "Electra Glide"
  },

  {
    id: 21,
    name: "Heritage Softail"
  },

  {
    id: 21,
    name: "Low Rider"
  },

  {
    id: 21,
    name: "Breakout"
  },

  {
    id: 21,
    name: "Night Rod"
  },

  {
    id: 21,
    name: "Pulsar 220 F"
  },

  {
    id: 21,
    name: "V-Rod"
  },

  {
    id: 22,
    name: "FZ-S FI V3.0"
  },

  {
    id: 22,
    name: "FZ FI V3.0"
  },

  {
    id: 23,
    name: "YZF R15 V3.0"
  },

  {
    id: 23,
    name: "YZF R3"
  },

  {
    id: 24,
    name: "Yamaha Fascino"
  },

  {
    id: 25,
    name: "Yamaha Ray"
  },

  {
    id: 26,
    name: "Yamaha MT-15"
  },

  {
    id: 27,
    name: "Yamaha Saluto"
  },

  {
    id: 28,
    name: "Yamaha FZ25"
  },

  {
    id: 29,
    name: "Yamaha RAY-ZR"
  },

  {
    id: 30,
    name: "Yamaha Alpha"
  },

  {
    id: 31,
    name: "Yamaha SZ-RR"
  },

  {
    id: 32,
    name: "Yamaha YZF R1"
  },

  {
    id: 33,
    name: "Yamaha Fazer 25"
  },

  {
    id: 34,
    name: "Yamaha FZS 25"
  },

  {
    id: 35,
    name: "Ninja H2 SX SE+"
  },

  {
    id: 35,
    name: " Ninja ZX-10R"
  },

  {
    id: 35,
    name: "Ninja 1000"
  },

  {
    id: 35,
    name: "Ninja ZX-6R"
  },

  {
    id: 35,
    name: "Ninja 650"
  },

  {
    id: 35,
    name: "Ninja 300"
  },

  {
    id: 35,
    name: "Ninja 400"
  },

  {
    id: 36,
    name: "Z H2"
  },

  {
    id: 36,
    name: "Z900"
  },

  {
    id: 36,
    name: "Z650"
  },

  {
    id: 36,
    name: "Z400"
  },

  {
    id: 37,
    name: "Versys 1000"
  },

  {
    id: 37,
    name: "Versys X-300"
  },

  {
    id: 37,
    name: "Kawasaki Vulcan S"
  },

  {
    id: 38,
    name: "Access 125"
  },

  {
    id: 39,
    name: "Burgman Street"
  },

  {
    id: 40,
    name: "Gixxer SF 250"
  },

  {
    id: 40,
    name: " Gixxer SF"
  },

  {
    id: 40,
    name: "Gixxer 250"
  },

  {
    id: 40,
    name: "Gixxer"
  },

  {
    id: 41,
    name: "Intruder 150"
  },

  {
    id: 42,
    name: "V-Storm 650 XT"
  },

  {
    id: 42,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "RM-Z250"
  },

  {
    id: 44,
    name: "Panigale V4"
  },

  {
    id: 44,
    name: "Panigale V4S"
  },

  {
    id: 44,
    name: "    Panigale V4 Speciale"
  },

  {
    id: 44,
    name: "    Panigale V2"
  },

  {
    id: 45,
    name: "Diavel 1260"
  },

  {
    id: 45,
    name: "    Diavel 1260 S"
  },

  {
    id: 45,
    name: "    Diavel Dark"
  },

  {
    id: 46,
    name: "Scrambler Icon"
  },

  {
    id: 46,
    name: "Scrambler Full Throttle"
  },

  {
    id: 46,
    name: "Scrambler Cafe Racer"
  },

  {
    id: 46,
    name: "Scrambler Desert Sled"
  },

  {
    id: 46,
    name: "  Scrambler 1100"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },

  {
    id: 43,
    name: "Suzuki Hayabusa"
  },



]
}





  }



