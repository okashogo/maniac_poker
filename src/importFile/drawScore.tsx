export default function drawScore(hands: any[],rolesTmp: any[]) {
  // export default function drawScore(hands: any[], scoresLength: number) {
  var handsTmp = hands.concat();
  var elementList: any[] = [];

  for (let i = 0; i < rolesTmp.length; i++) {
    var pairCount = 0;
    for (let j = 0; j < handsTmp.length; j++) {
      if (rolesTmp[i].contain.includes(handsTmp[j].name)) {
        pairCount += 1;
      }
      // // pairがなかったときのみ出力
      // if (!isPair) {
      //   elementList.push([handsTmp[j].name, 1]);
      // }
    }
    elementList.push({ pairName: rolesTmp[i].name, pairsCount: pairCount })
  }

  return elementList;
}
