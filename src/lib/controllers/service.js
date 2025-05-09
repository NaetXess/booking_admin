import { Delete, Get, Post, Put } from '@utils/function';

const route = 'api/services';

export class Service {
	static getByCompanyId = async (companyId, delay) => {
		try {
			let response = await Get(`${route}/${companyId}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getByBookableId = async (bookable_id, delay) => {
		try {
			let response = await Get(`${route}?bookable_id=${bookable_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
