const shortid = require("shortid");
//Istenilen karakter uzunlugunda bir rastgele anahtar olusuturlmasi:
export default function randomLinkGetir(karakterSayisi) {
  let olusanLink = shortid.generate().slice(0, karakterSayisi);
  return olusanLink;
}
