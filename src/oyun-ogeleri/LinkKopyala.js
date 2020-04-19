//Oda linkini kopyalama
//Sadece oda-link-text uzerindeki texti kopyalar
export default function linkiKopyala() {
  //Link inputunu alma
  let kopyaLink = document.getElementById("lobisayfasi-key-text");
  //Input textini secme
  kopyaLink.select();
  kopyaLink.setSelectionRange(0, 99999);
  //Input icindeki texti kopyalama
  document.execCommand("copy");
}
