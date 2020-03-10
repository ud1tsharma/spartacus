import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MOVE_FOCUS, TrapFocusConfig } from '../keyboard-focus.model';
import { TabFocusDirective } from '../tab/tab-focus.directive';
import { TrapFocusService } from './trap-focus.service';

/**
 * Directive that keeps the focus inside the focussable child elements,
 * also known as a _focus trap_.
 */
@Directive({
  selector: '[cxTrapFocus]',
})
export class TrapFocusDirective extends TabFocusDirective implements OnInit {
  /** configuration options to steer the usage */
  @Input('cxTrapFocus') protected config: TrapFocusConfig;

  @Output() esc = new EventEmitter<boolean>();

  @HostListener('keydown.arrowdown', ['$event'])
  @HostListener('keydown.tab', ['$event'])
  protected handleTrapDown = (event: KeyboardEvent) => {
    this.moveFocus(event, MOVE_FOCUS.NEXT);
  };

  @HostListener('keydown.arrowup', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  protected handleTrapUp = (event: KeyboardEvent) => {
    this.moveFocus(event, MOVE_FOCUS.PREV);
  };

  constructor(
    protected elementRef: ElementRef,
    protected service: TrapFocusService
  ) {
    super(elementRef, service);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Moves the focus of the element reference up or down, depending on the increment.
   * The focus of the element is trapped to avoid it will go out of the group.
   *
   * @param event UIEvent that is used to get the target element. The event is blocked
   *   from standard execution and further bubbling.
   * @param increment indicates whether the next or previous is focussed.
   */
  protected moveFocus(event: UIEvent, increment: number) {
    if (this.service.isFocussed(this.host)) {
      this.service.moveFocus(
        this.host,
        event as UIEvent,
        increment,
        this.config
      );
    }
  }
}