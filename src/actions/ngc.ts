/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */
import NGCCatalog from '@/stores/ngc.json';
import type { NGCObject } from '@/stores/ngc.store';
import { useNGCStore } from '@/stores/ngc.store';

export const getNGCTypeText = (type: string): string => {
  switch (type) {
    case '*':
      return 'Star';
    case '**':
      return 'Double Star';
    case 'OCl':
      return 'Open Cluster';
    case 'GCl':
      return 'Globular Cluster';
    case 'Cl+N':
      return 'Star cluster + Nebula';
    case 'G':
      return 'Galaxy';
    case 'GPair':
      return 'Galaxy Pair';
    case 'GGroup':
      return 'Galaxy Group';
    case 'PN':
      return 'Planetary Nebula';
    case 'HII':
      return 'HII Ionized Region';
    case 'DrkN':
      return 'Dark Nebula';
    case 'EmN':
      return 'Emission Nebula';
    case 'Neb':
      return 'Nebula';
    case 'RfN':
      return 'Reflection Nebula';
    case 'SNR':
      return 'Supernova Remnant';
    case 'Nova':
      return 'Nova Star';
    default:
      return 'Unknow';
  }
};

export const searchNGC = async (value: string) => {
  const ngcState = useNGCStore.getState();

  try {
    const results = (NGCCatalog as any[])
      .filter((ngc: any) => {
        const id = ngc.Name.toLowerCase();
        const parsedValue = value.toLowerCase().replace(/ /g, '').trim();
        const parsedNames = (ngc['Common names'] || '')
          .toLowerCase()
          .replace(/ /g, '');
        const parsedOtherNames = (ngc.Identifiers || '')
          .toLowerCase()
          .replace(/ /g, '');
        const messierName = ngc.M
          ? `m${ngc.M[0] === '0' ? ngc.M.slice(1) : ngc.M}`
          : '';

        return (
          (id.includes(parsedValue) ||
            (parsedNames.length && parsedNames.includes(parsedValue)) ||
            (messierName.length && messierName.includes(parsedValue)) ||
            (parsedOtherNames.length &&
              parsedOtherNames.includes(parsedValue))) &&
          ngc.Type !== 'Dup'
        );
      })
      .slice(0, 20);

    ngcState.set({
      selectedObject: null,
      results: results.map((ngc: any) => ({
        id: ngc.Name,
        names: ngc['Common names'],
        ra: ngc.RA,
        dec: ngc.Dec,
        type: ngc.Type,
      })),
    });

    return results;
  } catch (e) {
    console.log('Error getting ngc', e);
  }
};

export const filterNGC = async (
  list: NGCObject[],
  forceSearch: boolean = false,
) => {
  const ngcState = useNGCStore.getState();

  if (list.length || forceSearch) {
    try {
      let results = (NGCCatalog as any[]).map((ngc: any) => ({
        id: ngc.Name,
        names: ngc['Common names'],
        ra: ngc.RA,
        dec: ngc.Dec,
        type: ngc.Type,
      }));

      results = results.filter((ngc) =>
        list.find((item) => item.names === ngc.names),
      );

      ngcState.set({
        selectedObject: null,
        results,
      });

      return results;
    } catch (e) {
      console.log('Error getting ngc', e);
    }
  } else {
    ngcState.set({
      selectedObject: null,
      results: [],
    });
  }
};
