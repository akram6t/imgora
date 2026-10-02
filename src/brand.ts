/** Imgora brand assets — the logo is pure SVG (gradient tile + pixel-dot "i"),
 *  so it stays crisp everywhere: favicon, header, README, API routes. */

export const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>' +
  "</linearGradient></defs>" +
  '<rect width="64" height="64" rx="14" fill="url(#g)"/>' +
  // the "i": a diamond pixel as the dot, a rounded stem, a trailing pixel for motion
  '<rect x="26.5" y="10.5" width="11" height="11" rx="2.5" transform="rotate(45 32 16)" fill="#fff"/>' +
  '<rect x="27" y="25" width="10" height="25" rx="5" fill="#fff"/>' +
  '<rect x="43" y="43" width="8" height="8" rx="2" transform="rotate(45 47 47)" fill="#fff" opacity=".5"/>' +
  "</svg>";

/** 64×64 PNG raster of LOGO_SVG (fallback for browsers without SVG favicons). */
export const FAVICON_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFDElEQVR4nOWbWU8bVxTHr79JUPrepO1bW0XpN+hiuyljO4nHgE267xsYXEhbtkAxWViMbRpQlS6p+pSK5oUCafLQRCqQPkV5S4QUe1Y8RjnVGc+kruPBM1AfY/tIf40f/PL7z73nnHtHh7GKAa4wn3k6zGd7w3z2aoQXNiK8IHXyApwy9DoqKMAbht409Jaht4MCvHOyoHcNvadLhPdRJ0T4wNCHhj46IcLHhj45XtCnhj4z9DkqIEJXQVKXX1yP+oWrUb/Y031ceqoy244BrnY+4+kIZW6HQwKEeQEivAAIvg/hoTsgQlSXBD2m/NJGr194BRi4mJNoa8sc7Ahlr3WEslCv8L3+gmL49IkrMU5tsQkvPNfOZ+41Cjzqi8JzM8aJL1SAf3C0g89ojQaP6vNL0O8Xc30+4UhZeJ5/0NIeytxvXHgJ+n0SnOakzX4u80QJPrgaac9bwhv6khOX/5MY24IZb9PAG/qaE14uevv1W+p2A/8VipPWzZL3TC3g470y/Lmah5ureZjokWnh9RUgwaBPOszCoWyMGj4xrEA+D49iOw8wN6aSwqMGWsUoM9rbmsEXm/DtmEoHj89WeZFFgsLftYYvNuHiqEoCP8DJMMjJG6wzKIj7Ab7UBAJ4GOQkkVElPASzG/jfC1G5qvBDhhhFqcNs7zRuLeerDj9sGlDtOn9zDwZUE364VQZG0eRgnXe6BSajStXhR3QDiDq8pIMkuDCqksCPoAGU7W0lE6jhz5gGUPb2qSHrRoga/gwaUIuDTbrEhFrBj5oG1OJUh3X+1kpez/ZUCa8UfhQNqOsj7R7hx14zDGhW+DE0oBbwuN/vrG+DtgW68PfCiEoO/w0aQA2/9ItmWQaXftZI4cdNAyjffKX4blglgx9HAyj3PC71SnFnbZsMPm4aQJXwcurDigbgf6jg42gAZba3G1TwEwUD6EqdEwMo4CeOycAo67zdoII/e0wBRtnkODGAAv4sGkDZ4dkNKvhzpgFU7a0TAyjgz6EBlL293aCCP28aQHWwsW8ADfx5NIDyVGc3qOAvvKoAozzS2g0q+EnTAKrzvBMDKOAn0QDKywy7QQU/ZRpAdZNj24AK8FMRBa5M5OBKPAczEWXX8FNoAOU1lt3YCX66U4Hf5zX44/uCVhY0SJ5SdgU/bRpAdYfnxAA78MUmpDoVx/DTaADlBaat+wDloeWyX154HP466pIGq/MaJMOqI/gZ0wCq29u7a5VvhO7+tV024eGet4K/fimvazGecwQ/41WAUV5d/zC0VdGAywNbZbP9ryUGlMLfQAPGc47gE7oBxPf2q5etb4Wv/ahZljrM9rjXreBxC6TDqiP4BBpQi48WPw1t6UtdU0EX/rZ688V1PoEmzJeHn+t0Dj+rG+AXhf34xcaqyZkNK7B6Uftf4BMeOYsr4Ha9wJt1HrM97nfUbpb9rKGkR15n3QHht3qCd1rnLeELBiwyHDBqRvgUPt1KF8PpqmaET3lQuScZDg4UpquaCz7tVtYeDUzgaFlTwXtUSLvlF/8dmGHgwtGyZoFPudWlx2YJTwfUAzGfdL/R4dMedXPeqx4sOznW5xOO4GhZo8KnPEou7VWe33F2sC8gPNvvk+414puf86hHmZ2IcWoLjpY10p6f96oHmJMABi4cLcPpqrqFdytrSa/8EttrDPqkwzhghDM2A5y8jpMW+w0+4ZVF7O2xvU15lO45t3TIDts/PEJ5B0ssSfkAAAAASUVORK5CYII=";
