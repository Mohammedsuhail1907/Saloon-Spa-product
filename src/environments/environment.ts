/**
 * Production environment. `apiBaseUrl` is the future booking/catalogue API
 * root — empty string means same-origin. Swapped in via fileReplacements
 * (see angular.json) for development builds.
 */
export const environment = {
  production: true,
  apiBaseUrl: ''
};
