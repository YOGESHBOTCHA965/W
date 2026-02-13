// import { Component, OnInit } from '@angular/core';
// import { ChatService, Message }  from '../user.service';

// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css']
// })
// export class ChatComponent implements OnInit {
//   messages: Message[]=[];
//   value:string | undefined
  
//   constructor(public userService:ChatService){} 
  
//   ngOnInit(): void {
//    this.userService.conversation.subscribe((val)=>{
//     this.messages = this.messages.concat(val);

//    });
//   }
//   sendMessage(){
//     this.userService.getBotAnswer(this.value);
//     this.value=''
//   }
// }
