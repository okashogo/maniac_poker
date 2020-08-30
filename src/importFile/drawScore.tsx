import getHashProperties from './getHashProperties';
import { roles } from './testdb';

export default function drawScore(hands: any[]) {
  // export default function drawScore(hands: any[], scoresLength: number) {
  var handsTmp = hands.concat();
  var elementList: any[] = [];

  for (let i = 0; i < roles.length; i++) {
    var pairCount = 0;
    for (let j = 0; j < handsTmp.length; j++) {
      if (roles[i].contain.includes(handsTmp[j].name)) {
        pairCount += 1;
      }
      // // pairがなかったときのみ出力
      // if (!isPair) {
      //   elementList.push([handsTmp[j].name, 1]);
      // }
    }
    elementList.push({ pairName: roles[i].name, pairsCount: pairCount })
  }

  return elementList;
}

function addCalculate(list: any[], listLength: number) {
  // 加点の計算
  var pairName: string = "";
  var pairsCount: number = 0;
  if (getHashProperties(list).includes(5)) {
    pairName = "ファイブカード x ";
    pairsCount = pairCount(getHashProperties(list), 5);
  }
  else if (getHashProperties(list).includes(4)) {
    pairName = "フォアカード x ";
    pairsCount = pairCount(getHashProperties(list), 4);

  }
  else if (getHashProperties(list).includes(3)) {
    pairName = "スリーカード x ";
    pairsCount = pairCount(getHashProperties(list), 3);
  }
  else if (getHashProperties(list).includes(2)) {
    pairName = "ペア x ";
    pairsCount = pairCount(getHashProperties(list), 2);
  }
  else {
    return Array(Object.keys(listLength - 2).fill(""));
  }

  return { pairName: pairName, pairsCount: pairsCount };
}


function pairCount(list: number[], pairNum: number) {
  var pairCount: number = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === pairNum) {
      pairCount++;
    }
  }
  return pairCount;
}
