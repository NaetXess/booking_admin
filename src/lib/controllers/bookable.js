import { Delete, Get, Post, Put, buildQuery } from '@utils/function';

const route = 'api/bookables';

export class Bookable {
	static getBookables = async (params, delay) => {
		try {
			let queryString = buildQuery(params);

			let response = await Get(`${route}/${queryString}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getBookableById = async (id, delay) => {
		try {
			let response = await Get(`${route}/${id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static create = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
