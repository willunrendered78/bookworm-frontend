// Where to go after signing in. Only same-site paths are allowed: a string that starts with a
// single "/" (not "//", and not "/\", which browsers treat the same way). Anything else goes to /library.
export function returnPath(from) {
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/\\')) {
    return from
  }
  return '/library'
}
