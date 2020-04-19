import firebase from "./firebase";
//Default oyun ayarlari dosyasi.
const jsonData = require("./varsayilan-ayar.json");

//Hazir json dosyasindan verilerin alinmasi
let newJson = jsonData;
//Database referansi
const oyunData = firebase.database().ref("oyunlar");

export default function jsonAyarla(oyunOdasi) {
  //Kurucu uye ayarlarinin olusturulmasi

  //Yeni json dosyasina verilerin yerlesimi
  newJson.oyunKey = oyunOdasi;
  //Veritabanina oyun anahtari ile yeni bir oyun dosyasi acilmasi
  oyunData.child(oyunOdasi).set(newJson);
  //Acilan yeni oyun dosyasi icerisine kurucu oyuncunun eklenmesi
  //Oyun odasi icerisinde kurucuID anahtari ile yeni bir oyuncu eklenmesi
}
