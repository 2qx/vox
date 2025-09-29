import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params,url }) => {
	return {
		postId: url.searchParams.get('postId'),
		topic: url.searchParams.get('topic')
	};
};