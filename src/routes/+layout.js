import { themes } from '@constants/theme';
import { currentTheme } from '@constants/constant';

export const load = async ({ params }) => {
	currentTheme.set(themes.main);
};

export const ssr = false;
export const prerender = false;
