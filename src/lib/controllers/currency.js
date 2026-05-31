import { Delete, Get, Post, Put, buildQuery, toastCustom } from '@utils/function';

const route = 'api/currencies';

export class Currency {
	static getAll = async (delay) => {
		try {
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
