import { IAvailability, IBlockedDate } from "../interfaces/serviceProvider.interface";

interface IAssignmentSchedule {
    jobId?: {
        schedule?: {
            startDate: Date | string;
            startTime: string;
            endTime: string;
        };
    };
}

export class AvailabilityValidator {
    static isWithinWeeklyAvailability(
        availability: IAvailability[],
        jobDate: Date,
        startTimeStr: string,
        endTimeStr: string
    ): boolean {
        if (!availability || !Array.isArray(availability)) {
            return false;
        }

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const jobDayName = days[jobDate.getDay()];

        const dayAvailability = availability.find(a => a.day === jobDayName);

        if (!dayAvailability || !dayAvailability.isAvailable) {
            return false;
        }

        const toMinutes = (time: string) => {
            const [hrs, mins] = time.split(":").map(Number);
            return hrs * 60 + mins;
        };

        const providerStart = toMinutes(dayAvailability.startTime);
        const providerEnd = toMinutes(dayAvailability.endTime);
        const jobStart = toMinutes(startTimeStr);
        const jobEnd = toMinutes(endTimeStr);

        return jobStart >= providerStart && jobEnd <= providerEnd;
    }

    static isDateBlocked(blockedDates: IBlockedDate[], jobDate: Date): boolean {
        if (!blockedDates || !Array.isArray(blockedDates)) {
            return false;
        }

        const jobTime = jobDate.getTime();

        return blockedDates.some(blocked => {
            const start = new Date(blocked.startDate).getTime();
            const end = new Date(blocked.endDate).getTime();

            return jobTime >= start && jobTime <= end;
        });
    }

    static doesOverlapWithAssignments(
        existingAssignments: IAssignmentSchedule[],
        newJobDate: Date,
        newStartTimeStr: string,
        newEndTimeStr: string,
        bufferHours: number = 1
    ): boolean {
        if (!existingAssignments || !Array.isArray(existingAssignments)) {
            return false;
        }

        const toDateWithTime = (date: Date, timeStr: string) => {
            const d = new Date(date);
            const [hrs, mins] = timeStr.split(":").map(Number);
            d.setHours(hrs, mins, 0, 0);
            return d;
        };

        const newStart = toDateWithTime(newJobDate, newStartTimeStr);
        const newEnd = toDateWithTime(newJobDate, newEndTimeStr);

        const bufferedStart = new Date(newStart.getTime() - bufferHours * 60 * 60 * 1000);
        const bufferedEnd = new Date(newEnd.getTime() + bufferHours * 60 * 60 * 1000);

        return existingAssignments.some(assignment => {

            const job = assignment.jobId;
            if (!job || !job.schedule) return false;

            const assignmentDate = new Date(job.schedule.startDate);
            const assignmentStart = toDateWithTime(assignmentDate, job.schedule.startTime);
            const assignmentEnd = toDateWithTime(assignmentDate, job.schedule.endTime);

            return bufferedStart < assignmentEnd && bufferedEnd > assignmentStart;
        });
    }
}
