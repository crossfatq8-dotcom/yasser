import { User, UserRole, Driver } from '../../types';

export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

export const getRelativeDateString = (dateStr: string, daysOffset: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

export const getActivePaidSubscribersForDate = (dateString: string, users: User[]): User[] => {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    return users.filter(u => {
        if (u.role !== UserRole.Subscriber || !u.subscription || u.subscription.status !== 'active' || u.subscription.paymentStatus !== 'paid') {
            return false;
        }
        
        const startDate = new Date(u.subscription.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + u.subscription.duration);

        return targetDate >= startDate && targetDate < endDate;
    });
};

export const getActiveSubscribersForDate = (dateString: string, users: User[]): User[] => {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    return users.filter(u => {
        if (u.role !== UserRole.Subscriber || !u.subscription || u.subscription.status !== 'active') {
            return false;
        }
        
        const startDate = new Date(u.subscription.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + u.subscription.duration);

        return targetDate >= startDate && targetDate < endDate;
    });
};

export const findDriverForSubscriber = (subscriber: User, drivers: Driver[]): { driver: Driver, shift: string } | null => {
    if (!subscriber.subscription) return null;
    const { areaId, deliveryShift } = subscriber.subscription;

    for (const driver of drivers) {
        for (const assignment of driver.assignments) {
            if (assignment.shift === deliveryShift && assignment.areaIds.includes(areaId)) {
                return { driver, shift: deliveryShift };
            }
        }
    }
    return null;
};