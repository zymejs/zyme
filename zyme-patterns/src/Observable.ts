import { Injectable } from 'zyme';

export type ObservableCallback<T = void> = (arg: T) => void;

@Injectable()
export class Observable<T extends object> {
    private $$events: { [event: string]: Array<ObservableCallback<any>> } = {};

    public on<TEvent extends keyof T, TArg extends T[TEvent]>(event: TEvent, fct: ObservableCallback<TArg>) {
        let e = event as string;
        this.$$events[e] = this.$$events[e] || [];
        this.$$events[e].push(fct);

        return () => this.off(event, fct);
    }

    public off<TEvent extends keyof T, TArg extends T[TEvent]>(event: TEvent, fct: ObservableCallback<TArg>) {
        let e = event as string;
        let events = this.$$events[e];
        if (!events) {
            return;
        }

        events.splice(events.indexOf(fct), 1);
    }

    protected emit<TEvent extends keyof T, TArg extends T[TEvent]>(event: TEvent, arg: TArg): void {
        let events = this.$$events[event as string];
        if (!events) {
            return;
        }

        for (let cb of events) {
            cb(arg);
        }
    }
}
