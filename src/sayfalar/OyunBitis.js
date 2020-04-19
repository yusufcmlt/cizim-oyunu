/**
 * ----Oyun bitis durumu:----
 * Oyunun bitisi durumunda oyuncular oyun sayfasindan bu componente yonlendirilir
 * Oyuncular bu sayfada siralamalarini gorebilirler.
 */
import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { socket } from "../oyun-ogeleri/socketExport";
const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");

export default function OyunBitis(props) {
  //Onceki sayfadan gelen proplarin tanimi:
  const LOCATION_REF = props.location.state;

  /**
   * ----Component state grubu:----
   * Kullanicilar,oyun birincisi ve anasayfaya yonlendirme durumunu icerir
   * Kullanici bilgisinin oyun sayfasindan gelmesi beklenir.
   */
  const [kullanicilar, setKullanici] = useState(
    LOCATION_REF ? LOCATION_REF.kullanicilar : []
  );
  const [siteDili] = useState(LOCATION_REF ? LOCATION_REF.siteDili : "tr");
  const [oyunBirincisi, setBirinci] = useState("");
  const [redirectToAna, setRedirectAna] = useState(false);

  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];

  /**
   * ----Kullanicilarin siralanmasi ve anasayfaya yonlendirme:----
   * Oyun sayfasindan gelen kullanici listesi puanlarina gore siralanir
   * Belirli bir sure sonra tum kullanicilar anasayfaya yonlendirilir
   */
  useEffect(() => {
    if (kullanicilar.length !== 0) {
      let sortableKullaniciPuan = kullanicilar.slice(0);
      //Kullanici puanlarina gore siralama durumu:
      sortableKullaniciPuan.sort((a, b) => {
        return a.puan - b.puan;
      });
      sortableKullaniciPuan.reverse();
      setBirinci(sortableKullaniciPuan[0].oyuncuID);
      setKullanici(sortableKullaniciPuan);

      /**
       * ----Anaysafaya yonlendirme durumlari:----
       * Kullanici listesinde oyuncular bulunuyorsa puanlar gosterilir
       * 15 saniye sonra ana sayfaya yonlendirilir.
       * Kullanici listesinde oyuncu bulunmuyorsa 5 saniye sonra yonlendirme yapilir.
       */
      setTimeout(function () {
        setRedirectAna(true);
      }, 12000);
    } else {
      setTimeout(function () {
        setRedirectAna(true);
      }, 5000);
    }
    // eslint-disable-next-line
  }, []);

  //Ana sayfa yonlendirme stateine gore yonlendirmenin saglanmasi
  if (redirectToAna) {
    socket.disconnect();
    return (
      <Redirect
        to={{
          pathname: process.env.PUBLIC_URL + "/",
          state: {
            siteDili: siteDili,
          },
        }}
      />
    );
  }
  return (
    <div id="oyun-bitis-container">
      <div id="oyun-bitti-text">
        <h1>
          {kullanicilar.length > 1
            ? SITE_DIL["game_ended_message"]
            : SITE_DIL["game_ended_question"]}
        </h1>
      </div>
      {kullanicilar.length ? (
        <div id="siralama-container">
          {kullanicilar.map((kullanici) => (
            <div
              key={kullanici.oyuncuID}
              id="kullanici-puan-container"
              style={{
                backgroundColor:
                  kullanici.oyuncuID === oyunBirincisi ? "#ff5964" : "#ffffff",
                color: kullanici.oyuncuID === oyunBirincisi ? "#fff" : "#000",
              }}
            >
              <div>{`${kullanicilar.indexOf(kullanici) + 1}.`}</div>
              <div>{kullanici.isim}</div>
              <div>
                {kullanici.puan} {SITE_DIL["points_message"]}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="display-4">? ? ?</div>
      )}
      <div id="yonlendirme-text">
        <p className="h5 mt-5">
          {/* Oyuncu listesi bos ise gosterilecek mesaj: */}
          {kullanicilar.length
            ? SITE_DIL["return_homepage_message"]
            : `${SITE_DIL["wrong_page_message"]} ${SITE_DIL["return_homepage_message"]}`}
        </p>
      </div>
    </div>
  );
}
