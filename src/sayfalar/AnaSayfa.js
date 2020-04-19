//Oyunun ana sayfasi
//Oyuna katilma ve oyun odasi olusturma tuslarini iceriyor ve bu sayfalara yonlendiriyor

import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import AnaSayfaCizim from "./AnaSayfaCizim";
import randomLinkGetir from "../oyun-ogeleri/RastgeleLink";
import jsonAyarla from "../oyun-ogeleri/OyunAyarla";
import { socket } from "../oyun-ogeleri/socketExport";
import randomSayiOlustur from "../oyun-ogeleri/RastgeleSayi";
import "./AnaSayfa.css";

const siteDiliJson = require("../oyun-ogeleri/oyun-dil.json");

export default function AnaSayfa(props) {
  //Oda belirleyici
  //Sayfaya giris durumunda rastgele link adresinin olusturulmasi
  const LOCATION_REF = props.location.state;
  const [siteDili, setSiteDili] = useState(
    LOCATION_REF ? LOCATION_REF.siteDili : "tr"
  );
  const SITE_DIL = siteDiliJson[`oyun-dil_${siteDili}`];
  const [oda, setOda] = useState("");
  const [isim, setIsim] = useState(`Oyuncu${randomSayiOlustur()}`);
  const [oyuncuID, setID] = useState("");
  const [oyunYonlendir, setYonlendirme] = useState(false);
  const [nasilOynanirToggle, setNasilToggle] = useState(false);
  const [loaderToggle, setLoaderToggle] = useState(false);

  //Uygulamaya giris sonrasi kullanilabilecek oda ve oyuncu id verilerinin olusturulmasi.
  //Bu veriler rastgele olusturulur ve oyun boyunca anahtar olarak kullanilabilir.
  useEffect(() => {
    setOda(randomLinkGetir(5));
    setID(randomLinkGetir(7));
    socket.disconnect();
    socket.connect();
  }, []);

  const handleNasilToggle = () => {
    setNasilToggle(!nasilOynanirToggle);
  };
  //Oyuncunun oyun olusturma durumuna gore yonlendirilmesi
  //Oyunu olusturan oyuncunun oyun lobisinden ayrilmasi durumunda
  //lobi sayfasina geri donmesi istenmeyen bir durumdur.
  // Bu durumu asmak icin yonlendirme kullanmilmaktadir.
  if (oyunYonlendir) {
    return (
      <Redirect
        to={{
          pathname: "/oyun-olustur",
          state: {
            oda: oda,
            isim: isim,
            id: oyuncuID,
            puan: 0,
            odaKurucusu: true,
            siteDili: siteDili,
            sonradanGirme: false,
          },
        }}
      />
    );
  }

  return (
    <div id="anasayfa-dis-container" className="bg-warning">
      {loaderToggle ? (
        <div className="anasayfa-loader"></div>
      ) : (
        <div id="anasayfa-ic-container">
          <div id="anasayfa-login-alan-container">
            <a
              href="/"
              id="anasayfa-logo-container"
              className="text-center anasayfaBaslik rounded-lg"
            >
              <p className="h1">Çizim Tahmin Oyunu</p>
            </a>
            <div id="anasayfa-oyuncuadi-container">
              <label htmlFor="oyuncu-adi-input" className="text-muted">
                {SITE_DIL["player_name"]}
              </label>
              <input
                id="oyuncu-adi-input"
                type="text"
                placeholder={isim}
                className="form-control shadow"
                onChange={(event) => setIsim(event.target.value)}
              />
            </div>

            <div id="anasayfa-oyunolustur-container">
              <button
                type="button"
                //Tiklandiginda oda lobisinin olusturulmasi
                //Oda sadece oyuna katilma alanindan erisilebilir.
                //Oyuna giris icin oyun anahtarina ihtiyac vardir.
                className="btn-lg btn-success btn-block"
                onClick={(event) => {
                  setLoaderToggle(true);
                  setTimeout(function () {
                    jsonAyarla(oda);
                    setYonlendirme(true);
                  }, 1000);
                }}
              >
                {SITE_DIL["create_a_game"]}
              </button>
            </div>
            <div id="anasayfa-oyunakatil-container">
              <Link
                //Oyuna katilma alanina erismek icin sadece isme ihtiyac vardir
                //Bu isim diger sayfaya yollanir.
                id="oyunakatil-button-link"
                to={{
                  pathname: "/oyuna-katil",
                  state: { isim: isim, siteDili: siteDili },
                }}
              >
                <button
                  className="btn-lg btn-danger
              btn-block"
                >
                  {SITE_DIL["join_a_game"]}
                </button>
              </Link>
            </div>
            <div id="question-mark-link">
              <a
                rel="noopener noreferrer"
                href="https://i.pinimg.com/736x/f0/02/fa/f002fa7b015cb00f85fe90c51154b57d.jpg"
                target="_blank"
              >
                ?
              </a>
            </div>
          </div>

          <div id="anasayfa-border-alan-container"></div>
          <div id="anasayfa-cizim-alan-container">
            <div>
              <button
                id="nasil-oynanir-button"
                onClick={() => {
                  handleNasilToggle();
                }}
              >
                <p className="h2">{SITE_DIL["how_to_play"]}</p>
              </button>
              {!nasilOynanirToggle ? (
                <div id="cizim-alani-anasayfa">
                  <AnaSayfaCizim />
                </div>
              ) : (
                <div id="nasil-oynanir-container">
                  <p>{SITE_DIL["how_to_play_1"]}</p>
                  <p>{SITE_DIL["how_to_play_2"]}</p>
                  <p>{SITE_DIL["how_to_play_3"]}</p>
                  <p>{SITE_DIL["how_to_play_4"]}</p>
                  <p>{SITE_DIL["how_to_play_5"]}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSiteDili(siteDili !== "tr" ? "tr" : "eng");
              }}
              className="btn-sm btn-success"
            >
              {siteDili === "tr" ? "English" : "Turkce"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
