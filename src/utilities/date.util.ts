import * as moment from 'moment';

export class DateUtil {
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    return moment(date).format(format);
  }

  static addDays(date: Date, days: number): Date {
    return moment(date).add(days, 'days').toDate();
  }

  static subtractDays(date: Date, days: number): Date {
    return moment(date).subtract(days, 'days').toDate();
  }

  static addMonths(date: Date, months: number): Date {
    return moment(date).add(months, 'months').toDate();
  }
  static subtractMonths(date: Date, months: number): Date {
    return moment(date).subtract(months, 'months').toDate();
  }
  static addYears(date: Date, years: number): Date {
    return moment(date).add(years, 'years').toDate();
  }
  static subtractYears(date: Date, years: number): Date {
    return moment(date).subtract(years, 'years').toDate();
  }
}
