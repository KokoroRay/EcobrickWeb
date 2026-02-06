export const getAssetPath = (path: string) => {
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    const baseUrl = import.meta.env.BASE_URL;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${cleanBase}${cleanPath}`;
};
