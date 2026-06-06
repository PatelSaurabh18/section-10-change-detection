import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MessagesListComponent {
  // messages = input.required<string[]>();
    private messagesService = inject(MessagesService);
    public messages = this.messagesService.allMessages;

  get debugOutput() {
    console.log('[MessagesList] "debugOutput" binding re-evaluated.');
    return 'MessagesList Component Debug Output';
  }
}
