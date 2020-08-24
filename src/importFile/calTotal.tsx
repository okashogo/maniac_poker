export default function calTotal(scores: any[]) {
  var total: number = 0;
  console.log(scores);
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].pairName === "ファイブカード x ") {
      total += scores[i].pairsCount * 10;
      continue;
    }
    else if (scores[i].pairName === "フォアカード x ") {
      total += scores[i].pairsCount * 5;
      continue;
    }
    else if (scores[i].pairName === "スリーカード x ") {
      total += scores[i].pairsCount * 3;
      continue;
    }
    else if (scores[i].pairName === "ペア x ") {
      total += scores[i].pairsCount * 1;
      continue;
    }
  }
  return total;
}
