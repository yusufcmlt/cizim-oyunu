/**
 * -----------Oyun lobi sayfasi---------------:
 * Sayfa icerisinde oyuncular kendi odalarini kurabilirler.
 * Odayi kuran oyuncu adi,sure ve tur sayisi buradan ayarlanir.
 * Odayi kuran ve odaya giris yapan oyuncular burada goruntulenebilir.
 * Oyuncu sayisi 1'den fazla oldugu durumlarda oyun baslatilabilir.
 * Oda linki rastgele olusturulur ve lobidekiler paylasabilir.
 */

import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import linkiKopyala from "../oyun-ogeleri/LinkKopyala";
import firebase from "firebase";
import OyuncuListesi from "./OyuncuListesi";
import { socket } from "../oyun-ogeleri/socketExport";
import OptionOlusturucu from "../oyun-ogeleri/OptionOlusturucu";
import "./LobiSayfasi.css";
const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");

export default function LobiSayfasi(props) {
  /**
   * ----Onceki sayfadan gelen bilgilerin durumu:----
   * Bu sayfaya normal erisilmesi durumunda calismasi
   * LOCATION_REF onceki sayfadan gelen prop u temsil eder
   * undefined olmasi durumunda sayfanin yonlendirilmesi beklenir.
   */
  const LOCATION_REF = props.location.state;
  /**
   * ----Location uzerinden erisilen stateler:----
   * Bu stateler bir onceki sayfadan gelen verilere baglidir
   * Verilerin bos olmasi durumunda 404 sayfasina yonlendirilir
   */
  const [oda] = useState(LOCATION_REF ? LOCATION_REF.oda : "bos-oda");
  const [isim] = useState(LOCATION_REF ? LOCATION_REF.isim : "isim");
  const [oyuncuID] = useState(LOCATION_REF ? LOCATION_REF.id : "oyuncuID");
  const [puan] = useState(LOCATION_REF ? LOCATION_REF.puan : "puan");
  const [odaKurucusu, setKurucu] = useState(
    LOCATION_REF ? LOCATION_REF.odaKurucusu : "odaKurucusu"
  );
  const [sonradanGirme] = useState(
    LOCATION_REF ? LOCATION_REF.sonradanGirme : false
  );
  const [siteDili] = useState(LOCATION_REF ? LOCATION_REF.siteDili : "tr");
  /**
   * ----Sayfa durumuna gore degisen stateler:----
   * Bu stateler socket veya kurucunun etkilerine gore degisir.
   */
  const [kullanicilar, setKullanici] = useState([]);
  const [redirectToAna, setRedirectAna] = useState(false);
  const [redirectToOyun, setRedirectOyun] = useState(false);
  const [oyunSuresi, setOyunSuresi] = useState(60);
  const [oyunTuru, setOyunTuru] = useState(3);
  const [oyunDili, setOyunDili] = useState("Türkçe");
  const [oyunIzin, setOyunIzin] = useState(false);
  const [kopyalaButton, setKopyala] = useState(false);

  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];

  //Socket endpoint ve firebase referansi
  const ENDPOINT = "localhost:5000";
  const dataRef = firebase.database().ref(`oyunlar`);

  useEffect(() => {
    console.log(`Oda:${oda}\nOyuncu ismi:${isim}\nOyuncu ID:${oyuncuID}`);
    //Kullanicilarin lobi sayfasina baglanma durumu.
    //Ayni oda id ile soket odasi acilip icerisine kullanicilar toplanir.
    //Veritabani uzerindeki oyuncuya soket idsi verilir

    //Kullanicinin soket odasina yerlestirilmesi
    //ve oyuncu bilgilerinin veritabaninda oda verisine eklenmesi
    //ekleme cikarma islemleri socket sunucusu tarafinda halledilir.
    //sayfaya bos url uzerinden erisilmesi durumunda sockete verilerin gonderimi engellenmektedir.
    if (oda !== "bos-oda") {
      socket.emit("join", { isim, oda, oyuncuID, puan, odaKurucusu }, () => {});
    } else {
      setRedirectAna(true);
    }
    return () => {
      //Oyuncularin cikma durumunda soket baglantisinin kesilmesi
      //Soket kisminda oyuncu bilgileri veritabanindan da silinir.
      socket.emit("disconnect", { oda });
      socket.off();
    };

    /* eslint-disable-next-line */
  }, [ENDPOINT]);

  useEffect(() => {
    socket.on("odaBilgisi", ({ kullanicilar }) => {
      setKullanici(kullanicilar);
      kullanicilar.map((kullanici) =>
        oyuncuID === kullanici.oyuncuID
          ? setKurucu(kullanici.odaKurucusu)
          : null
      );
    });
    dataRef.on("value", (snapshot) => {
      let oyunTurSure = snapshot.child(oda);
      setOyunSuresi(oyunTurSure.child("sure").val());
      setOyunTuru(oyunTurSure.child("tur").val());
      setOyunDili(oyunTurSure.child("dil").val());

      if (!odaKurucusu) {
        //console.log(oyunTurSure.child("oyunIzin").val());
        setOyunIzin(oyunTurSure.child("oyunIzin").val());
      }
    });
    //Oda kurucusu secilen oyuncu disinda oyun ayarlarinin degistirilmesinin engellenmesi.
    //Ayar seceneklerinin id listesi
    // let oyunAyarSecenekleri = [
    //   "dil-secimi-lobi",
    //   "sure-secimi-lobi",
    //   "tur-secimi-lobi",
    //   "oyunu-baslat-button"
    // ];
    //odaKurucusu durumuna gore seceneklerin engellenebilir veya erisilebilir duruma getirilmesi.
    //Baslatma seceneginin erisilebilir olmasi icin lobide 1 den fazla oyuncu olmasi gerekmektedir.
    // oyunAyarSecenekleri.forEach(ayar => {
    //   if (document.getElementById(ayar) !== null) {
    //     document.getElementById(ayar).disabled = !odaKurucusu;
    //     if (kullanicilar.length <= 1) {
    //       document.getElementById("oyunu-baslat-button").disabled = true;
    //     }
    //   }
    // });
    //Sayfadan cikis durumu.
    return () => {
      dataRef.off();
      socket.emit("disconnect");
      socket.off();
    };
  });
  //Odadan cikilmasi veya sayfanin yenilenmesi durumunda
  //Odada oyuncu bulunmamasi ve tekrar sayfaya ulasilmaya calisilinca
  //anasayfa veya 404 sayfasina yonlendirme
  //Redirect statei true durumuna getirilir ve sayfa renderi ona gore yonlendirme yapar
  useEffect(() => {
    dataRef.on("value", (snapshot) => {
      if (!snapshot.child(oda).exists()) {
        setRedirectAna(true);
      } else {
        setTimeout(function () {
          dataRef.once("value", (snapshot) => {
            if (!snapshot.child(oda).child("oyuncuListesi").exists()) {
              //console.log(snapshot.child(oda).child("oyuncuListesi").val());
              setRedirectAna(true);
            }
          });
        }, 3000);
      }
    });
    return () => {
      dataRef.off();
    };
  });

  //Oyun kurucusunun oyunculari lobiden oyun sayfasina yonlendirmesi:
  //Veritabaninda bulunan oyunBasladi verisinin kontrolu ve sayfanin bu veriye gore yonlendirilmesi
  //Tusa tiklanmasi durumunda veri true durumuna gecerek redirecti calistirir.
  useEffect(() => {
    dataRef.on("value", (snapshot) => {
      if (snapshot.child(oda).child("oyunBasladi").val()) {
        setRedirectOyun(true);
      }
    });
    return () => {
      dataRef.off();
    };
  });
  //Anahtar kopyalama isleminin durumu:
  const handleKopyala = () => {
    if (!kopyalaButton) {
      setKopyala(true);
    }
    linkiKopyala();
  };
  //Oyuna girilebilme izninin ayarlanmasi
  const handleOyunIzin = () => {
    setOyunIzin(!oyunIzin);
    dataRef.child(oda).child("oyunIzin").set(!oyunIzin);
    console.log(
      `${oda} odasina oyuncular ${!oyunIzin ? "GIREBILIR" : "GIREMEZ"}`
    );
  };
  //Button onClick sonrasi oyun baslatma durumunun veritabanina yazilmasi.
  const odayiYonlendir = () => {
    //Bu kisim diger oyuncularin veritabanina gore yonlendirilmesi icin
    dataRef.child(oda).child("oyunBasladi").set(true);
    //Bu ise oyun kurucunun yonlendirilmesi icin.
    //Buttona erisebilen tek kisi kurucu oldugundan diger oyuncular icin erisilemez.
    setRedirectOyun(true);
  };
  //Oyunun baslama stateinin kontrolu ve oyuna yonlendirme.
  if (redirectToOyun) {
    return (
      <Redirect
        to={{
          pathname: process.env.PUBLIC_URL + "/oyun-sayfasi",
          state: {
            oda: oda,
            isim: isim,
            oyuncuID: oyuncuID,
            odaKurucusu: odaKurucusu,
            kullanicilar: kullanicilar,
            oyunSuresi: oyunSuresi,
            oyunTuru: oyunTuru,
            oyunDili: oyunDili,
            siteDili: siteDili,
            sonradanGirme: sonradanGirme,
          },
        }}
      />
    );
  }
  //Redirect stateinin kontrolu ve 404 sayfasina yonlendirme durumu
  if (redirectToAna) {
    return (
      <Redirect
        to={{
          pathname: process.env.PUBLIC_URL + "/404",
          state: { siteDili: siteDili },
        }}
      />
    );
  }
  return (
    <div id="lobisayfasi-dis-container" className="bg-warning">
      <div id="lobisayfasi-ic-container">
        <a
          id="lobisayfasi-logo-container"
          href={process.env.PUBLIC_URL + "/"}
          className="col text-center col-lg-7 anasayfaBaslik rounded-lg text-wrap"
        >
          <h1>Çizim Tahmin Oyunu</h1>
        </a>
        <div id="lobisayfasi-key-container">
          <input
            id="lobisayfasi-key-text"
            className="form-control"
            type="text"
            defaultValue={oda}
            readOnly
          />

          <button
            id="lobisayfasi-copybutton-container"
            className={`btn-sm ${kopyalaButton ? "btn-success" : "btn-danger"}`}
            onClick={() => {
              handleKopyala();
            }}
          >
            {kopyalaButton
              ? SITE_DIL["copy_button_copied"]
              : SITE_DIL["copy_button_not_copied"]}
          </button>
        </div>
        <div id="lobisayfasi-ayar-oyuncu-container">
          <div id="lobisayfasi-ayar-container">
            <label
              className="text-muted h5 text-center"
              htmlFor="lobisayfasi-form-container"
            >
              {SITE_DIL["game_settings"]}
            </label>
            <form id="lobisayfasi-form-container">
              <div id="lobisayfasi-form-dilsecimi-container">
                <label htmlFor="lobisayfasi-dilsecimi">
                  {SITE_DIL["game_settings_language"]}
                </label>
                <OptionOlusturucu
                  odaKuran={odaKurucusu}
                  selectUyesi={"dil"}
                  oda={oda}
                  deger1={"Türkçe"}
                  deger2={"English"}
                  selectID={"lobisayfasi-dilsecimi"}
                />
              </div>
              <div id="lobisayfasi-form-suresecimi-container">
                <label htmlFor="lobisayfasi-suresecimi">
                  {SITE_DIL["game_settings_seconds"]}
                </label>
                <OptionOlusturucu
                  odaKuran={odaKurucusu}
                  selectUyesi={"sure"}
                  oda={oda}
                  deger1={"60"}
                  deger2={"80"}
                  selectID={"lobisayfasi-suresecimi"}
                />
              </div>
              <div id="lobisayfasi-form-tursecimi-container">
                <label htmlFor="lobisayfasi-tursecimi">
                  {SITE_DIL["game_settings_round"]}
                </label>
                <OptionOlusturucu
                  odaKuran={odaKurucusu}
                  selectUyesi={"tur"}
                  oda={oda}
                  deger1={"3"}
                  deger2={"4"}
                  selectID={"lobisayfasi-tursecimi"}
                />
              </div>
              <div id="lobisayfasi-oyunizin-container">
                <button
                  type="button"
                  disabled={!odaKurucusu}
                  className={`btn-sm ${
                    oyunIzin ? "btn-success" : "btn-danger"
                  }`}
                  onClick={() => {
                    handleOyunIzin();
                  }}
                >
                  {oyunIzin
                    ? SITE_DIL["other_players_can_join"]
                    : SITE_DIL["other_players_cannot_join"]}
                </button>
              </div>
            </form>
            <div id="lobisayfasi-oyunubaslat-container">
              <button
                id="lobisayfasi-oyunubaslat-button"
                disabled={odaKurucusu && kullanicilar.length > 1 ? false : true}
                className={
                  odaKurucusu && kullanicilar.length > 1
                    ? "btn-sm shadow btn-success"
                    : "btn-sm shadow btn-secondary text-dark"
                }
                onClick={(event) => odayiYonlendir()}
              >
                {odaKurucusu
                  ? kullanicilar.length > 1
                    ? SITE_DIL["start_the_game"]
                    : SITE_DIL["not_enough_players_button"]
                  : SITE_DIL["no_permission_to_start"]}
              </button>
              {kullanicilar.length < 2 ? (
                <p className="text-danger" id="lobisayfasi-oyunubaslat-uyari">
                  {SITE_DIL["not_enough_players_text"]}
                </p>
              ) : null}
            </div>
          </div>
          <div id="lobisayfasi-border-container"></div>
          <div id="lobisayfasi-oyuncu-container">
            <label className="h5 text-muted">
              {SITE_DIL["players_list"]}
              {`(${kullanicilar.length}/7)`}
            </label>
            <OyuncuListesi
              kullanicilar={kullanicilar}
              oyuncuBen={oyuncuID}
              oyunBasladi={false}
              SITE_DIL={SITE_DIL}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
