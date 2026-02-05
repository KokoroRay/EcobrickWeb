export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION ?? 'ap-southeast-1',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
};

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
};
