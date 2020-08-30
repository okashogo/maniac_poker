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

  // // element1Listの作成
  // for (let i = 0; i < handsTmp.length; i++) {
  //   //単色
  //   var isPair: boolean = false;
  //   for (let k = 0; k < element1List.length; k++) {
  //     if (element1List[k][0] === handsTmp[i].element1) {
  //       element1List[k][1] += 1;
  //       isPair = true;
  //       break;
  //     }
  //   }
  //   // pairがなかったときのみ出力
  //   if (!isPair) {
  //     element1List.push([handsTmp[i].element1, 1]);
  //   }
  // }

  // // element2Listの作成
  // for (let i = 0; i < handsTmp.length; i++) {
  //   if (Array.isArray(handsTmp[i].element2)) {
  //     //多色
  //     for (let j = 0; j < handsTmp[i].element2.length; j++) {
  //       //配列内にcolorがすでに登録されていれば、カウントを +1 する
  //       isPair = false;
  //       for (let k = 0; k < element2List.length; k++) {
  //         if (element2List[k][0] === handsTmp[i].element2[j]) {
  //           element2List[k][1] += 1;
  //           isPair = true;
  //           break;
  //         }
  //       }
  //
  //       // pairがなかったときのみ出力
  //       if (!isPair) {
  //         element2List.push([handsTmp[i].element2[j], 1]);
  //       }
  //     }
  //   }
  //   else if (handsTmp[i].element2 === "") {
  //     continue;
  //   }
  //   else {
  //     //単色
  //     isPair = false;
  //     for (let k = 0; k < element2List.length; k++) {
  //       if (element2List[k][0] === handsTmp[i].element2) {
  //         element2List[k][1] += 1;
  //         isPair = true;
  //         break;
  //       }
  //     }
  //     // pairがなかったときのみ出力
  //     if (!isPair) {
  //       element2List.push([handsTmp[i].element2, 1]);
  //     }
  //   }
  // }

  // var scoresTmp = Array(roles.length).fill(null);
  // scoresTmp[0] = addCalculate(element1List, roles.length);
  // scoresTmp[1] = addCalculate(element2List, roles.length);


  return elementList;
  // return [{pairName: "ファイブカード x ",  pairsCount: 1}];
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
