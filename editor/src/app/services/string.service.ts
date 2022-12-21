import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StringService {
  /**
   * Checks to see a value exists in a string using a fuzzy search.
   * @param q The value to search for.
   * @param str The string to look within.
   */
  fuzzyMatch(q: string, str: string) {
    let hay = str.toLowerCase(),
      i = 0,
      n = -1,
      l;
    q = q.toLowerCase();
    for (; (l = q[i++]); ) if (!~(n = hay.indexOf(l, n + 1))) return false;
    return true;
  }

  format(str: string, ...replacements: (string | number)[]) {
    const count = str.match(/%s/g)?.length;
    if (count !== replacements.length) throw Error('Replacement count does not match string count.');
    return replacements.reduce<string>((acc, val) => acc.replace('%s', val.toString()), str);
  }
}
