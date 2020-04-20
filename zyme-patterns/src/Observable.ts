export type ObservableCallback<T = void> = (arg: T) => void;

export class Observable<T extends object> {
    private $$events: { [event: string]: ObservableCallback<any>[] } = {};

    public on<TEvent extends keyof T, TArg extends T[TEvent]>(
        event: TEvent,
        fct: ObservableCallback<TArg>
    ) {
        const e = event as string;
        this.$$events[e] = this.$$events[e] || [];
        this.$$events[e].push(fct);

        return () => this.off(event, fct);
    }

    public off<TEvent extends keyof T, TArg extends T[TEvent]>(
        event: TEvent,
        fct: ObservableCallback<TArg>
    ) {
        const e = event as string;
        const events = this.$$events[e];
        if (!events) {
            return;
        }

        events.splice(events.indexOf(fct), 1);
    }

    protected emit<TEvent extends keyof T, TArg extends T[TEvent]>(event: TEvent, arg: TArg): void {
        const events = this.$$events[event as string];
        if (!events) {
            return;
        }

        for (const cb of events) {
            cb(arg);
        }
    }
}
