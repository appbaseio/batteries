export default function getNestedValue(obj, path) {
  const keys = path.split('.');
  let currentObject = obj;

  keys.forEach(key => (currentObject = currentObject[key]));
  if (typeof currentObject === 'object') {
    return JSON.stringify(currentObject);
  }
  return currentObject;
}
