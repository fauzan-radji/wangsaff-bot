import path from "path";

function absolute(relative) {
  return path.resolve(relative);
}

export function root(child = "") {
  return `${absolute("./")}/${child}`;
}

export default { root };
