import { Delete, Get, Post, Put, buildQuery, toastCustom } from '@utils/function';

const route = 'api/search';

export class Search {
	static search = async (params, delay) => {
		// q=searchText, index=tableName
		try {
			let response = await Get(
				`${route}?index=${params.index}&q=${params.search_text}`,
				true,
				delay
			);
			return response.data;
		} catch (error) {
			return false;
		}
	};
}
