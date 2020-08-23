import moment, { Moment } from 'moment';

export type ScheduleEvent = {
  fromTime: string;
  start?: Moment;
  id: string;
  room: string;
  summary: string;
  title: string;
  toTime: string;
  type: string;
  kind: string;
};

export const groupByForEveryoneType = (events: ScheduleEvent[]) => {
  const eventsWithEveryone: { [p: string]: ScheduleEvent | ScheduleEvent[] } =
    events
      .filter(e => e.kind && e.kind.match(/keynote|break/))
      .sort((a, b) => moment(a.fromTime).diff(moment(b.fromTime)))
      .reduce<{ [key: string]: ScheduleEvent }>((result, item) => {
        result[item.fromTime] = item;
        return result;
      }, {});

  const result = { ...eventsWithEveryone };

  const eventsForGroup = events.filter(e => !e.kind || !e.kind.match(/keynote|break/));

  for (const ev of eventsForGroup) {
    for (let i = 0; i < Object.keys(eventsWithEveryone).length; i++) {
      if (moment(ev.fromTime).isBetween(Object.keys(eventsWithEveryone)[i], Object.keys(eventsWithEveryone)[i + 1])) {
        if (Array.isArray(result[`${Object.keys(eventsWithEveryone)[i]} 1`])) {
          (result[`${Object.keys(eventsWithEveryone)[i]} 1`] as ScheduleEvent[]).push(ev);
        } else if (result[`${Object.keys(eventsWithEveryone)[i]} 1`]) {
          result[`${Object.keys(eventsWithEveryone)[i]} 1`] = [result[`${Object.keys(eventsWithEveryone)[i]} 1`] as ScheduleEvent, ev];
        } else {
          result[`${Object.keys(eventsWithEveryone)[i]} 1`] = ev;
        }
      }
    }
  }

  return Object
    .keys(result)
    .sort((a, b) => a.localeCompare(b))
    .reduce<any[]>((arr: any, item) => {
      arr.push(result[item]);
      return arr;
    }, [])
    .map(item => {
      if (Array.isArray(item)) {
        return Object.values(
          item
            .sort((a, b) => a.room.localeCompare(b.room))
            .reduce((obj, it) => {
              if (Array.isArray(obj[it.room])) {
                obj[it.room].push(it);
              } else if (obj[it.room]) {
                obj[it.room] = [obj[it.room], it];
              } else {
                obj[it.room] = it;
              }
              return obj;
            }, {}));
      }
      return item;
    });
};
