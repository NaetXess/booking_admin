import { Delete, Get, Post, Put } from '@utils/function';

const route = 'api/bookings';

export class Booking {
	static getAvaliableTimesByServiceId = async (service_id, startDate, endDate, delay) => {
		try {
			let response = await Get(
				`${route}/avaliables/${service_id}?startdate=${startDate}&enddate=${endDate}`,
				true,
				delay
			);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
