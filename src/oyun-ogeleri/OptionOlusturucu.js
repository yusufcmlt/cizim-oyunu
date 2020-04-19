import React, { useEffect, useState } from "react";
import firebase from "firebase";

//Lobideki sure ve tur ayarlarinin veritabanina yazimi ve
//diger uyelerde gosteriminden sorumlu component.
export default function OptionOlusturucu({
  odaKuran,
  selectUyesi,
  oda,
  deger1,
  deger2,
  selectID,
}) {
  //Oyun kurucusu olmama durumunda seceneklere ulasamama ve seceneklerin sadece gosterilmesi
  const [oyuncuSecenekGoster, setOyuncuSecenek] = useState(null);
  //Veritabani referansi
  const optionRef = firebase.database().ref(`oyunlar`);
  //Sayfa degisikliklerinin oyuncuya yansitilmasi
  useEffect(() => {
    optionRef.on("value", (snapshot) => {
      let oyuncuSecenekSnap = snapshot.child(oda).child(selectUyesi).val();
      if (oyuncuSecenekSnap !== null) {
        setOyuncuSecenek(oyuncuSecenekSnap);
      }
    });
  });
  //Seceneklerin oyun kurucusu tarafindan degistirilmesi sonrasi veritabanina yazimi
  const selectChangeHandler = () => {
    const selectValue = document.getElementById(selectID).value;
    if (selectValue !== null) {
      optionRef.once("value", (snapshot) => {
        if (snapshot.child(oda).exists) {
          optionRef.child(oda).child(selectUyesi).set(selectValue);
        }
      });
    }
  };
  //Oda kurucusu olma durumunda seceneklerin gosterilmesi
  if (odaKuran) {
    return (
      <select
        onChange={selectChangeHandler}
        className={"form-control form-control-sm shadow"}
        id={selectID}
      >
        <option id={deger1}>{deger1}</option>
        <option id={deger2}>{deger2}</option>
      </select>
    );
  }
  //Yetkisiz oyuncu olma durumunda seceneklerin sadece gosterimi.
  //Secenekler kurucu yetkisi olmadigi surece degistirilemez
  else {
    return (
      <div className="form-control form-control-sm shadow">
        <div id="oyuncu-gorunen-secenek" className="bg-light text-dark">
          {oyuncuSecenekGoster}
        </div>
      </div>
    );
  }
}
