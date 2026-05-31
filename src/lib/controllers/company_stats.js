import { Get } from '@utils/function';

const route = 'api/company_stats';

export class CompanyStats {
	static getDailyStats = async (delay) => {
		try {
			let response = await Get(`${route}/daily`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getDailyBookings = async (limit, delay) => {
		try {
			let response = await Get(`${route}/daily/bookings?limit=${limit}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getWeeklyStats = async (delay) => {
		try {
			let response = await Get(`${route}/weekly`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getTotalStats = async (delay) => {
		try {
			let response = await Get(`${route}/total`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
