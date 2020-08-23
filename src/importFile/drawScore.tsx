export default function drawScore(hands: any[], scoresLength: number) {
  var handsTmp = hands.concat();
  var seriesList: any[] = [];
  var colorList: any[] = [];

  for (let i = 0; i < handsTmp.length; i++) {
    //単色
    var isPair: boolean = false;
    for (let k = 0; k < seriesList.length; k++) {
      if (seriesList[k][0] === handsTmp[i].series) {
        seriesList[k][1] += 1;
        isPair = true;
        break;
      }
    }
    // pairがなかったときのみ出力
    if (!isPair) {
      seriesList.push([handsTmp[i].series, 1]);
    }
  }


  for (let i = 0; i < handsTmp.length; i++) {
    if (Array.isArray(handsTmp[i].color)) {
      //多色
      for (let j = 0; j < handsTmp[i].color.length; j++) {
        //配列内にcolorがすでに登録されていれば、カウントを +1 する
        var isPair: boolean = false;
        for (let k = 0; k < colorList.length; k++) {
          if (colorList[k][0] === handsTmp[i].color[j]) {
            colorList[k][1] += 1;
            isPair = true;
            break;
          }
        }

        // pairがなかったときのみ出力
        if (!isPair) {
          colorList.push([handsTmp[i].color[j], 1]);
        }
      }
    }
    else if (handsTmp[i].color === "") {
      continue;
    }
    else {
      //単色
      var isPair: boolean = false;
      for (let k = 0; k < colorList.length; k++) {
        if (colorList[k][0] === handsTmp[i].color) {
          colorList[k][1] += 1;
          isPair = true;
          break;
        }
      }
      // pairがなかったときのみ出力
      if (!isPair) {
        colorList.push([handsTmp[i].color, 1]);
      }
    }
  }


  // 加点の計算
  var pairName: string = "";
  var pairsCount: number = 0;
  if(getHashProperties(seriesList).includes(5)){
    // console.log("ファイブカード x " + pairCount(getHashProperties(seriesList), 5));
    pairName = "ファイブカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 5);
  }
  else if(getHashProperties(seriesList).includes(4)){
    // console.log("フォアカード x " + pairCount(getHashProperties(seriesList), 4));
    pairName = "フォアカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 4);

  }
  else if(getHashProperties(seriesList).includes(3)){
    // console.log("スリーカード x " + pairCount(getHashProperties(seriesList), 3));
    pairName = "スリーカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 3);
  }
  else if(getHashProperties(seriesList).includes(2)){
    // console.log("ペア x " + pairCount(getHashProperties(seriesList), 2));
    pairName = "ペア x ";
    pairsCount = pairCount(getHashProperties(seriesList), 2);
  }
  else{
    return;
  }

  var scoresTmp = Array(scoresLength).fill(null);
  for (let i = 0; i < scoresTmp.length; i++) {
    scoresTmp[i] = {pairName: pairName, pairsCount: pairsCount};
  }

  return scoresTmp;
}

function getHashProperties(a:any[]){
  let r:number[] = [];
  for (let i = 0; i < a.length; i++) {
      r.push(a[i][1]);
  }
  return r;
}

function pairCount(list: number[], pairNum: number){
  var pairCount:number = 0;
  for (let i = 0; i < list.length; i++) {
      if(list[i] == pairNum){
        pairCount++;
      }
  }
  return pairCount;
}
