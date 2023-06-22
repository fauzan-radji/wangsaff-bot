import path from "path";

function absolute(relative) {
  return path.resolve(relative);
}

export function root() {
  return absolute("../");
}

export default { root };
