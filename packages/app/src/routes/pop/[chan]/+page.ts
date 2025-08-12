import type { PageLoad } from './$types';

//export const prerender = true;

export const load: PageLoad = ({ params }) => {
	return {
		topic: params.chan,
		post: {
			title: `/pop/${params.chan}`,
		}
	};
};