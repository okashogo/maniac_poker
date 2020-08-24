export default function drawHand(decks: any[], hands: any[], select: any[]) {
  var decksTmp = decks.concat();
  var handsTmp = hands.concat();

  for (let i = 1; i < select.length; i++) {
    handsTmp[select[i]] = decksTmp.slice(-1)[0];
    decksTmp.pop();
  }
  return handsTmp;
}
