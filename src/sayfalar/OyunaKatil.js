//----- Odaya katilma sayfasi-----
//Sadece anahtar inputu bulundurur.
//Girilen anahtara gore odaya girebilir
//Inputlar bos olamaz

import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import firebase from "firebase";
import randomLinkGetir from "../oyun-ogeleri/RastgeleLink";
import randomSayiOlustur from "../oyun-ogeleri/RastgeleSayi";
import "./OyunaKatil.css";
const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");
//import { socket } from "../oyun-ogeleri/socketExport";

export default function OyunaKatil(props) {
  const LOCATION_REF = props.location.state;
  //Oyuna katilma sayfa stateleri
  const [oda, setOda] = useState("girilmemis-oda");
  const [oyuncuID] = useState(randomLinkGetir(7));
  const [isim] = useState(
    LOCATION_REF ? LOCATION_REF.isim : `Oyuncu${randomSayiOlustur()}`
  );
  const [siteDili] = useState(LOCATION_REF ? LOCATION_REF.siteDili : "tr");
  const [lobiYonlendirme, setLobiYonlendir] = useState(false);
  const [odaYokMessage, setYokMessage] = useState(false);
  const [rastgeleBulunamadiMessage, setBulunamadiMessage] = useState(false);
  const [loaderRandom, setLoaderRandom] = useState(false);
  const [sonradanGirme] = useState(false);
  const [rastgeleDili, setRastgeleDili] = useState("Türkçe");
  const odaData = firebase.database().ref("oyunlar");
  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];

  useEffect(() => {
    document.getElementById("rastgele-select").value =
      SITE_DIL["random_game_language"];
    setRastgeleDili(SITE_DIL["random_game_language"]);
  }, [SITE_DIL]);
  //Katilinacak odanin kontrolu
  //Yanlislikla olmayan bir oda olusturulmasi veya bos bir oda anahtari girilmesi engellenir.
  const odaKontrolu = (girilenOda) => {
    odaData.once("value", (snapshot) => {
      //Oda listesinde odanin bulunup bulunmadiginin kontrolu.
      //Anahtar girilmezse veya oda yoksa giris engellenir.
      //Oyuncu uyarilir.
      //Oyundaki odalarin listesi->
      let snapshotKeys = Object.keys(snapshot.val());
      //Oyuncunun girdigi oda ismi listede var mi kontrol edilir.
      let odaIndex = snapshotKeys.findIndex((odaGir) => odaGir === oda);
      //Oda ismi bos birakilmis veya listede bulunmuyorsa->
      if (girilenOda === "girilmemis-oda" || odaIndex === -1) {
        //gelenEvent.preventDefault();
        setYokMessage(true);
        setTimeout(function () {
          setYokMessage(false);
        }, 5000);
      }
      //Kullanicinin zaten baslamis bir oyuna girmesinin engellenmesi.
      //Veritabaninda oyunu baslayip baslamadiginin kontrolu.
      else if (
        snapshot.child(girilenOda).child("oyunBasladi").val() ||
        Object.keys(snapshot.child(girilenOda).child("oyuncuListesi").val())
          .length >= 7
      ) {
        //gelenEvent.preventDefault();
        setYokMessage(true);
        setTimeout(function () {
          setYokMessage(false);
        }, 5000);
      } else {
        //Oda sayfasina yonlendirme yapilabileceginin onayi.
        setLobiYonlendir(true);
      }
    });
  };
  /**
   * ----Rastgele oyun bulma:----
   * Oyuncunun rastgele oyun tusuna tiklama durumu
   * Firebase uzerinde var olan oyunlari kontrol eder
   * Istenen duruma uygun olan oyun bulursa oyuncuyu odaya yonlendirir
   * Oyunun dolu olmamasi,dilin istenilen dil olmasi ve oyunun baslamamis olmasi gereklidir.
   */
  const randomOyunBul = () => {
    if (!rastgeleBulunamadiMessage) {
      //Loader animasyonunun gosterimi:
      setLoaderRandom(true);
      //Oyun database kontrolu:
      odaData.once("value", (snapshot) => {
        //Var olan oyunlarin listesinin alinmasi
        let odaListesi = Object.keys(snapshot.val());
        //Oyunda aktif oda olma durumu
        if (odaListesi.length > 1) {
          //Odalarin kontrol durumu ->odalari gezip istek durumlari kontrol etme

          for (
            let randomOdaIndex = 0;
            randomOdaIndex < odaListesi.length;
            randomOdaIndex++
          ) {
            if (odaListesi[randomOdaIndex] !== "placeholder") {
              let odaKontrol = snapshot.child(odaListesi[randomOdaIndex]);
              let odaOyuncuSayisi = odaKontrol.child("oyuncuListesi").exists()
                ? Object.keys(odaKontrol.child("oyuncuListesi").val()).length
                : 0;
              // console.log(
              //   `Oda:${odaListesi[randomOdaIndex]}\nDil:${odaKontrol
              //     .child("dil")
              //     .val()}\nOyun basladi:${odaKontrol
              //     .child("oyunBasladi")
              //     .val()}\nOyun Acik:${odaKontrol
              //     .child("oyunIzin")
              //     .val()}\nOyuncu Sayisi:${odaOyuncuSayisi}`
              // );
              if (
                odaKontrol.child("dil").val() === rastgeleDili &&
                !odaKontrol.child("oyunBasladi").val() &&
                odaKontrol.child("oyunIzin").val() &&
                odaOyuncuSayisi < 7 &&
                odaOyuncuSayisi > 0
              ) {
                setOda(odaListesi[randomOdaIndex]);
                console.log(`Bulunan oda ${odaListesi[randomOdaIndex]}`);
                setLoaderRandom(false);
                return setLobiYonlendir(true);
              } else {
                //Hicbir odanin istenen durumu karsilayamamasi.
                if (randomOdaIndex === odaListesi.length - 2) {
                  setLoaderRandom(false);
                  setBulunamadiMessage(true);
                  setTimeout(function () {
                    setBulunamadiMessage(false);
                  }, 5000);
                }
              }
            }
          }
        }
        if (odaListesi.length === 1) {
          setLoaderRandom(false);
          setBulunamadiMessage(true);
          setTimeout(function () {
            setBulunamadiMessage(false);
          }, 5000);
        }
      });
    }
  };
  //Odanin var oldugunun kontrolu sonrasi oyun odasina yonlendirilme durumu.
  if (lobiYonlendirme) {
    return (
      <Redirect
        to={{
          pathname: process.env.PUBLIC_URL + "/oyun-olustur",
          state: {
            oda: oda,
            isim: isim,
            id: oyuncuID,
            puan: 0,
            odaKurucusu: false,
            siteDili: siteDili,
            sonradanGirme: sonradanGirme,
          },
        }}
      />
    );
  }

  return (
    <div id="oyunakatil-dis-container" className="bg-warning">
      <div id="oyunakatil-ic-container">
        <a
          href={process.env.PUBLIC_URL + "/"}
          id="oyunakatil-logo-container"
          className="text-center anasayfaBaslik rounded-lg"
        >
          <p className="h1">Çizim Tahmin Oyunu</p>
        </a>
        <div id="oyunakatil-input-container">
          <label htmlFor="oda-linki-katil">{SITE_DIL["game_key"]}</label>
          <input
            id="oda-linki-katil"
            className="form-control shadow"
            type="text"
            placeholder={SITE_DIL["paste_game_key_here"]}
            onChange={(event) => {
              setOda(event.target.value);
            }}
          />
          <p id="oyunakatil-aciklama-text" className="text-muted text-center">
            {SITE_DIL["game_key_info_message"]}
          </p>
          {odaYokMessage ? (
            <p className="text-center text-danger">
              {SITE_DIL["no_game_or_permission"]}
            </p>
          ) : null}
        </div>
        <div id="oyunakatil-button-container">
          <button
            id="katil-linki"
            type="button"
            className="btn-lg btn-success"
            onClick={(event) => {
              odaKontrolu(oda);
            }}
          >
            {SITE_DIL["join_game_button"]}
          </button>
        </div>

        <div id="rastgele-button-container">
          {rastgeleBulunamadiMessage ? (
            <p id="oyun_bulunamadi_text" className="text-danger">
              {SITE_DIL["no_random_game_found"]}
            </p>
          ) : loaderRandom ? (
            <div id="random-button-loader"></div>
          ) : (
            <div id="oyunakatil-empty-div"></div>
          )}
          <select
            id="rastgele-select"
            className="form-control"
            onChange={(event) => {
              setRastgeleDili(event.target.value);
            }}
          >
            <option>Türkçe</option>
            <option>English</option>
          </select>
          <button
            id="katil-linki-random"
            type="button"
            className="btn-lg text-light"
            onClick={randomOyunBul}
          >
            {SITE_DIL["random_game_button"]}
          </button>
        </div>
      </div>
    </div>
  );
}
