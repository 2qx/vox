import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params,url }) => {
    return {
        asset: url.searchParams.get('asset')
    };
};