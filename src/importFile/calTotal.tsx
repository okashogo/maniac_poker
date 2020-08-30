export default function calTotal(scores: any[]) {
  var total: number = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].pairsCount === 5) {
      total += 10;
      continue;
    }
    else if (scores[i].pairsCount === 4) {
      total += 5;
      continue;
    }
    else if (scores[i].pairsCount === 3) {
      total += 3;
      continue;
    }
    else if (scores[i].pairsCount === 2) {
      total += 1;
      continue;
    }
  }
  return total;
}
