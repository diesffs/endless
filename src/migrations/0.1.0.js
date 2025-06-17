export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  // NO CHANGES NEEDED

  return {
    data,
    result: true,
  };
}
