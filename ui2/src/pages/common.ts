import { CreateEvent } from '@daml/ledger';
import { DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { Map, emptyMap } from '@daml/types';

export type ServicePageProps<T extends object> = {
  services: Readonly<CreateEvent<T, any, any>[]>;
};

export function isStringArray(strArr: any): strArr is string[] {
  if (Array.isArray(strArr)) {
    return strArr.reduce((acc, elem) => {
      return acc && typeof elem === 'string';
    }, true);
  } else {
    return false;
  }
}

export const handleSelectMultiple = (
  result: DropdownProps,
  current: string[],
  setter: React.Dispatch<React.SetStateAction<string[]>>
) => {
  if (typeof result.value === 'string') {
    setter([...current, result.value]);
  } else if (isStringArray(result.value)) {
    setter(result.value);
  }
};

export const createDropdownProp = (
  text: string,
  value?: string,
  key?: string
): DropdownItemProps => {
  value = value || text;
  key = key || value;
  return { key, value, text };
};

export function wrapTextMap<T>(items: T[]) {
  let map = Object.create(null);

  items.forEach((key: T) => {
    map[key] = {};
  });

  return { map };
}

export function makeDamlSet<T>(items: T[]): { map: Map<T, {}> } {
  return { map: items.reduce((map, val) => map.set(val, {}), emptyMap<T, {}>()) };
}
