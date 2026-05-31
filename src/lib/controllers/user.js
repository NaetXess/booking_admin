import { Delete, Get, Post, Put, toastCustom } from '@utils/function';

const route = 'api/users';

export class User {
	static login = async (body, delay) => {
		try {
			let response = await Post(`${route}/login`, body, true, false, delay);
			toastCustom('Hoş Geldin!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static create = async (body, delay) => {
		try {
			let response = await Post(`${route}`, body, true, false, delay);
			toastCustom('Kullanıcı başarıyla oluşturuldu!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static update = async (body, delay) => {
		try {
			let response = await Put(`${route}`, body, true, false, delay);
			toastCustom('Kullanıcı başarıyla güncellendi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};

	static getAllByCompanyId = async (delay) => {
		try {
			let response = await Get(`${route}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static getById = async (id, delay) => {
		try {
			let response = await Get(`${route}/${id}`, true, delay);
			return response.data;
		} catch (error) {
			return false;
		}
	};

	static delete = async (id, delay) => {
		try {
			let response = await Delete(`${route}/${id}`, true, delay);
			toastCustom('Kullanıcı başarıyla silindi!', 1);
			return response;
		} catch (error) {
			return false;
		}
	};
}
