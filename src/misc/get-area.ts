export const getArea = ({
  title,
  address,
  cityWhiteList,
}: {
  title?: string;
  address?: string;
  cityWhiteList?: string[];
}): string => {
  if (!address || !title) {
    return '';
  }
  const cleanedAddress = addressNormalizer(address);

  const regex = regexMode(cleanedAddress);
  const match: any = cleanedAddress.match(regex);
  if (match) {
    const { district } = match.groups as { district: string };

    if (isValidDistrict({ title, district, cityWhiteList, locationGroups: match.groups })) {
      return district;
    }
  }

  return '';
};

function addressNormalizer(address: string) {
  // 今后更多的地址清洗规则可以在这里添加
  const parenthesisRegex = /[\(\（][^()\（\）]*[\)\）]|[\[\【][^[\]\】\[\【]*[\]\】]/g;
  const afterStreetTextRegex = /((?:街|道|路)\d+号).*/;
  return address.replace(parenthesisRegex, '').replace(afterStreetTextRegex, '$1');
}

function regexMode(_: string) {
  // 今后更多的正则表达式模式可以在这里添加
  return /(?<province>[^省]+省|.+自治区|[^澳门]+澳门|[^香港]+香港|[^市]+市)?(?<city>[^自治州]+自治州|[^特别行政区]+特别行政区|[^市]+市|.*?地区|.*?行政单位|.+盟|市辖区|[^县]+县)(?<district>[^县]+县|[^市]+市|[^镇]+镇|[^区]+区|[^乡]+乡|.+场|.+旗|.+海域|.+岛)?(?<address>.*)/;
}

function titleStartsWithDistrict(title: string, district: string): boolean {
  const trimmedDistrict = district.replace('区', '');
  for (let i = 0; i <= 3; i++) {
    if (title.slice(i).startsWith(district) || title.slice(i).startsWith(trimmedDistrict)) {
      return true;
    }
  }

  return false;
}

function isValidDistrict({
  title,
  district,
  cityWhiteList,
  locationGroups,
}: {
  title: string;
  district: string;
  cityWhiteList: string[] | undefined;
  locationGroups: { province?: string; city?: string };
}): boolean {
  if (!district) return false;
  if (titleStartsWithDistrict(title, district)) return false;
  if (!cityWhiteList || !cityWhiteList.length) return true;

  const { province, city } = locationGroups;
  return cityWhiteList.some((c) => province?.includes(c) || city?.includes(c));
}
import { a } from './a';
const b = a.map((x) => {
  return {
    ...x,
    getAreaResult: getArea(x),
  };
});
const path = import.meta.dir + '/file.json';
await Bun.write(path, JSON.stringify(b, null, 2));
