/**
 * Oyun sayfasi:
 * Ana oyun bu sayfada calismaktadir.
 * Olusturulan lobi cesitli sartlar saglandiginda bu sayfaya aktarilir.
 * Lobi uzerindeki oyuncu listesi yine burada kullanilmaktadir.
 * Logo (anasayfa linki),sure,cizim alani,oyuncu listesi,gizli kelime alani,
 * Cevap alani ve cevaplama buttonundan olusur.
 **/
import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import CizimAlani from "./CizimAlani";
import OyuncuListesi from "./OyuncuListesi";
import KelimeContainer from "./KelimeContainer";
import Timer from "./Timer";
import { socket } from "../oyun-ogeleri/socketExport";
import firebase from "firebase";
const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");

export default function OyunSayfasi(props) {
  /**
   * ----Onceki sayfadan gelen bilgilerin durumu:----
   * Bu sayfaya normal erisilmesi durumunda calismasi
   * LOCATION_REF onceki sayfadan gelen prop u temsil eder
   * undefined olmasi durumunda sayfanin yonlendirilmesi beklenir.
   */
  const LOCATION_REF = props.location.state;

  const [oda] = useState(LOCATION_REF ? LOCATION_REF.oda : "bos-oda");
  const [kullanicilar, setKullanici] = useState(
    LOCATION_REF ? LOCATION_REF.kullanicilar : []
  );
  const [oyuncuID] = useState(LOCATION_REF ? LOCATION_REF.oyuncuID : "");
  const [odaKurucusu, setKurucu] = useState(
    LOCATION_REF ? LOCATION_REF.odaKurucusu : ""
  );
  const [oyunTuru, setOyunTuru] = useState(
    LOCATION_REF ? LOCATION_REF.oyunTuru : 3
  );
  const [oyunDili] = useState(LOCATION_REF ? LOCATION_REF.oyunDili : "Türkçe");
  const [timerSure] = useState(LOCATION_REF ? LOCATION_REF.oyunSuresi : 60);
  const [siteDili] = useState(LOCATION_REF ? LOCATION_REF.siteDili : "tr");
  // const [sonradanGirme] = useState(
  //   LOCATION_REF ? LOCATION_REF.sonradanGirme : false
  // );
  const [oyunSirasi, setSira] = useState("");
  const [kelime, setKelime] = useState("");
  const [kelimeyiGoster, setKelimeGoster] = useState(false);
  const [gonderilenKelime, setGonderilenKelime] = useState("");
  const [kelimeyiBuldu, setKelimeyiBuldu] = useState(false);
  const [redirectToBitis, setRedirectBitis] = useState(false);
  const [redirectToHata, setRedirectHata] = useState(false);
  const [redirectToAna, setRedirectAna] = useState(false);
  const [cizimRengi, setCizimRengi] = useState([51, 51, 153]);
  const [anlikSure, setAnlikSure] = useState(60);
  const [roundPuan, setRoundPuan] = useState(0);
  const dataRefOyun = firebase.database().ref(`oyunlar/${oda}`);
  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];

  let OYUNCU_PUAN = 10;
  let CIZEN_OYUNCU_PUAN = 2;
  //Oda Kurucusunun oyunu baslatmasi
  //Lobi Ayarlarinda secilen sure ve tur degerlerine gore oyun baslar.
  useEffect(() => {
    if (odaKurucusu && oda) {
      socket.emit("timerBaslat", { oda, timerSure, oyunTuru, oyunDili });
    }
    if (!oda) {
      setRedirectHata(true);
    }
    // if (sonradanGirme) {
    //   socket.on("sonradanGirme", ({ randomKelime, siradakiOyuncu }) => {
    //     console.log("Sonradan giren oyuncu");
    //     setKelime(randomKelime);
    //     setSira(siradakiOyuncu);
    //   });
    // }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    dataRefOyun.on("value", (snapshot) => {
      if (!snapshot.exists()) {
        setRedirectHata(true);
      }
    });
    socket.on("kelimeyiGoster", (kelimeGosterDurumu) =>
      setKelimeGoster(kelimeGosterDurumu)
    );
    socket.on("siraDegistir", (siraData) => {
      console.log(`Sira:${siraData} oyuncusunda.`);
      setSira(siraData);
    });

    socket.on("kelimeDegis", (randomKelime) => {
      setKelimeyiBuldu(false);
      setKelime(randomKelime);
      setRoundPuan(0);
    });
    socket.on("odaTuru", (oyunTuru) => setOyunTuru(oyunTuru));
    /* eslint-disable-next-line */
  }, [oyunSirasi, kelime, oyunTuru]);

  useEffect(() => {
    socket.on("odaBilgisi", ({ kullanicilar }) => {
      setKullanici(kullanicilar);
      /* eslint-disable-next-line */
      kullanicilar.map((kullanici) => {
        if (oyuncuID === kullanici.oyuncuID) {
          setKurucu(kullanici.odaKurucusu);
        }
      });
    });
    socket.on("puanGirisi", (cizenOyuncuPuan) =>
      setRoundPuan(roundPuan + cizenOyuncuPuan)
    );
    socket.on("timerDegistir", (timerData) => {
      setAnlikSure(timerData);
    });
    socket.once("oyunBitti", () => {
      handleBitisRedirect();
    });
    socket.once("returnToAna", () => {
      handleBitisRedirect();
    });
    return () => {
      dataRefOyun.off();
      socket.emit("disconnect");
    };
  });
  const handleCizimRengi = (renkArray) => {
    setCizimRengi(renkArray);
  };

  /**
   * ----Puanlama Sistemi:----
   * Kelime bulma durumunda oyuncu ve cizerin puan kazanmasi.
   * Puanlama ne kadar sure kaldigina gore yapilir.
   * Sure ile katsayi carpilir.
   */

  const kelimeyiKontrolEt = () => {
    document.getElementById("cevap-alani").value = "";
    if (gonderilenKelime.trim().toLowerCase() === kelime.toLowerCase()) {
      setKelimeyiBuldu(true);
      OYUNCU_PUAN = Math.floor((OYUNCU_PUAN * anlikSure) / 8) + kelime.length;
      CIZEN_OYUNCU_PUAN =
        Math.floor((CIZEN_OYUNCU_PUAN * anlikSure) / 7) + kelime.length;
      setRoundPuan(OYUNCU_PUAN);
      socket.emit("kelimeBul", { oda, oyuncuID, OYUNCU_PUAN });
      socket.emit("cizenPuan", { oda, oyunSirasi, CIZEN_OYUNCU_PUAN });
      OYUNCU_PUAN = 10;
      CIZEN_OYUNCU_PUAN = 2;
    } else {
      document.getElementById("cevap-alani").placeholder = "Yanlış tahmin...";
      setGonderilenKelime("");
    }
  };
  const handleBitisRedirect = () => {
    socket.off();
    setRedirectBitis(true);
  };

  if (redirectToBitis) {
    return (
      <Redirect
        to={{
          pathname: "/oyun-bitis",
          state: {
            oda: oda,
            kullanicilar: kullanicilar,
            siteDili: siteDili,
          },
        }}
      />
    );
  }
  return (
    <div id="oyun-dis-container" className="bg-warning">
      <div id="oyun-ic-container">
        <div id="oyun-timer-info-container">
          <div id="timer-container">
            <Timer sure={timerSure} />
          </div>
          <div id="last-message-container">
            <div
              id="last-message"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.321)",
                color: "black",
              }}
            >
              <b>
                {SITE_DIL["turn_message"]}
                {/* eslint-disable-next-line */}
                {kullanicilar.map((kullanici) => {
                  if (kullanici.oyuncuID === oyunSirasi) {
                    return kullanici.isim;
                  }
                })}
              </b>
            </div>
            <div
              id="last-message"
              style={{
                backgroundColor: "rgba(94, 93, 93, 0.321)",
                color: "white",
              }}
            >
              {oyunTuru > 0 ? (
                <b>
                  {SITE_DIL["rounds_left_message"]}
                  {oyunTuru}
                </b>
              ) : (
                <b>{SITE_DIL["last_round_message"]}</b>
              )}
            </div>
          </div>
          <button
            id="oyun-cikis-button"
            className="btn-sm btn-secondary"
            onClick={() => setRedirectAna(true)}
          >
            X
          </button>
        </div>
        <div id="oyun-cizim-liste-container">
          <div id="cizim-container">
            {kelimeyiGoster ? (
              <div id="kelime-gosterme-oyun" style={{ textAlign: "center" }}>
                <p id="kelime-bilgisi-oyun">
                  {SITE_DIL["show_word_message"]}
                  {kelime}
                  <br />
                  {`+${roundPuan} ${SITE_DIL["show_points_message"]}`}
                </p>
              </div>
            ) : (
              <div id="cizim-alani-container">
                <CizimAlani
                  id="cizim-alani"
                  odaID={oda}
                  cizmeSirasi={oyunSirasi}
                  oyuncuID={oyuncuID}
                  redirectToHata={redirectToHata}
                  redirectToAna={redirectToAna}
                  cizimRengi={cizimRengi}
                  siteDili={siteDili}
                />
              </div>
            )}
          </div>
          <div id="border-container"></div>
          <div id="oyuncular-container">
            <p id="oyuncular-text">{SITE_DIL["players_list_ingame"]}</p>
            <div id="oyuncular-liste-container">
              <OyuncuListesi
                kullanicilar={kullanicilar}
                oyuncuBen={oyuncuID}
                oyunBasladi={true}
                siradakiOyuncu={oyunSirasi}
                SITE_DIL={SITE_DIL}
              />
            </div>
          </div>
        </div>
        <div id="oyun-kelime-cevap-container">
          <div
            id="kelime-container"
            style={{ visibility: kelime ? "visible" : "hidden" }}
          >
            <div>
              <KelimeContainer
                siradakiOyuncu={oyunSirasi}
                oyuncuID={oyuncuID}
                kelime={kelime}
              />
            </div>
          </div>
          <div id="cevap-form-container">
            {oyunSirasi === oyuncuID ? (
              <div className="form-control form-control-sm  text-center align-middle">
                {SITE_DIL["your_turn_message"]}
              </div>
            ) : (
              <input
                id="cevap-alani"
                className="form-control text-center align-middle"
                type="text"
                placeholder={
                  kelimeyiBuldu
                    ? SITE_DIL["you_found_the_word_message"]
                    : SITE_DIL["type_your_answer_here"]
                }
                onChange={(event) => setGonderilenKelime(event.target.value)}
              />
            )}
          </div>
          <div id="empty-div-cevap">
            <button
              className="renk-button"
              id="cyan-renk-button"
              onClick={() => handleCizimRengi([51, 51, 153])}
            ></button>
            <button
              className="renk-button"
              id="yellow-renk-button"
              onClick={() => handleCizimRengi([204, 51, 0])}
            ></button>
            <button
              className="renk-button"
              id="green-renk-button"
              onClick={() => handleCizimRengi([0, 153, 0])}
            ></button>
            <button
              className="renk-button"
              id="pink-renk-button"
              onClick={() => handleCizimRengi([204, 0, 153])}
            ></button>
          </div>
          <div>
            <button
              id="button-cevap-oyun"
              disabled={oyunSirasi === oyuncuID || kelimeyiBuldu ? true : false}
              className={`btn-sm ${
                oyunSirasi === oyuncuID || kelimeyiBuldu
                  ? "btn-secondary text-dark"
                  : "btn-success"
              } text-center`}
              onClick={kelimeyiKontrolEt}
            >
              {oyunSirasi === oyuncuID || kelimeyiBuldu
                ? SITE_DIL["you_cannot_answer_button"]
                : SITE_DIL["answer_button"]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
