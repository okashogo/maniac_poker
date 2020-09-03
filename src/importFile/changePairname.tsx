export default function changePairname(pairsCount: number) {
  if(pairsCount === 5){
    return "ファイブカード";
  }
  else if(pairsCount === 4){
    return "フォアカード";
  }
  else if(pairsCount === 3){
    return "スリーカード";
  }
  else if(pairsCount === 2){
    return "ワンペア";
  }

  return "ペアなし";


}
