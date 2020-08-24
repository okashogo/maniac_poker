export default function drawDeck(decks: any[], select: any[]) {
  // 最初のnullはカウントしない。
  var decksTmp = decks.concat();
  for (let i = 1; i < select.length; i++) {
    decksTmp[select[i]] = decksTmp.slice(-1)[0];
    decksTmp.pop();
  }
  return decksTmp;
}
