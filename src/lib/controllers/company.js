import { Get, Put } from '@utils/function';

const route = 'api/companies';

export class Company {
	static getUserCompany = async (delay) => {
		try {
			let response = await Get(`${route}/me`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static update = async (body, delay) => {
		try {
			let response = await Put(`${route}`, body, true, false, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
