import { RESERVATION_STATUS_DETAILS } from '@constants/booking_status_enum';

export function getReservationStatus(r) {
	return RESERVATION_STATUS_DETAILS[r?.status] || RESERVATION_STATUS_DETAILS[-1];
}
