export function navigate(url, title) {
  window.history.pushState({}, title ? title : '', url)
}
export function navigateWithoutHistory(url, title) {
  window.history.replaceState({}, title ? title : '', url)
}
