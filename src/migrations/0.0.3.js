export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  // empty test migration

  return {
    data,
    result: true,
  };
}
