import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { MessagesListComponent } from './messages-list/messages-list.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { MessagesService } from './messages.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  imports: [MessagesListComponent, NewMessageComponent],
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent {
  // messages = signal<string[]>([]);
  private messagesService = inject(MessagesService);

  get debugOutput() {
    console.log('[Messages] "debugOutput" binding re-evaluated.');
    return 'Messages Component Debug Output';
  }

  // onAddMessage(message: string) {
  //   this.messages.update((oldMessages) => [...oldMessages, message]);
  // }
}
