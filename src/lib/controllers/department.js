import { Delete, Get, Post, Put } from '@utils/function';

const route = 'api/departments';

export class Department {
	static getByCompanyId = async (company_id, delay) => {
		try {
			let response = await Get(`${route}?company_id=${company_id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
