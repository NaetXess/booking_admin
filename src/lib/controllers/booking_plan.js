import { Get, Post, Put, toastCustom } from '@utils/function';

const route = 'api/booking_plan';

export class BookingPlan {
	static getAll = async (delay) => {
		try {
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getConflicts = async (id, delay) => {
		try {
			let response = await Get(`${route}/conflicts${id ? '?id=' + id : ''}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getPlanByID = async (plan_id, delay) => {
		try {
			let response = await Get(`${route}/plan/${plan_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
	static getByCustomerId = async (customer_id, delay) => {
		try {
			let response = await Get(`${route}/customer/${customer_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static create = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			toastCustom('Plan başarıyla oluşturuldu', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	// static update = async (body, delay) => {
	//     try {
	//         let response = await Put(`${route}`, body, true, false, delay);
	//         toastCustom('Müşteri başarıyla güncellendi', 1);
	//         return response;
	//     } catch (error) {
	//         return false;
	//     }
	// };
}
