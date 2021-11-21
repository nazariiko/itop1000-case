import React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { buffer, debounceTime, filter, map } from 'rxjs/operators';

const timer$ = new Observable<number | 'stop' | 'start'>((observer) => {
  let counter = 0;
  let intervalId: ReturnType<typeof setInterval>;

  const start$ = fromEvent(document.getElementsByClassName('start'), 'click');
  const stop$ = fromEvent(document.getElementsByClassName('stop'), 'click');
  const wait$ = fromEvent(document.getElementsByClassName('wait'), 'click');
  const reset$ = fromEvent(document.getElementsByClassName('reset'), 'click');

  start$.subscribe(() => {
    observer.next('start');
    intervalId = setInterval(() => observer.next(counter++), 1000);
  });

  stop$.subscribe(() => {
    counter = 0;
    observer.next('stop');
    observer.next(counter);
    clearInterval(intervalId);
  });

  wait$
    .pipe(
      buffer(wait$.pipe(debounceTime(300))),
      map((clicks) => clicks.length),
      filter((x) => x === 2),
    )
    .subscribe(() => {
      clearInterval(intervalId);
      observer.next('stop');
    });

  reset$.subscribe(() => {
    counter = 0;
    observer.next(counter);
  });
});

const App = () => {
  let [timePassed, setTimePassed] = React.useState(0);
  let [isCounting, setIsCounting] = React.useState(false);

  React.useEffect(() => {
    let subscription = timer$.subscribe({
      next(value) {
        if (typeof value === 'number') {
          setTimePassed(value);
        } else if (value === 'stop') {
          setIsCounting(false);
        } else if (value === 'start') {
          setIsCounting(true);
        } else {
          return;
        }
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const getFormattedTime = (time: number): string[] => {
    let toSeconds = time % 60;
    let toMinutes = Math.floor(time / 60);
    let toHours = Math.floor(time / 3600);

    let seconds = (toSeconds < 10 ? '0' : '') + toSeconds;
    let minutes = (toMinutes < 10 ? '0' : '') + toMinutes;
    let hours = (toHours < 10 ? '0' : '') + toHours;
    return [seconds, minutes, hours];
  };

  return (
    <div className="timer">
      <span className="timeOutput">
        {getFormattedTime(timePassed)[2]}:{getFormattedTime(timePassed)[1]}:
        {getFormattedTime(timePassed)[0]}
      </span>
      <button disabled={isCounting} className="start control-button">
        Start
      </button>
      <button disabled={!isCounting} className="stop control-button">
        Stop
      </button>
      <button className="wait control-button">Wait</button>
      <button className="reset control-button">Reset</button>
    </div>
  );
};

export default App;
