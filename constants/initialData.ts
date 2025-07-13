import { colorOptions } from './colors';

// 初期グループデータ
export const initialGroupData = [
  {
    id: '5e0c991d-cfe6-89fa-5ce4-8db27235f3bb',
    name: '北アルプス',
    color: colorOptions[0], // Blue 500
    position: 65535.0
  },
  {
    id: '38789cca-4ec9-c906-cbec-ec36d5e2a938',
    name: '八ヶ岳',
    color: colorOptions[8], // Teal 500
    position: 131070.0
  },
  {
    id: 'af8c957b-9359-2716-c1e9-eb8d712ef8c2',
    name: 'その他',
    color: colorOptions[13], // Amber 500
    position: 196605.0
  }
];

// 初期アイテムデータ
export const initialItemData = [
  {
    title: '劔岳',
    content:
      '剱岳（つるぎだけ）は、飛騨山脈（北アルプス）北部の立山連峰にある標高2,999 mの山。富山県の上市町と立山町にまたがる。中部山岳国立公園内にあり[3]、山域はその特別保護地区になっている。日本百名山[4]および新日本百名山[5]に選定されている。立山、鹿島槍ヶ岳、唐松岳と並び、日本では数少ない氷河の現存する山である[6][7]。',
    group_id: initialGroupData[0].id
  },
  {
    title: '赤岳',
    content:
      '赤岳（あかだけ）は、長野県南佐久郡南牧村、諏訪郡原村、茅野市、山梨県北杜市にまたがる活火山である標高2,899 mの山。八ヶ岳中信高原国定公園南部に位置し、八ヶ岳連峰の最高峰である。',
    group_id: initialGroupData[1].id
  },
  {
    title: '硫黄岳',
    content:
      '硫黄岳（いおうだけ）は、長野県の茅野市と南佐久郡南牧村にまたがる標高2,760 mの山。八ヶ岳連峰にあり、八ヶ岳中信高原国定公園に属する。',
    group_id: initialGroupData[1].id
  },
  {
    title: '槍ヶ岳',
    content:
      '槍ヶ岳（やりがたけ）は、飛騨山脈南部にある標高3,180 mの山である。山域は中部山岳国立公園に指定されており[2]、日本で5番目に高い山である。長野県松本市・大町市・岐阜県高山市の境界にある。初登攀は僧の播隆上人。日本百名山[3]、新日本百名山[4]及び花の百名山[5]に選定されている。',
    group_id: initialGroupData[0].id
  },
  {
    title: '蝶ヶ岳',
    content:
      '蝶ヶ岳（ちょうがたけ）は、飛騨山脈（北アルプス）にある標高2,677mの山。常念山脈の稜線上、常念岳の南にあり、山体すべてが長野県に属する。中部山岳国立公園内にある[2]。',
    group_id: initialGroupData[0].id
  },
  {
    title: '塔ノ岳',
    content:
      '塔ノ岳（とうのだけ）は丹沢山地の南部にある標高1,491 mの山。神奈川県秦野市、愛甲郡清川村、足柄上郡山北町の境目に位置する。\n\n丹沢はなめてかかると、めっちゃくちゃキツいでホンマに。。。',
    group_id: initialGroupData[2].id
  },
  {
    title: '高尾山',
    content: '東京から超絶近い。観光地としても人気。インフラが整っている。',
    group_id: initialGroupData[2].id
  },
  {
    title: '金峰山',
    content: 'お手軽で人気',
    group_id: initialGroupData[2].id
  }
];
