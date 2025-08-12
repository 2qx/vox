import type { PageLoad } from './$types';

//export const prerender = true;

export const load: PageLoad = ({ params }) => {
	return {
		topic: "",
		post: {
			title: `/pop/[null]`,
		}
	};
};