export function generateNewId() {
  return (
    new Date().getTime().toString(16) + Math.random().toString(16).substring(2)
  ).substring(2, 16);
}
