import { Delete, Get, Post, Put, toastCustom, getTimeZone, buildQuery } from '@utils/function';

const route = 'api/bookings';

export class Booking {
	static getAvaliableTimesByServiceId = async (
		service_id,
		resource_id,
		startDate,
		endDate,
		delay
	) => {
		try {
			let response = await Get(
				`${route}/availability/${service_id}/resource/${resource_id}?startdate=${startDate}&enddate=${endDate}&timezone=${getTimeZone()}`,
				true,
				delay
			);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getAllByCompanyId = async (params, delay) => {
		try {
			let queryParams = buildQuery(params);

			let response = await Get(`${route}${queryParams}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getBookingById = async (booking_id, delay) => {
		try {
			let response = await Get(`${route}/${booking_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getCustomerHistory = async (customer_id, delay) => {
		try {
			let response = await Get(`${route}/history/customer/${customer_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getSummary = async (booking_id, delay) => {
		try {
			let response = await Get(`${route}/summary/${booking_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static createBooking = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			toastCustom('Rezervasyon başarıyla oluşturuldu', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static createBookingFromOccurrence = async (body, delay) => {
		try {
			let response = await Post(`${route}/occurrence`, body, true, false, delay);
			toastCustom('Rezervasyon başarıyla oluşturuldu', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static updateBooking = async (body, delay) => {
		try {
			let response = await Put(`${route}`, body, true, false, delay);
			toastCustom('Rezervasyon başarıyla güncellendi', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static delete = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Rezervasyon başarıyla silindi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}
