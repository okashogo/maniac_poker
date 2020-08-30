// 連想配列の 2個目の値を取得し配列にして返します。
export default function getHashProperties(a:any[]){
  let r:number[] = [];
  for (let i = 0; i < a.length; i++) {
      r.push(a[i][1]);
  }
  return r;
}
