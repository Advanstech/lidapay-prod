"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
const moment = require("moment");
class DateUtil {
    static formatDate(date, format = 'YYYY-MM-DD') {
        return moment(date).format(format);
    }
    static addDays(date, days) {
        return moment(date).add(days, 'days').toDate();
    }
    static subtractDays(date, days) {
        return moment(date).subtract(days, 'days').toDate();
    }
    static addMonths(date, months) {
        return moment(date).add(months, 'months').toDate();
    }
    static subtractMonths(date, months) {
        return moment(date).subtract(months, 'months').toDate();
    }
    static addYears(date, years) {
        return moment(date).add(years, 'years').toDate();
    }
    static subtractYears(date, years) {
        return moment(date).subtract(years, 'years').toDate();
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map